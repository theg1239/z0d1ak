import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  Adapter,
  AdapterUser,
  AdapterSession,
  AdapterAccount,
  VerificationToken,
} from "next-auth/adapters";
import { users, accounts, sessions, verificationTokens } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

type PartialUser = Partial<AdapterUser> & { id: string };

type AccountIdentifier = {
  provider: string;
  providerAccountId: string;
};

type VerificationTokenType = {
  identifier: string;
  token: string;
  expires: Date;
};

function convertUser(row: any): AdapterUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    emailVerified: row.emailVerified ? new Date(row.emailVerified) : null,
  };
}

export function DrizzleAdapter(db: PostgresJsDatabase): Adapter {
  const adapter: Adapter = {
    async createUser(user: AdapterUser) {
      const result = await db
        .insert(users)
        .values({
          name: user.name ?? "",
          email: user.email,
          image: user.image ?? null,
        })
        .returning();

      if (!result.length) throw new Error("Failed to create user");
      return convertUser(result[0]);
    },

    async getUser(id: string) {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result.length ? convertUser(result[0]) : null;
    },

    async getUserByEmail(email: string) {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result.length ? convertUser(result[0]) : null;
    },

    async getUserByAccount({ provider, providerAccountId }: AccountIdentifier) {
      const result = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)));
      
      if (!result.length) return null;
      return adapter.getUser ? await adapter.getUser(result[0].userId) : null;
    },

    async updateUser(user: PartialUser) {
      const result = await db
        .update(users)
        .set({
          name: user.name ?? "",
          email: user.email ?? "",
          image: user.image ?? null,
        })
        .where(eq(users.id, user.id))
        .returning();

      if (!result.length) throw new Error("Failed to update user");
      return convertUser(result[0]);
    },

    async deleteUser(userId: string) {
      await db.delete(users).where(eq(users.id, userId));
    },

    async linkAccount(account: AdapterAccount) {
      await db.insert(accounts).values(account);
    },

    async unlinkAccount({ provider, providerAccountId }: AccountIdentifier) {
      await db.delete(accounts).where(and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)));
    },

    async createSession(session: AdapterSession) {
      const result = await db.insert(sessions).values(session).returning();
      if (!result.length) throw new Error("Failed to create session");
      return result[0];
    },

    async getSessionAndUser(sessionToken: string) {
      const sessionResult = await db.select().from(sessions).where(eq(sessions.sessionToken, sessionToken));
      if (!sessionResult.length) return null;

      const user = adapter.getUser ? await adapter.getUser(sessionResult[0].userId) : null;
      if (!user) return null;

      return { session: sessionResult[0], user };
    },

    async updateSession(session: Partial<AdapterSession> & { sessionToken: string }) {
      if (!session.userId) return null;
      const result = await db.update(sessions).set({ expires: session.expires ?? new Date() }).where(eq(sessions.sessionToken, session.sessionToken)).returning();
      return result.length ? result[0] : null;
    },

    async deleteSession(sessionToken: string) {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },

    async createVerificationToken(token: VerificationToken) {
      const result = await db.insert(verificationTokens).values(token).returning();
      if (!result.length) throw new Error("Failed to create verification token");
      return result[0];
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const result = await db
        .select()
        .from(verificationTokens)
        .where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, token)));

      if (!result.length) return null;

      await db
        .delete(verificationTokens)
        .where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, token)));

      return result[0];
    },
  };

  return adapter;
}

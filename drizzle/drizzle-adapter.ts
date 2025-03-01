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
  return {
    async createUser(user: { name?: string | null; email: string; image?: string | null; emailVerified?: Date | null }): Promise<AdapterUser> {
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

    async getUser(id: string): Promise<AdapterUser | null> {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0] ? convertUser(result[0]) : null;
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result[0] ? convertUser(result[0]) : null;
    },

    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }): Promise<AdapterUser | null> {
      const result = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)));

      if (!result[0]) return null;
      return this.getUser ? await this.getUser(result[0].userId) : null;
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }): Promise<AdapterUser> {
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

    async deleteUser(userId: string): Promise<void> {
      await db.delete(users).where(eq(users.id, userId));
    },

    async linkAccount(account: AdapterAccount): Promise<AdapterAccount> {
      const result = await db
        .insert(accounts)
        .values({
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refreshToken: account.refresh_token ?? null,
          accessToken: account.access_token ?? null,
          expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
          tokenType: account.token_type ?? null,
          scope: account.scope ?? null,
          idToken: account.id_token ?? null,
          sessionState: account.session_state ?? null,
        })
        .returning();

      if (!result.length) throw new Error("Failed to link account");
      return result[0] as AdapterAccount;
    },

    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }): Promise<void> {
      await db
        .delete(accounts)
        .where(and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)));
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }): Promise<AdapterSession> {
      const result = await db.insert(sessions).values(session).returning();
      if (!result.length) throw new Error("Failed to create session");
      return result[0] as AdapterSession;
    },

    async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      const sessionResult = await db.select().from(sessions).where(eq(sessions.sessionToken, sessionToken));
      if (!sessionResult[0]) return null;

      const user = this.getUser ? await this.getUser(sessionResult[0].userId) : null;
      if (!user) return null;

      return { session: sessionResult[0] as AdapterSession, user };
    },

    async updateSession(session: Partial<AdapterSession> & { sessionToken: string }): Promise<AdapterSession | null> {
      if (!session.userId) return null;

      const result = await db
        .update(sessions)
        .set({ expires: session.expires ?? new Date() })
        .where(eq(sessions.sessionToken, session.sessionToken))
        .returning();

      return result.length ? (result[0] as AdapterSession) : null;
    },

    async deleteSession(sessionToken: string): Promise<void> {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },

    async createVerificationToken(token: { identifier: string; token: string; expires: Date }): Promise<VerificationToken> {
      const result = await db
        .insert(verificationTokens)
        .values({
          identifier: token.identifier,
          token: token.token,
          expires: token.expires,
        })
        .returning();

      if (!result.length) throw new Error("Failed to create verification token");

      return {
        identifier: result[0].identifier,
        token: result[0].token,
        expires: result[0].expires,
      };
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }): Promise<VerificationToken | null> {
      const result = await db
        .select()
        .from(verificationTokens)
        .where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, token)));

      if (!result[0]) return null;

      await db
        .delete(verificationTokens)
        .where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, token)));

      return {
        identifier: result[0].identifier,
        token: result[0].token,
        expires: result[0].expires,
      };
    },
  };
}

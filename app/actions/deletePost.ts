"use server";

import { db } from "@/lib/db";
import { posts, post_tags } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  await db.delete(post_tags).where(eq(post_tags.postId, postId));
  
  const result = await db.delete(posts).where(eq(posts.id, postId)).returning();

  if (!result.length) {
    throw new Error("Post not found or deletion failed");
  }

  return result[0];
}

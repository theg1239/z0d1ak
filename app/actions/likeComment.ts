"use server";

import { db } from "@/lib/db";
import { likes, comments, users } from "@/drizzle/schema";
import { eq, count, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function likePost(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  // Check if user has already liked the post using and()
  const existingLike = await db
    .select()
    .from(likes)
    .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));

  if (existingLike.length > 0) {
    // If liked already, remove the like (unlike)
    await db
      .delete(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
  } else {
    // Otherwise, add a like
    await db.insert(likes).values({ postId, userId, createdAt: new Date() });
  }

  // Get the updated likes count using count() correctly
  const countResult = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.postId, postId));

  const newCount = countResult[0]?.count || 0;
  // Determine hasLiked: if there was no existing like, now the user has liked the post
  const hasLiked = existingLike.length === 0;

  return { likes: newCount, hasLiked };
}

export async function addComment(postId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  // Insert the comment into the database
  const insertResult = await db
    .insert(comments)
    .values({ postId, userId, content, createdAt: new Date(), updatedAt: new Date() })
    .returning();
  
  const commentId = insertResult[0].id;

  // Fetch the inserted comment joined with the user's info so that the returned comment includes a "user" field
  const [comment] = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      user: { name: users.name, image: users.image },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.id, commentId));

  return comment;
}

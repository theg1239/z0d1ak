"use server";

import { db } from "@/lib/db";
import { likes, comments, users } from "@/drizzle/schema"; // Ensure 'users' is imported
import { eq, count, and, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function likePost(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  // Ensure postId and userId are properly referenced
  const existingLike = await db
    .select()
    .from(likes)
    .where(and(eq(likes.postId, postId as any), eq(likes.userId, userId as any)));

  if (existingLike.length > 0) {
    // Unlike: remove the existing like
    await db
      .delete(likes)
      .where(and(eq(likes.postId, postId as any), eq(likes.userId, userId as any)));
  } else {
    // Like: insert a new like
    await db.insert(likes).values({ postId, userId, createdAt: new Date() });
  }

  // Get the updated likes count
  const countResult = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.postId, postId as any));

  const newCount = countResult[0]?.count || 0;
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

  // Fetch the inserted comment with the user info (join)
  const [comment] = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      user: { name: users.name, image: users.image }
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.id, commentId as any));

  // Convert the createdAt date to an ISO string before returning
  return {
    ...comment,
    createdAt: comment.createdAt ? new Date(comment.createdAt).toISOString() : ""
  };
}

export async function getLikes(postId: string) {
  const session = await getServerSession(authOptions);
  let hasLiked = false;

  if (session && session.user && session.user.id) {
    const userLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId as any), eq(likes.userId, session.user.id as any)));
    hasLiked = userLike.length > 0;
  }

  const countResult = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.postId, postId as any));

  const likesCount = countResult[0]?.count ?? 0;
  return { likes: likesCount, hasLiked };
}

export async function getComments(postId: string) {
  const commentsData = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      user: { name: users.name, image: users.image }
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId as any))
    .orderBy(desc(comments.createdAt))

  // Convert each comment's createdAt to an ISO string
  return commentsData.map((comment) => ({
    ...comment,
    createdAt: comment.createdAt ? new Date(comment.createdAt).toISOString() : ""
  }));
}

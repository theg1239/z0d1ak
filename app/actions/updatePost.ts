"use server";

import { db } from "@/lib/db";
import { posts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export interface UpdatePostInput {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  isDraft: boolean;
  categoryId: string;
}

export async function updatePost(data: UpdatePostInput) {
  console.log("Updating post with data:", data);
  const updated = await db
    .update(posts)
    .set({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      isDraft: data.isDraft,
      categoryId: data.categoryId,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, data.id))
    .returning();
  console.log("Update result:", updated);
  return updated[0];
}

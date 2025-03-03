"use server";

import { db } from "@/lib/db";
import { posts, tags, post_tags } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export interface UpdatePostInput {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  isDraft: boolean;
  categoryId: string;
  tags?: string[];
}

export async function updatePost(data: UpdatePostInput) {
  console.log("Updating post with data:", data);

  const updatedPost = await db
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
  
  if (!updatedPost.length) {
    throw new Error("Post not found or update failed");
  }

  console.log("Post updated:", updatedPost[0]);

  const postId = data.id;

  if (data.tags) {
    await db.delete(post_tags).where(eq(post_tags.postId, postId));

    for (const tagName of data.tags) {
      const trimmedTag = tagName.trim();
      if (!trimmedTag) continue;

      const existingTag = await db
        .select()
        .from(tags)
        .where(eq(tags.name, trimmedTag))
        .limit(1);

      let tagId: string;
      if (existingTag.length > 0) {
        tagId = existingTag[0].id;
      } else {
        const newTag = await db
          .insert(tags)
          .values({ name: trimmedTag })
          .returning();
        tagId = newTag[0].id;
      }

      await db.insert(post_tags).values({ postId, tagId });
    }
  }

  return updatedPost[0];
}

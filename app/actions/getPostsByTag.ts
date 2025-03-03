"use server";

import { db } from "@/lib/db";
import { posts, post_tags } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function getPostsByTag(tagId: string) {
  const postsForTag = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
    })
    .from(posts)
    .leftJoin(post_tags, eq(posts.id, post_tags.postId))
    .where(and(eq(post_tags.tagId, tagId), eq(posts.isDraft, false)));

  return postsForTag;
}

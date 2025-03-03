"use server";

import { db } from "@/lib/db";
import { posts, post_tags, tags } from "@/drizzle/schema";
import { eq, not, and, desc, sql } from "drizzle-orm";

export async function getRelatedPosts(currentPostId: string, categoryId: string, limit = 2) {
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      createdAt: posts.createdAt,
      tags: sql<string>`COALESCE(array_agg(${tags.name}), '{}')`.as("tags"),
    })
    .from(posts)
    .leftJoin(post_tags, eq(posts.id, post_tags.postId))
    .leftJoin(tags, eq(post_tags.tagId, tags.id))
    .where(
      and(
        eq(posts.categoryId, categoryId),
        not(eq(posts.id, currentPostId)),
        eq(posts.isDraft, false)
      )
    )
    .groupBy(posts.id)
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  return result.map((post) => ({
    ...post,
    createdAt: post.createdAt?.toISOString() ?? "",
    tags: post.tags ? JSON.parse(post.tags) : [],
  }));
}

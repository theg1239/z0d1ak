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
      tags: sql<string>`
        COALESCE(
          array_to_json(array_remove(array_agg(DISTINCT ${tags.name}), null)),
          '[]'
        )
      `.as("tags"),
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
    tags:
      typeof post.tags === "string" && post.tags.length > 0
        ? JSON.parse(post.tags)
        : Array.isArray(post.tags)
        ? post.tags
        : [],
  }));
}

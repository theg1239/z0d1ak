"use server";

import { db } from "@/lib/db";
import { posts, post_tags, tags, categories } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

export async function getPostsByTag(tagId: string) {
  const postsForTag = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      tags: sql<string>`COALESCE(array_to_json(array_remove(array_agg(DISTINCT ${tags.name}), null)), '[]')`.as("tags"),
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(post_tags, eq(posts.id, post_tags.postId))
    .leftJoin(tags, eq(post_tags.tagId, tags.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(post_tags.tagId, tagId), eq(posts.isDraft, false)))
    .groupBy(posts.id, categories.name);

  return postsForTag.map((post) => ({
    ...post,
    tags:
      typeof post.tags === "string" && post.tags.length > 0
        ? JSON.parse(post.tags)
        : Array.isArray(post.tags)
        ? post.tags
        : [],
  }));
}

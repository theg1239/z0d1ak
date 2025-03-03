"use server";

import { db } from "@/lib/db";
import { posts, categories, tags, post_tags } from "@/drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function getUserPosts(userId: string) {
  if (!isValidUUID(userId)) {
    return [];
  }

  const userPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      createdAt: posts.createdAt,
      categoryName: categories.name,
      isDraft: posts.isDraft,
      tags: sql<string>`
        COALESCE(
          array_to_json(array_remove(array_agg(DISTINCT ${tags.name}), null)),
          '[]'
        )
      `.as("tags"),
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(post_tags, eq(posts.id, post_tags.postId))
    .leftJoin(tags, eq(post_tags.tagId, tags.id))
    .where(eq(posts.authorId, userId))
    .groupBy(posts.id, categories.name)
    .orderBy(desc(posts.createdAt));

  return userPosts.map((post) => ({
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

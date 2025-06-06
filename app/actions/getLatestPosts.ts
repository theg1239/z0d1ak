"use server";

import { db } from "@/lib/db";
import { posts, categories, users, post_tags, tags } from "@/drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getLatestPosts(limit: number = 3) {
  console.log("getLatestPosts: fetching latest posts with limit:", limit);

  const latestPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      createdAt: posts.createdAt,
      categoryName: categories.name,
      author: {
        name: users.name,
      },
      tags: sql<string>`
        COALESCE(
          array_to_json(
            array_remove(array_agg(DISTINCT ${tags.name}), null)
          ),
          '[]'
        )
      `.as("tags"),
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(post_tags, eq(posts.id, post_tags.postId))
    .leftJoin(tags, eq(post_tags.tagId, tags.id))
    .where(eq(posts.isDraft, false))
    .groupBy(posts.id, categories.name, users.name)
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  console.log("getLatestPosts: raw query result:", latestPosts);

  const mappedPosts = latestPosts.map((post) => ({
    ...post,
    createdAt: post.createdAt?.toISOString() ?? "",
    tags:
      typeof post.tags === "string" && post.tags.length > 0
        ? JSON.parse(post.tags)
        : Array.isArray(post.tags)
        ? post.tags
        : [],
  }));

  console.log("getLatestPosts: mapped posts:", mappedPosts);
  return mappedPosts;
}

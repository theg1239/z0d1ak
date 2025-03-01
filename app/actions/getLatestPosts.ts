"use server";

import { db } from "@/lib/db";
import { posts, categories, users } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

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
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.isDraft, false))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  console.log("getLatestPosts: raw query result:", latestPosts);

  const mappedPosts = latestPosts.map((post) => ({
    ...post,
    createdAt: post.createdAt?.toISOString() ?? "",
  }));

  console.log("getLatestPosts: mapped posts:", mappedPosts);
  return mappedPosts;
}

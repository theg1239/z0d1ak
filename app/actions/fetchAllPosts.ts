"use server";

import { db } from "@/lib/db";
import { posts, categories, users, post_tags, tags } from "@/drizzle/schema";
import { eq, desc, like, and, count, sql } from "drizzle-orm";

export interface FetchPostsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

export async function fetchAllPosts({
  page = 1,
  limit = 10,
  categoryId,
  search,
}: FetchPostsParams = {}) {
  console.log("fetchAllPosts called with:", { page, limit, categoryId, search });

  const offset = (page - 1) * limit;
  const conditions = [eq(posts.isDraft, false)];

  if (categoryId) {
    conditions.push(eq(posts.categoryId, categoryId));
  }
  if (search) {
    conditions.push(like(posts.title, `%${search}%`));
  }

  const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

  const postsResult = await db
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
      tags: sql<string>`COALESCE(array_agg(DISTINCT ${tags.name}), '[]')`.as("tags"),
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(post_tags, eq(posts.id, post_tags.postId))
    .leftJoin(tags, eq(post_tags.tagId, tags.id))
    .where(whereCondition)
    .groupBy(posts.id, categories.name, users.name)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ total: count() })
    .from(posts)
    .where(whereCondition);

  const totalCount = countResult[0]?.total ?? 0;

  console.log("fetchAllPosts posts:", postsResult, "totalCount:", totalCount);

  const formattedPosts = postsResult.map((post) => ({
    ...post,
    createdAt: post.createdAt?.toISOString() ?? "",
    tags: post.tags ? JSON.parse(post.tags) : [],
  }));

  return { posts: formattedPosts, totalCount, page, limit };
}

"use server";

import { db } from "@/lib/db";
import { posts, categories, users } from "@/drizzle/schema";
import { eq, desc, like, and, count } from "drizzle-orm";

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

  const conditions = [];
  conditions.push(eq(posts.isDraft, false));

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
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(whereCondition)
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
  }));

  return { posts: formattedPosts, totalCount, page, limit };
}

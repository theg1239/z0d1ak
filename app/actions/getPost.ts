"use server";

import { db } from "@/lib/db";
import { posts, users, categories } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function getPostBySlug(slug: string) {
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      content: posts.content,
      createdAt: posts.createdAt,
      category: categories.name,
      author: {
        name: users.name,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.slug, slug), eq(posts.isDraft, false)));

  return result[0] || null;
}

export async function getPostById(id: string) {
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      content: posts.content,
      isDraft: posts.isDraft,
      categoryId: posts.categoryId,
      createdAt: posts.createdAt,
      category: categories.name,
      author: {
        name: users.name,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.id, id));
  return result[0] || null;
}

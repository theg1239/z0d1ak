"use server";

import { db } from "@/lib/db";
import { posts, users, categories } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function getPostBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  console.log("getPostBySlug called with slug:", slug);
  console.log("Decoded slug:", decodedSlug);

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
    .where(and(eq(posts.slug, decodedSlug), eq(posts.isDraft, false)));

  console.log("getPostBySlug: raw query result:", result);
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

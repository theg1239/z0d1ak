"use server";

import { db } from "@/lib/db";
import { posts, users, categories, post_tags, tags } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

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
      tags: sql<string>`COALESCE(array_agg(${tags.name}), '[]')`.as("tags"),
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(post_tags, eq(posts.id, post_tags.postId))
    .leftJoin(tags, eq(post_tags.tagId, tags.id))
    .where(and(eq(posts.slug, decodedSlug), eq(posts.isDraft, false)))
    .groupBy(posts.id, categories.name, users.name);

  console.log("getPostBySlug: raw query result:", result);
  if (!result[0]) return null;
  const post = result[0];
  return {
    ...post,
    createdAt: post.createdAt?.toISOString() ?? "",
    tags: post.tags ? JSON.parse(post.tags) : [],
  };
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
      tags: sql<string>`COALESCE(array_agg(${tags.name}), '[]')`.as("tags"),
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(post_tags, eq(posts.id, post_tags.postId))
    .leftJoin(tags, eq(post_tags.tagId, tags.id))
    .where(eq(posts.id, id))
    .groupBy(posts.id, categories.name, users.name);

  if (!result[0]) return null;
  const post = result[0];
  return {
    ...post,
    createdAt: post.createdAt?.toISOString() ?? "",
    tags: post.tags ? JSON.parse(post.tags) : [],
  };
}

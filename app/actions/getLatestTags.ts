"use server";

import { db } from "@/lib/db";
import { tags, post_tags, posts } from "@/drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function getLatestCompetitions(limit: number = 5) {
  const competitions = await db
    .select({
      id: tags.id,
      name: tags.name,
      latestPost: sql<Date>`MAX(${posts.createdAt})`.as("latestPost"),
      postCount: sql<number>`COUNT(${posts.id})`.as("postCount"),
    })
    .from(tags)
    .leftJoin(post_tags, eq(tags.id, post_tags.tagId))
    .leftJoin(posts, eq(post_tags.postId, posts.id))
    .where(eq(posts.isDraft, false))
    .groupBy(tags.id)
    .orderBy(desc(sql`MAX(${posts.createdAt})`))
    .limit(limit);

    return competitions.map((comp) => ({
      ...comp,
      latestPost: comp.latestPost ? new Date(comp.latestPost).toISOString() : null,
    }));    
}

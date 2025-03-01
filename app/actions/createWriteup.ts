"use server";

import { db } from "@/lib/db";
import { posts } from "@/drizzle/schema";
import { nanoid } from "nanoid";
import { validate as isValidUUID } from "uuid";

const CATEGORY_UUIDS: Record<string, string> = {
  web: "11111111-1111-1111-1111-111111111111",
  crypto: "22222222-2222-2222-2222-222222222222",
  forensics: "33333333-3333-3333-3333-333333333333",
  reverse: "44444444-4444-4444-4444-444444444444",
  pwn: "55555555-5555-5555-5555-555555555555",
  misc: "66666666-6666-6666-6666-666666666666",
};

export async function createWriteup(data: {
  title: string;
  categoryId: string;
  content: string;
  authorId: string;
  isDraft?: boolean;
}) {
  let providedCategory = data.categoryId.trim() || "misc";
  let categoryUUID = providedCategory;
  if (!isValidUUID(categoryUUID)) {
    const mappedUUID = CATEGORY_UUIDS[providedCategory.toLowerCase()];
    if (!mappedUUID || !isValidUUID(mappedUUID)) {
      throw new Error("Invalid category identifier provided.");
    }
    categoryUUID = mappedUUID;
  }

  const excerpt =
    data.content.substring(0, 150) + (data.content.length > 150 ? "..." : "");
  const slug =
    data.title.toLowerCase().replace(/\s+/g, "-") + "-" + nanoid(5);

  const newPost = await db
    .insert(posts)
    .values({
      title: data.title,
      slug,
      excerpt,
      content: data.content,
      categoryId: categoryUUID,
      authorId: data.authorId,
      isDraft: data.isDraft ?? false,
    })
    .returning();

  return newPost;
}

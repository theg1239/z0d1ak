"use server";

import { db } from "@/lib/db";
import { posts } from "@/drizzle/schema";
import { nanoid } from "nanoid";
import { validate as isValidUUID } from "uuid";
import { fetchCategoriesAction } from "@/app/actions/fetchCategories";

async function resolveCategoryUUID(providedCategory: string): Promise<string> {
  const trimmed = providedCategory.trim() || "misc";
  
  if (isValidUUID(trimmed)) {
    return trimmed;
  }
  
  const allCategories = await fetchCategoriesAction();
  
  const matchedCategory = allCategories.find(
    (cat) => cat.name.toLowerCase() === trimmed.toLowerCase()
  );

  if (!matchedCategory || !isValidUUID(matchedCategory.id)) {
    throw new Error("Invalid category identifier provided.");
  }

  return matchedCategory.id;
}

export async function createWriteup(data: {
  title: string;
  categoryId: string;
  content: string;
  authorId: string;
  isDraft?: boolean;
}) {
  const categoryUUID = await resolveCategoryUUID(data.categoryId);

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

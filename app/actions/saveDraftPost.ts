"use server";

import { db } from "@/lib/db";
import { posts, categories } from "@/drizzle/schema";
import { nanoid } from "nanoid";
import { validate as isValidUUID } from "uuid";
import { eq } from "drizzle-orm";
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

export async function saveDraftPost(data: {
  title: string;
  categoryId: string;
  content: string;
  authorId: string;
  draftId?: string | null;
}) {
  const categoryUUID = await resolveCategoryUUID(data.categoryId);

  const excerpt =
    data.content.substring(0, 150) + (data.content.length > 150 ? "..." : "");

  if (data.draftId) {
    const updatedDraft = await db
      .update(posts)
      .set({
        title: data.title,
        categoryId: categoryUUID,
        content: data.content,
        excerpt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, data.draftId))
      .returning();
    return updatedDraft[0];
  } else {
    const slug =
      data.title.toLowerCase().replace(/\s+/g, "-") + "-" + nanoid(5);
    const newDraft = await db
      .insert(posts)
      .values({
        title: data.title,
        slug,
        excerpt,
        content: data.content,
        categoryId: categoryUUID,
        authorId: data.authorId,
        isDraft: true,
      })
      .returning();
    return newDraft[0];
  }
}

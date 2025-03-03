"use server";

import { db } from "@/lib/db";
import { posts, tags, post_tags } from "@/drizzle/schema";
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
  tags?: string[];
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

    if (!updatedDraft.length) {
      throw new Error("Draft not found or update failed");
    }

    const postId = data.draftId;

    if (data.tags) {
      await db.delete(post_tags).where(eq(post_tags.postId, postId));

      for (const tagName of data.tags) {
        const trimmedTag = tagName.trim();
        if (!trimmedTag) continue;

        const existingTag = await db
          .select()
          .from(tags)
          .where(eq(tags.name, trimmedTag))
          .limit(1);

        let tagId: string;
        if (existingTag.length > 0) {
          tagId = existingTag[0].id;
        } else {
          const newTag = await db
            .insert(tags)
            .values({ name: trimmedTag })
            .returning();
          tagId = newTag[0].id;
        }

        await db.insert(post_tags).values({ postId, tagId });
      }
    }

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

    if (!newDraft.length) {
      throw new Error("Failed to create draft");
    }

    const postId = newDraft[0].id;

    if (data.tags) {
      for (const tagName of data.tags) {
        const trimmedTag = tagName.trim();
        if (!trimmedTag) continue;

        const existingTag = await db
          .select()
          .from(tags)
          .where(eq(tags.name, trimmedTag))
          .limit(1);

        let tagId: string;
        if (existingTag.length > 0) {
          tagId = existingTag[0].id;
        } else {
          const newTag = await db
            .insert(tags)
            .values({ name: trimmedTag })
            .returning();
          tagId = newTag[0].id;
        }

        await db.insert(post_tags).values({ postId, tagId });
      }
    }

    return newDraft[0];
  }
}

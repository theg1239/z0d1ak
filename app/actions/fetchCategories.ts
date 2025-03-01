"use server";

import { db } from "@/lib/db";
import { categories } from "@/drizzle/schema";

export async function fetchCategoriesAction() {
  const categoriesList = await db.select().from(categories);
  return categoriesList;
}

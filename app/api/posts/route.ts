import { NextResponse } from "next/server";
import { getPostsByTag } from "@/app/actions/getPostsByTag";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tagId = searchParams.get("tagId");

  if (!tagId) {
    return NextResponse.json({ error: "Missing tagId" }, { status: 400 });
  }

  const posts = await getPostsByTag(tagId);
  return NextResponse.json(posts);
}

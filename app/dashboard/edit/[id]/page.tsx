import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getPostById } from "@/app/actions/getPost";
import { EditorWrapper } from "./editor-wrapper";

export default async function EditPostPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const post = await getPostById(params.id);
  if (!post) {
    notFound();
  }
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1 mb-4">
                <ChevronLeft className="h-4 w-4" />
                Back to dashboard
              </Button>
            </Link>
          </div>
          <EditorWrapper post={post} />
        </div>
      </main>
    </div>
  );
}

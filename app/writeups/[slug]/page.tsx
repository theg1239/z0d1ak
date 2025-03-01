import { SiteHeader } from "@/components/site-header";
import { CATEGORIES, formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, User, ChevronLeft, Share2, ThumbsUp } from "lucide-react";
import { getPostBySlug } from "@/app/actions/getPost";
import { getRelatedPosts } from "@/app/actions/getRelatedPosts";

interface WriteupPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function WriteupPage({ params }: WriteupPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  const postCreatedAt = post.createdAt ?? new Date();
  const postCategory = post.category ?? "";
  const authorData = post.author as { name: string; image?: string } | null;
  const authorName = authorData?.name || "Unknown Author";
  
  const relatedPosts = await getRelatedPosts(post.id, postCategory);
  
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        <article className="container max-w-4xl px-4 py-12 md:py-16">
          <div className="mb-8">
            <Link href="/writeups">
              <Button variant="ghost" size="sm" className="gap-1 mb-4 text-muted-foreground hover:text-primary">
                <ChevronLeft className="h-4 w-4" />
                Back to writeups
              </Button>
            </Link>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="inline-block rounded-full bg-muted px-3 py-1 text-xs flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {CATEGORIES.find((c) => c.id === postCategory)?.name}
              </div>
              <div className="inline-block rounded-full bg-muted px-3 py-1 text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(postCreatedAt)}
              </div>
              <div className="inline-block rounded-full bg-muted px-3 py-1 text-xs flex items-center gap-1">
                <User className="h-3 w-3" />
                {authorName}
              </div>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              {post.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                  {authorData?.image ? (
                    <Image
                      src={authorData.image}
                      alt={authorName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">{authorName}</div>
                  <div className="text-xs text-muted-foreground">Author</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  Like
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
          
          <div className="prose prose-invert prose-green max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: post.content
                  .replace(/\n/g, "<br />")
                  .replace(/```(.*?)```/gs, (match, code) =>
                    `<pre><code>${code.replace(/^.*\n/, "")}</code></pre>`
                  ),
              }}
            />
          </div>
          
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="mt-12 pt-6 border-t border-primary/20">
              <h2 className="text-2xl font-bold mb-4">Related Writeups</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedPosts.map((relatedPost: any) => (
                  <Link key={relatedPost.id} href={`/writeups/${relatedPost.slug}`}>
                    <div className="border border-primary/20 rounded-lg p-4 hover:bg-muted/10 transition-colors">
                      <div className="text-sm text-muted-foreground mb-2">
                        {formatDate(relatedPost.createdAt ?? new Date())}
                      </div>
                      <h3 className="text-lg font-medium mb-2">{relatedPost.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}

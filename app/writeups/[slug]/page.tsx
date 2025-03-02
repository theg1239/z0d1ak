import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, User, ChevronLeft } from "lucide-react";
import { getPostBySlug } from "@/app/actions/getPost";
import { getRelatedPosts } from "@/app/actions/getRelatedPosts";
import { fetchCategoriesAction } from "@/app/actions/fetchCategories";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import SidebarTableOfContents from "@/components/table-of-contents";
import LikeComments from "@/components/like-comments";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  children?: React.ReactNode;
};

const addIdToHeadings = {
  h1: ({ children, ...props }: HeadingProps) => {
    const text =
      Array.isArray(children) ? children.join("") : (children || "").toString();
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return (
      <h1
        id={id}
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginTop: "1.5rem",
          marginBottom: "1rem",
        }}
        {...props}
      >
        {children}
      </h1>
    );
  },
  h2: ({ children, ...props }: HeadingProps) => {
    const text =
      Array.isArray(children) ? children.join("") : (children || "").toString();
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return (
      <h2
        id={id}
        style={{
          fontSize: "1.75rem",
          fontWeight: "bold",
          marginTop: "1.25rem",
          marginBottom: "0.75rem",
        }}
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: HeadingProps) => {
    const text =
      Array.isArray(children) ? children.join("") : (children || "").toString();
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return (
      <h3
        id={id}
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        }}
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({ children, ...props }: HeadingProps) => {
    const text =
      Array.isArray(children) ? children.join("") : (children || "").toString();
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return (
      <h4
        id={id}
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginTop: "0.75rem",
          marginBottom: "0.5rem",
        }}
        {...props}
      >
        {children}
      </h4>
    );
  },
};

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
  const postCategoryName = post.category ?? "";
  const authorData = post.author as { name: string; image?: string } | null;
  const authorName = authorData?.name || "Unknown Author";

  const categoriesList = await fetchCategoriesAction();

  const matchedCategory = categoriesList.find(
    (c) => c.name.toLowerCase() === postCategoryName.toLowerCase()
  );
  const postCategoryId = matchedCategory?.id || "";

  const relatedPosts = await getRelatedPosts(post.id, postCategoryId);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <SidebarTableOfContents content={post.content} />

      <main className="flex-1">
        <article className="container max-w-4xl px-4 py-12 md:py-16 ml-0 md:ml-72">
          <div className="mb-8">
            <Link href="/writeups">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 mb-4 text-muted-foreground hover:text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to writeups
              </Button>
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              <div className="inline-block rounded-full bg-muted px-3 py-1 text-xs flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {matchedCategory?.name || postCategoryName}
              </div>
              <div className="inline-block rounded-full bg-muted px-3 py-1 text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(postCreatedAt)}
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              {post.title}
            </h1>

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
            </div>
          </div>

          <div className="prose prose-invert prose-green max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                ...addIdToHeadings,
                br: ({ ...props }) => (
                  <br
                    style={{
                      display: "block",
                      marginTop: "0.75rem",
                    }}
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    style={{
                      marginBottom: "1rem",
                      lineHeight: "1.6",
                      fontSize: "1.05rem",
                    }}
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul
                    style={{
                      listStyleType: "disc",
                      paddingLeft: "2rem",
                      marginBottom: "1rem",
                    }}
                    {...props}
                  />
                ),
                ol: ({ ...props }) => (
                  <ol
                    style={{
                      listStyleType: "decimal",
                      paddingLeft: "2rem",
                      marginBottom: "1rem",
                    }}
                    {...props}
                  />
                ),
                li: ({ ...props }) => (
                  <li style={{ marginBottom: "0.25rem" }} {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: "rgba(0, 255, 170, 0.2)",
                      paddingLeft: "1rem",
                      fontStyle: "italic",
                      marginBottom: "1rem",
                      backgroundColor: "rgba(0, 255, 170, 0.05)",
                      padding: "0.5rem 1rem",
                      borderRadius: "0 0.25rem 0.25rem 0",
                    }}
                    {...props}
                  />
                ),
                hr: ({ ...props }) => (
                  <hr
                    style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}
                    {...props}
                  />
                ),
                table: ({ ...props }) => (
                  <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                      {...props}
                    />
                  </div>
                ),
                th: ({ ...props }) => (
                  <th
                    style={{
                      border: "1px solid",
                      padding: "0.5rem",
                      fontWeight: "semibold",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    }}
                    {...props}
                  />
                ),
                td: ({ ...props }) => (
                  <td
                    style={{ border: "1px solid", padding: "0.5rem" }}
                    {...props}
                  />
                ),
                a: ({ ...props }) => (
                  <a
                    style={{
                      color: "rgb(0, 255, 170)",
                      textDecoration: "none",
                      borderBottom: "1px dotted rgba(0, 255, 170, 0.5)",
                      transition: "border-bottom-color 0.2s ease-in-out",
                      paddingBottom: "1px",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                img: ({ ...props }) => (
                  <img
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "0.375rem",
                      marginTop: "1rem",
                      marginBottom: "1rem",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                    {...props}
                  />
                ),
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={
                        {
                          margin: "1.25rem 0",
                          borderRadius: "0.5rem",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        } as React.CSSProperties
                      }
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        padding: "0.2rem 0.4rem",
                        borderRadius: "0.25rem",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ ...props }) => (
                  <pre
                    style={{
                      overflowX: "auto",
                      borderRadius: "0.5rem",
                      marginTop: "1.25rem",
                      marginBottom: "1.25rem",
                    }}
                    {...props}
                  />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Like and Comments Section */}
          <LikeComments postId={post.id} />

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
                      <h3 className="text-lg font-medium mb-2">
                        {relatedPost.title}
                      </h3>
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

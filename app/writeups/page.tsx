import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { TerminalText } from "@/components/terminal-text";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  ChevronRight,
  Search,
  Filter,
  User as UserIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { fetchAllPosts, FetchPostsParams } from "@/app/actions/fetchAllPosts";
import { fetchCategoriesAction } from "@/app/actions/fetchCategories";

type Category = {
  id: string;
  name: string;
};

// Next.js App Router page component with correct type definition
interface PageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function WriteUpsPage({
  searchParams,
}: PageProps) {
  const params: FetchPostsParams = {
    page: searchParams.page ? parseInt(searchParams.page as string, 10) : 1,
    limit: searchParams.limit ? parseInt(searchParams.limit as string, 10) : 10,
    categoryId: searchParams.categoryId as string | undefined,
    search: searchParams.search as string | undefined,
  };

  const { posts, totalCount, page, limit } = await fetchAllPosts(params);
  const categoriesList: Category[] = await fetchCategoriesAction();

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  <TerminalText text="$ find /writeups -type f | sort" typingSpeed={50} />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  CTF Writeups
                </h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Detailed solutions and approaches to various CTF challenges
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search writeups..."
                  className="pl-10"
                  defaultValue={searchParams.search || ""}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-black px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                  defaultValue={searchParams.categoryId || ""}
                >
                  <option value="">All Categories</option>
                  {categoriesList.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: any) => (
                <Link key={post.id} href={`/writeups/${post.slug}`}>
                  <Card className="h-full hover:border-primary/50 transition-all duration-300">
                    <CardHeader className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="inline-block rounded-full bg-muted px-2 py-1 text-xs">
                          {post.categoryName ||
                            categoriesList.find(
                              (c: Category) => c.id === post.categoryId
                            )?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <div className="line-clamp-2">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <div {...props} />,
                            h2: ({ node, ...props }) => <div {...props} />,
                            h3: ({ node, ...props }) => <div {...props} />,
                            h4: ({ node, ...props }) => <div {...props} />,
                            p: ({ node, ...props }) => <p {...props} />,
                          }}
                        >
                          {post.excerpt}
                        </ReactMarkdown>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm font-medium">{post.author.name}</div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <div className="flex items-center text-primary text-sm">
                        Read writeup
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  asChild
                >
                  <Link href={`?page=${page - 1}&limit=${limit}`} scroll={false}>
                    Previous
                  </Link>
                </Button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant="outline"
                      size="sm"
                      className={pageNum === page ? "bg-primary/10" : ""}
                      asChild
                    >
                      <Link href={`?page=${pageNum}&limit=${limit}`} scroll={false}>
                        {pageNum}
                      </Link>
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  asChild
                >
                  <Link href={`?page=${page + 1}&limit=${limit}`} scroll={false}>
                    Next
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
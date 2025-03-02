import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { TerminalText } from "@/components/terminal-text"
import { GlitchText } from "@/components/glitch-text"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Terminal, FileText, User, ChevronRight } from "lucide-react"
import { getLatestPosts } from "@/app/actions/getLatestPosts"
import { fetchCategoriesAction } from "@/app/actions/fetchCategories"
import ReactMarkdown from "react-markdown"

type Category = {
  id: string
  name: string
}

export default async function Home() {
  const latestPosts = await getLatestPosts(3)
  const categoriesList: Category[] = await fetchCategoriesAction()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative py-16 md:py-32 overflow-hidden">
          <div className="container px-4 md:px-6">
            {/* Mobile Hero Layout */}
            <div className="lg:hidden space-y-8">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm mb-4">
                  <TerminalText text="$ ./welcome.sh" typingSpeed={80} />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  <GlitchText text="z0d1ak" className="text-primary" />
                  <span className="block mt-2">Our Blog</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground text-lg">
                  <TerminalText
                    text="CTF experiences, hacking journey, and writeups."
                    typingSpeed={20}
                    startDelay={1000}
                  />
                </p>
              </div>

              {/* Mobile Terminal */}
              <div className="bg-black border border-primary/30 rounded-lg p-4 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                  <div className="ml-1 text-xs text-muted-foreground">terminal</div>
                </div>
                <div className="font-mono text-sm space-y-2">
                  <p className="text-muted-foreground">$ whoami</p>
                  <p className="text-primary">z0d1ak</p>
                  <p className="text-muted-foreground">$ ls /challenges</p>
                  <p className="flex flex-wrap gap-2">
                    <span className="text-blue-400">web</span>
                    <span className="text-green-400">crypto</span>
                    <span className="text-yellow-400">forensics</span>
                    <span className="text-red-400">pwn</span>
                    <span className="text-purple-400">reverse</span>
                  </p>
                  <p className="text-primary animate-pulse">Initializing...</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/writeups" className="w-full sm:w-auto">
                  <Button variant="hacker" size="lg" className="gap-2 w-full">
                    <FileText className="h-4 w-4" />
                    Browse Writeups
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="gap-2 w-full">
                    <Terminal className="h-4 w-4" />
                    Join the Team
                  </Button>
                </Link>
              </div>
            </div>

            {/* Desktop Hero Layout */}
            <div className="hidden lg:grid gap-12 grid-cols-2 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm mb-4">
                  <TerminalText text="$ ./welcome.sh" typingSpeed={80} />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  <GlitchText text="z0d1ak" className="text-primary" />
                  <span className="block mt-2">Our Blog</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  <TerminalText
                    text="CTF experiences, hacking journey, and writeups."
                    typingSpeed={20}
                    startDelay={1000}
                  />
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href="/writeups">
                    <Button variant="hacker" size="lg" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Browse Writeups
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="gap-2">
                      <Terminal className="h-4 w-4" />
                      Join the Team
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto flex items-center justify-center">
                <div className="relative w-full max-w-[800px] aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-3xl opacity-50"></div>
                  <div className="relative bg-black border border-primary/30 rounded-lg p-10 h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-4 w-4 rounded-full bg-destructive"></div>
                      <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                      <div className="h-4 w-4 rounded-full bg-primary"></div>
                      <div className="ml-2 text-xs text-muted-foreground">terminal</div>
                    </div>
                    <div className="font-mono text-lg space-y-3">
                      <p className="text-muted-foreground">$ whoami</p>
                      <p className="text-primary">z0d1ak</p>
                      <p className="text-muted-foreground">$ ls -la /challenges</p>
                      <p>
                        <span className="text-blue-400">web</span> <span className="text-green-400">crypto</span>{" "}
                        <span className="text-yellow-400">forensics</span> <span className="text-red-400">pwn</span>{" "}
                        <span className="text-purple-400">reverse</span>
                      </p>
                      <p className="text-muted-foreground">$ cat /etc/motd</p>
                      <p>Welcome to z0d1ak</p>
                      <p className="text-muted-foreground">$ ./join_team.sh</p>
                      <p className="text-primary animate-pulse mb-12">Initializing...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-6 md:mb-8">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  <TerminalText text="$ cat /latest_writeups.txt" typingSpeed={50} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Latest Writeups
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out the most recent CTF challenge solutions
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <Link key={post.id} href={`/writeups/${post.slug}`}>
                  <Card className="h-full hover:border-primary/50 transition-all duration-300">
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xs text-muted-foreground">
                          {post.categoryName} &bull; {formatDate(post.createdAt)}
                        </div>
                      </div>
                      <CardTitle className="text-lg md:text-xl">{post.title}</CardTitle>
                      <div className="line-clamp-2 text-sm md:text-base">
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
                    <CardContent className="p-4 md:p-6 pt-0">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        <div className="text-sm font-medium">{post.author?.name || "Unknown"}</div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 md:p-6 pt-0">
                      <div className="flex items-center text-primary text-sm">
                        Read writeup
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="flex justify-center mt-6 md:mt-8">
              <Link href="/writeups">
                <Button variant="outline" className="gap-2">
                  View All Writeups
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}


import type React from "react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { TerminalText } from "@/components/terminal-text"
import { GlitchText } from "@/components/glitch-text"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import {
  Terminal,
  FileText,
  User,
  ChevronRight,
  Trophy,
  Tag,
  Clock,
  Flag,
  Shield,
  Code,
  Zap,
  Search,
} from "lucide-react"
import { getLatestPosts } from "@/app/actions/getLatestPosts"
import { fetchCategoriesAction } from "@/app/actions/fetchCategories"
import { getLatestCompetitions } from "@/app/actions/getLatestTags"
import ReactMarkdown from "react-markdown"
import { unstable_cache } from "next/cache"

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  createdAt: string
  categoryName: string | null
  author: { name: string } | null
  tags: any[]
}

export interface Category {
  id: string
  name: string
}

export interface Competition {
  id: string
  name: string
  latestPost: string | null
  postCount: number
}

const getCachedLatestPosts = unstable_cache(
  async (count: number) => {
    return getLatestPosts(count)
  },
  ["latest-posts"],
  { revalidate: 3600 },
)

const getCachedCategories = unstable_cache(
  async () => {
    return fetchCategoriesAction()
  },
  ["categories"],
  { revalidate: 3600 },
)

const getCachedCompetitions = unstable_cache(
  async (count: number) => {
    return getLatestCompetitions(count)
  },
  ["latest-competitions"],
  { revalidate: 3600 },
)

function TerminalPrompt({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`font-mono text-sm md:text-base ${className}`}>
      <span className="text-green-500">z0d1ak@ctf</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-blue-500">~</span>
      <span className="text-muted-foreground">$</span> <span className="text-primary">{text}</span>
    </div>
  )
}

function TerminalWindow({
  title,
  children,
  className = "",
  fullWidth = false,
  maxHeight = "",
}: {
  title: string
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
  maxHeight?: string
}) {
  return (
    <div
      className={`bg-black border border-primary/30 rounded-lg overflow-hidden ${
        fullWidth ? "w-full" : "max-w-4xl mx-auto"
      } ${className}`}
      style={{ maxHeight: maxHeight ? maxHeight : "none" }}
    >
      <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 border-b border-primary/20">
        <div className="h-3 w-3 rounded-full bg-destructive"></div>
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <div className="ml-2 text-xs text-muted-foreground font-mono">{title}</div>
      </div>
      <div className={`p-4 md:p-6 font-mono ${maxHeight ? "overflow-auto" : ""}`}>{children}</div>
    </div>
  )
}

function AsciiArt() {
  return (
    <pre className="text-primary text-xs md:text-sm font-mono leading-tight overflow-x-auto">
      {`
 ███████╗ ██████╗ ██████╗  ██╗ █████╗ ██╗  ██╗
 ╚══███╔╝██╔═████╗██╔══██╗███║██╔══██╗██║ ██╔╝
   ███╔╝ ██║██╔██║██║  ██║╚██║███████║█████╔╝ 
  ███╔╝  ████╔╝██║██║  ██║ ██║██╔══██║██╔═██╗ 
 ███████╗╚██████╔╝██████╔╝ ██║██║  ██║██║  ██╗
 ╚══════╝ ╚═════╝ ╚═════╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
                                              
      `}
    </pre>
  )
}

// Mobile Hero - simplified with just ASCII art and no redundant team name
function MobileHero() {
  return (
    <div className="space-y-6 text-center px-4">
      <div className="inline-block rounded-lg bg-black border border-primary/30 px-3 py-1 text-sm mb-4 mx-auto">
        <TerminalText text="$ ./welcome.sh" typingSpeed={80} />
      </div>

      <AsciiArt />

      <p className="text-muted-foreground">
        <TerminalText
          text="Hacking challenges, solving puzzles, breaking security."
          typingSpeed={20}
          startDelay={1000}
        />
      </p>

      <TerminalWindow title="z0d1ak@ctf:~" className="mx-auto" fullWidth>
        <div className="space-y-3">
          <TerminalPrompt text="whoami" />
          <p className="text-white">z0d1ak - Cybersecurity CTF Team</p>

          <TerminalPrompt text="ls -la /skills" />
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400">web</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-green-400">crypto</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400">forensics</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-red-400" />
              <span className="text-red-400">pwn</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" />
              <span className="text-purple-400">reverse</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400">OSINT</span>
            </div>
          </div>

          <TerminalPrompt text="./join_team.sh" />
          <p className="text-primary animate-pulse">Initializing recruitment process...</p>
        </div>
      </TerminalWindow>

      <div className="flex flex-col gap-3 pt-4">
        <Link href="/writeups">
          <Button variant="hacker" size="lg" className="gap-2 w-full">
            <FileText className="h-4 w-4" />
            Browse Writeups
          </Button>
        </Link>
        <Link href="/login">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 w-full border-primary/50 text-primary hover:bg-primary/10"
          >
            <Terminal className="h-4 w-4" />
            Join the Team
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Desktop Hero with full-height terminal
function DesktopHero() {
  return (
    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="inline-block rounded-lg bg-black border border-primary/30 px-3 py-1 text-sm mb-4">
          <TerminalText text="$ ./welcome.sh" typingSpeed={80} />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            <GlitchText text="z0d1ak" className="text-primary" />
            <span className="block mt-2 text-white">CTF Team</span>
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            <TerminalText
              text="Hacking challenges, solving puzzles, breaking security."
              typingSpeed={20}
              startDelay={1000}
            />
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link href="/writeups">
            <Button variant="hacker" size="lg" className="gap-2 w-full sm:w-auto">
              <FileText className="h-4 w-4" />
              Browse Writeups
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 w-full sm:w-auto border-primary/50 text-primary hover:bg-primary/10"
            >
              <Terminal className="h-4 w-4" />
              Join the Team
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto lg:ml-auto w-full h-full flex items-center">
        <TerminalWindow
          title="z0d1ak@ctf:~"
          className="h-[calc(100vh-10rem)] max-h-[600px]"
          fullWidth
          maxHeight="600px"
        >
          <div className="space-y-4">
            <AsciiArt />

            <TerminalPrompt text="whoami" />
            <p className="text-white">z0d1ak - Cybersecurity CTF Team</p>

            <TerminalPrompt text="ls -la /skills" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-2">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400">web</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-green-400">crypto</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400">forensics</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-red-400" />
                <span className="text-red-400">pwn</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                <span className="text-purple-400">reverse</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-orange-400" />
                <span className="text-orange-400">OSINT</span>
              </div>
            </div>

            <TerminalPrompt text="cat /etc/motd" />
            <div className="bg-primary/5 border-l-4 border-primary p-2 my-2">
              <p className="text-white">Welcome to the z0d1ak CTF team blog</p>
              <p className="text-white">We hack, we learn, we share knowledge.</p>
            </div>

            <TerminalPrompt text="cat /etc/banner" />
            <div className="bg-black/50 p-3 rounded border border-primary/20 my-2">
              <p className="text-white">🏆 Ranked #42 globally in CTFtime</p>
              <p className="text-white">🔐 Specializing in web, crypto, and forensics</p>
              <p className="text-white">🌐 Join our community of security enthusiasts</p>
            </div>

            <TerminalPrompt text="./join_team.sh" />
            <p className="text-primary animate-pulse">Initializing recruitment process...</p>
          </div>
        </TerminalWindow>
      </div>
    </div>
  )
}

export default async function Home() {
  const latestPosts: Post[] = await getCachedLatestPosts(3)
  const categoriesList: Category[] = await getCachedCategories()
  const competitions: Competition[] = await getCachedCompetitions(5)

  return (
    <div className="flex min-h-screen flex-col bg-black text-green-500">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative py-8 md:py-0 overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="md:hidden">
              <MobileHero />
            </div>

            <div className="hidden md:block">
              <DesktopHero />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 md:mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-black border border-primary/30 px-3 py-1 text-sm">
                  <TerminalText text="$ ./list_competitions.sh" typingSpeed={50} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter sm:text-4xl text-white">
                  Active Competitions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  CTF events we're currently participating in
                </p>
              </div>
            </div>

            <TerminalWindow title="competitions.log" className="mb-8">
              <div className="space-y-1">
                <TerminalPrompt text="cat /var/log/competitions.log | sort -r | head -n 5" />
                <p className="text-xs text-muted-foreground mb-4">Displaying latest 5 competition entries...</p>

                <div className="space-y-6">
                  {competitions.map((competition, index) => (
                    <div key={competition.id || index} className="border-b border-primary/20 pb-4 last:border-0">
                      <div className="flex items-start gap-2 md:gap-4">
                        <div className="flex-shrink-0 w-6 md:w-8 text-center">
                          <span className="text-primary font-bold">{index + 1}.</span>
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <h3 className="text-lg font-bold text-white">{competition.name}</h3>
                            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-mono">
                              {competition.postCount} writeups
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {competition.latestPost && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Last updated: {formatDate(competition.latestPost)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Flag className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Status: Active</span>
                            </div>
                          </div>

                          <div className="font-mono text-xs bg-gray-900 p-2 rounded border border-primary/20 overflow-x-auto">
                            <span className="text-blue-400">root@z0d1ak</span>:<span className="text-green-400">~</span>$ ./view_competition.sh --id={competition.id}
                          </div>

                          <div className="flex justify-end">
                            <Link href={`/competitions/${competition.id}`}>
                              <Button variant="link" size="sm" className="gap-1 text-primary hover:text-primary/80">
                                View Challenges
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-primary/20">
                <TerminalPrompt text="ls -la /competitions --page=all" />
                <div className="flex justify-center mt-4">
                  <Link href="/competitions">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                    >
                      View All Competitions
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </TerminalWindow>
          </div>
        </section>

        {/* Writeups Section - Terminal Style */}
        <section className="py-12 md:py-20 bg-black">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 md:mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-black border border-primary/30 px-3 py-1 text-sm">
                  <TerminalText text="$ ./fetch_writeups.sh --latest" typingSpeed={50} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter sm:text-4xl text-white">
                  Latest Writeups
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out the most recent CTF challenge solutions
                </p>
              </div>
            </div>

            <TerminalWindow title="writeups.sh" className="mb-8">
              <div className="space-y-1">
                <TerminalPrompt text="./fetch_writeups.sh --latest=3 --format=detailed" />
                <p className="text-xs text-muted-foreground mb-4">Fetching latest 3 writeups from database...</p>

                <div className="space-y-8">
                  {latestPosts.map((post: Post, index) => (
                    <div key={post.id || index} className="relative">
                      <div className="absolute -left-4 top-0 bottom-0 border-l-2 border-dashed border-primary/30 hidden md:block"></div>

                      <div className="ml-0 md:ml-6 relative">
                        <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-primary hidden md:block"></div>

                        <div className="bg-gray-900 border border-primary/30 rounded-lg overflow-hidden">
                          {/* Header bar */}
                          <div className="bg-gray-800 px-3 md:px-4 py-2 flex flex-wrap md:flex-nowrap items-center justify-between gap-2 border-b border-primary/20">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-mono text-xs md:text-sm text-white truncate max-w-[150px] md:max-w-none">
                                {post.slug}.md
                              </span>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                              <div className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</div>
                              {post.categoryName && (
                                <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                                  {post.categoryName}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-3 md:p-4">
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{post.title}</h3>

                            <div className="bg-black/50 p-2 md:p-3 rounded border border-primary/20 mb-3 text-xs md:text-sm text-muted-foreground">
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

                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div className="text-sm text-muted-foreground">
                                  Author: <span className="text-white">{post.author?.name || "Unknown"}</span>
                                </div>
                              </div>

                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {post.tags.map((tag: any, tagIndex: number) => (
                                    <div
                                      key={tag.id || tagIndex}
                                      className="flex items-center gap-1 text-xs bg-black/50 px-2 py-1 rounded"
                                    >
                                      <Tag className="h-3 w-3 text-primary" />
                                      <span className="text-muted-foreground">{tag.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-primary/20">
                              <div className="font-mono text-xs bg-black p-2 rounded overflow-x-auto">
                                <span className="text-blue-400">root@z0d1ak</span>:
                                <span className="text-green-400">~</span>$ cat /writeups/{post.slug}.md
                              </div>

                              <div className="flex justify-end mt-2">
                                <Link href={`/writeups/${post.slug}`}>
                                  <Button variant="link" size="sm" className="gap-1 text-primary hover:text-primary/80">
                                    Read full writeup
                                    <ChevronRight className="h-3 w-3" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-primary/20">
                <TerminalPrompt text="ls -la /writeups --sort=date --order=desc" />
                <div className="flex justify-center mt-4">
                  <Link href="/writeups">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                    >
                      View All Writeups
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </TerminalWindow>
          </div>
        </section>

        {/* <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <TerminalWindow title="contact.sh" className="max-w-2xl mx-auto">
              <div className="space-y-3">
                <TerminalPrompt text="./contact.sh --help" />
                <div className="text-sm text-muted-foreground">
                  <p>Usage: ./contact.sh [OPTIONS]</p>
                  <p>Connect with the z0d1ak CTF team</p>
                </div>

                <TerminalPrompt text="cat /etc/contact_info" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Link href="/about" className="flex items-center gap-2 text-primary hover:underline">
                    <Terminal className="h-4 w-4" />
                    <span>About Team</span>
                  </Link>
                  <Link href="/discord" className="flex items-center gap-2 text-primary hover:underline">
                    <Terminal className="h-4 w-4" />
                    <span>Join Discord</span>
                  </Link>
                  <Link href="/twitter" className="flex items-center gap-2 text-primary hover:underline">
                    <Terminal className="h-4 w-4" />
                    <span>Twitter</span>
                  </Link>
                  <Link href="/github" className="flex items-center gap-2 text-primary hover:underline">
                    <Terminal className="h-4 w-4" />
                    <span>GitHub</span>
                  </Link>
                </div>

                <TerminalPrompt text="exit" />
                <p className="text-xs text-muted-foreground">Session terminated. Come back soon!</p>
              </div>
            </TerminalWindow>
          </div>
        </section> */}
      </main>
    </div>
  )
}

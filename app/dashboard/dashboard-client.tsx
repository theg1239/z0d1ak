"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import {
  PenLine,
  FileText,
  User,
  Settings,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Menu,
  X,
  Shield,
  Terminal,
  Zap,
  Lock,
  Code,
  Database,
  Eye,
  EyeOff,
  ChevronRight,
  Cpu,
  Mail
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"

type HeadingProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode
}

const excerptComponents = {
  h1: ({ children, ...props }: HeadingProps) => (
    <div {...props} className="font-bold text-xl">
      {children}
    </div>
  ),
  h2: ({ children, ...props }: HeadingProps) => (
    <div {...props} className="font-bold text-lg">
      {children}
    </div>
  ),
  h3: ({ children, ...props }: HeadingProps) => (
    <div {...props} className="font-bold text-base">
      {children}
    </div>
  ),
  h4: ({ children, ...props }: HeadingProps) => (
    <div {...props} className="font-bold text-sm">
      {children}
    </div>
  ),
  p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  code: ({ children, inline, ...props }: any) =>
    inline ? (
      <code {...props} className="bg-primary/10 text-primary px-1 rounded">
        {children}
      </code>
    ) : (
      <pre {...props} className="bg-primary/10 text-primary p-2 rounded">
        <code>{children}</code>
      </pre>
    ),
}

// Function to get category icon based on category name
function getCategoryIcon(categoryName: string | null | undefined) {
  if (!categoryName) return <FileText className="h-4 w-4" />

  const name = categoryName.toLowerCase()
  if (name.includes("web")) return <Code className="h-4 w-4" />
  if (name.includes("crypto")) return <Lock className="h-4 w-4" />
  if (name.includes("forensic")) return <Shield className="h-4 w-4" />
  if (name.includes("pwn") || name.includes("exploit")) return <Terminal className="h-4 w-4" />
  if (name.includes("reverse")) return <Cpu className="h-4 w-4" />
  if (name.includes("database") || name.includes("sql")) return <Database className="h-4 w-4" />
  return <FileText className="h-4 w-4" />
}

export default function DashboardClient({
  session,
  posts,
}: {
  session: any
  posts: Array<{
    id: string
    title: string
    slug: string
    excerpt: string
    createdAt: string
    categoryName: string | null
    isDraft: boolean
  }>
}) {
  const [activeTab, setActiveTab] = useState("writeups")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [timeString, setTimeString] = useState("")

  const publishedPosts = posts.filter((post) => !post.isDraft)
  const draftPosts = posts.filter((post) => post.isDraft)

  // Update time string every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeString(now.toLocaleTimeString())
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const NavItems = () => (
    <nav className="flex flex-col w-full">
      <button
        className={`flex items-center gap-3 p-4 text-sm transition-all duration-200 hover:bg-primary/10 rounded-md mx-2 my-1 ${
          activeTab === "writeups" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
        }`}
        onClick={() => {
          setActiveTab("writeups")
          setSidebarOpen(false)
        }}
      >
        <FileText className="h-5 w-5" />
        My Writeups
        <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
          {publishedPosts.length}
        </span>
      </button>
      <button
        className={`flex items-center gap-3 p-4 text-sm transition-all duration-200 hover:bg-primary/10 rounded-md mx-2 my-1 ${
          activeTab === "drafts" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
        }`}
        onClick={() => {
          setActiveTab("drafts")
          setSidebarOpen(false)
        }}
      >
        <PenLine className="h-5 w-5" />
        Drafts
        <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">{draftPosts.length}</span>
      </button>
      <button
        className={`flex items-center gap-3 p-4 text-sm transition-all duration-200 hover:bg-primary/10 rounded-md mx-2 my-1 ${
          activeTab === "profile" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
        }`}
        onClick={() => {
          setActiveTab("profile")
          setSidebarOpen(false)
        }}
      >
        <User className="h-5 w-5" />
        Profile
      </button>
      <button
        className={`flex items-center gap-3 p-4 text-sm transition-all duration-200 hover:bg-primary/10 rounded-md mx-2 my-1 ${
          activeTab === "settings" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
        }`}
        onClick={() => {
          setActiveTab("settings")
          setSidebarOpen(false)
        }}
      >
        <Settings className="h-5 w-5" />
        Settings
      </button>
    </nav>
  )

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />

      <main className="flex-1">
        <div className="container px-4 py-6 md:py-12">
          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {activeTab === "writeups" && "My Writeups"}
              {activeTab === "drafts" && "My Drafts"}
              {activeTab === "profile" && "My Profile"}
              {activeTab === "settings" && "Settings"}
            </h1>

            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 border-primary/30 bg-black">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          {session?.user?.name || "CryptoMaster"}
                        </h2>
                        <p className="text-xs text-muted-foreground font-mono">
                          <span className="text-green-500">z0d1ak@ctf</span>
                          <span className="text-muted-foreground">:</span>
                          <span className="text-blue-500">~</span>
                          <span className="text-muted-foreground">$</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(false)}
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block md:w-72">
              <div className="sticky top-20 space-y-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm"></div>
                  <Card className="relative border-primary/30 bg-black/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="p-4 border-b border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/30">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{session?.user?.name || "CryptoMaster"}</CardTitle>
                          <div className="text-xs text-muted-foreground font-mono">
                            <span className="text-green-500">z0d1ak@ctf</span>
                            <span className="text-muted-foreground">:</span>
                            <span className="text-blue-500">~</span>
                            <span className="text-muted-foreground">$</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-2">
                      <NavItems />
                    </CardContent>
                    <div className="p-4 border-t border-primary/20 bg-primary/5">
                      <div className="text-xs text-muted-foreground font-mono flex justify-between">
                        <span>
                          System Status: <span className="text-green-500">Online</span>
                        </span>
                        <span className="text-primary">{timeString}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/0 rounded-xl blur-sm"></div>
                  <Card className="relative border-primary/30 bg-black/80 backdrop-blur-sm">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-primary" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Published</span>
                        <span className="text-sm font-mono">{publishedPosts.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Drafts</span>
                        <span className="text-sm font-mono">{draftPosts.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Total</span>
                        <span className="text-sm font-mono">{posts.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                {/* Title is shown in mobile nav for small screens */}
                <div className="hidden md:block">
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    {activeTab === "writeups" && (
                      <>
                        <FileText className="h-6 w-6 text-primary" />
                        My Writeups
                      </>
                    )}
                    {activeTab === "drafts" && (
                      <>
                        <PenLine className="h-6 w-6 text-primary" />
                        My Drafts
                      </>
                    )}
                    {activeTab === "profile" && (
                      <>
                        <User className="h-6 w-6 text-primary" />
                        My Profile
                      </>
                    )}
                    {activeTab === "settings" && (
                      <>
                        <Settings className="h-6 w-6 text-primary" />
                        Settings
                      </>
                    )}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === "writeups" && "Manage your published CTF writeups"}
                    {activeTab === "drafts" && "Continue working on your draft writeups"}
                    {activeTab === "profile" && "Update your profile information"}
                    {activeTab === "settings" && "Configure your account settings"}
                  </p>
                </div>

                {(activeTab === "writeups" || activeTab === "drafts") && (
                  <Link href="/dashboard/new" className="ml-auto">
                    <Button variant="default" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">New Writeup</span>
                      <span className="sm:hidden">New</span>
                    </Button>
                  </Link>
                )}
              </div>

              {activeTab === "writeups" && (
                <div className="space-y-6">
                  {publishedPosts.length > 0 ? (
                    publishedPosts.map((post) => (
                      <div key={post.id} className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Card className="relative border-primary/30 bg-black/80 backdrop-blur-sm overflow-hidden transition-all duration-300 group-hover:border-primary/50">
                          <div className="flex flex-col md:flex-row">
                            <CardHeader className="flex-1 p-4 md:p-6">
                              <div className="flex flex-wrap gap-2 mb-3">
                                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs flex items-center gap-1 text-primary border border-primary/30">
                                  {getCategoryIcon(post.categoryName)}
                                  {post.categoryName || "Uncategorized"}
                                </div>
                                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs flex items-center gap-1 text-primary border border-primary/30">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(post.createdAt)}
                                </div>
                                <div className="inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs flex items-center gap-1 text-green-500 border border-green-500/30">
                                  <Eye className="h-3 w-3" />
                                  Published
                                </div>
                              </div>
                              <CardTitle className="text-lg md:text-xl mb-3 group-hover:text-primary transition-colors duration-300">
                                <Link href={`/writeups/${post.slug}`} className="hover:text-primary">
                                  {post.title}
                                </Link>
                              </CardTitle>
                              <div className="line-clamp-2 text-sm md:text-base text-muted-foreground">
                                <ReactMarkdown components={excerptComponents}>{post.excerpt}</ReactMarkdown>
                              </div>

                              <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between">
                                <div className="text-xs text-muted-foreground font-mono">
                                  ID: <span className="text-primary">flag&#123;{post.id.substring(0, 8)}&#125;</span>
                                </div>
                                <Link
                                  href={`/writeups/${post.slug}`}
                                  className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                  View writeup <ChevronRight className="h-3 w-3" />
                                </Link>
                              </div>
                            </CardHeader>
                            <div className="flex md:flex-col justify-between items-center gap-2 p-4 md:p-6 border-t md:border-t-0 md:border-l border-primary/20 bg-primary/5">
                              <Link href={`/dashboard/edit/${post.id}`} className="flex-1 md:flex-none w-full">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 w-full border-primary/30 text-primary hover:bg-primary/10"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 flex-1 md:flex-none w-full"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))
                  ) : (
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm"></div>
                      <Card className="relative border-primary/30 bg-black/80 backdrop-blur-sm">
                        <CardHeader className="text-center py-8">
                          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-primary" />
                          </div>
                          <CardTitle className="text-xl">No writeups yet</CardTitle>
                          <CardDescription className="max-w-md mx-auto">
                            You haven't created any writeups yet. Start sharing your CTF experiences with the community!
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-center pb-8">
                          <Link href="/dashboard/new">
                            <Button
                              variant="default"
                              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Plus className="h-4 w-4" />
                              Create your first writeup
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "drafts" && (
                <div className="space-y-6">
                  {draftPosts.length > 0 ? (
                    draftPosts.map((post) => (
                      <div key={post.id} className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Card className="relative border-primary/30 bg-black/80 backdrop-blur-sm overflow-hidden transition-all duration-300 group-hover:border-primary/50">
                          <div className="flex flex-col md:flex-row">
                            <CardHeader className="flex-1 p-4 md:p-6">
                              <div className="flex flex-wrap gap-2 mb-3">
                                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs flex items-center gap-1 text-primary border border-primary/30">
                                  {getCategoryIcon(post.categoryName)}
                                  {post.categoryName || "Uncategorized"}
                                </div>
                                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs flex items-center gap-1 text-primary border border-primary/30">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(post.createdAt)}
                                </div>
                                <div className="inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-xs flex items-center gap-1 text-yellow-500 border border-yellow-500/30">
                                  <EyeOff className="h-3 w-3" />
                                  Draft
                                </div>
                              </div>
                              <CardTitle className="text-lg md:text-xl mb-3 group-hover:text-primary transition-colors duration-300">
                                <Link href={`/dashboard/edit/${post.id}`} className="hover:text-primary">
                                  {post.title}
                                </Link>
                              </CardTitle>
                              <div className="line-clamp-2 text-sm md:text-base text-muted-foreground">
                                <ReactMarkdown components={excerptComponents}>{post.excerpt}</ReactMarkdown>
                              </div>

                              <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between">
                                <div className="text-xs text-muted-foreground font-mono">
                                  Last edited: <span className="text-primary">{formatDate(post.createdAt)}</span>
                                </div>
                                <div className="text-xs text-yellow-500 flex items-center gap-1">
                                  <Zap className="h-3 w-3" /> Unpublished
                                </div>
                              </div>
                            </CardHeader>
                            <div className="flex md:flex-col justify-between items-center gap-2 p-4 md:p-6 border-t md:border-t-0 md:border-l border-primary/20 bg-primary/5">
                              <Link href={`/dashboard/edit/${post.id}`} className="flex-1 md:flex-none w-full">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 w-full border-primary/30 text-primary hover:bg-primary/10"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="default"
                                size="sm"
                                className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 md:flex-none w-full"
                              >
                                <Eye className="h-4 w-4" />
                                Publish
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 flex-1 md:flex-none w-full"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))
                  ) : (
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm"></div>
                      <Card className="relative border-primary/30 bg-black/80 backdrop-blur-sm">
                        <CardHeader className="text-center py-8">
                          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <PenLine className="h-8 w-8 text-primary" />
                          </div>
                          <CardTitle className="text-xl">No drafts yet</CardTitle>
                          <CardDescription className="max-w-md mx-auto">
                            You don't have any draft writeups yet. Create a draft to save your work in progress.
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-center pb-8">
                          <Link href="/dashboard/new">
                            <Button
                              variant="default"
                              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Plus className="h-4 w-4" />
                              Create new draft
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "profile" && (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm"></div>
                  <Card className="relative border-primary/30 bg-black/80 backdrop-blur-sm">
                    <CardHeader className="border-b border-primary/20 bg-primary/5">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Profile Information
                      </CardTitle>
                      <CardDescription>Manage your public profile information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-primary" />
                          Username
                        </label>
                        <div className="relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-md blur-sm opacity-50"></div>
                          <input
                            className="relative flex h-10 w-full rounded-md border border-primary/30 bg-black/80 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                            defaultValue={session?.user?.name || "CryptoMaster"}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-md blur-sm opacity-50"></div>
                          <input
                            className="relative flex h-10 w-full rounded-md border border-primary/30 bg-black/80 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                            defaultValue={session?.user?.email || "crypto@example.com"}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Bio
                        </label>
                        <div className="relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-md blur-sm opacity-50"></div>
                          <textarea
                            className="relative flex min-h-[120px] w-full rounded-md border border-primary/30 bg-black/80 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                            defaultValue="Cryptography enthusiast and CTF player. I love breaking crypto challenges and sharing my knowledge with the community."
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col sm:flex-row gap-3 sm:gap-0 border-t border-primary/20 bg-primary/5 p-6">
                      <Button
                        variant="default"
                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Save Changes
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm"></div>
                  <Card className="relative border-primary/30 bg-black/80 backdrop-blur-sm">
                    <CardHeader className="border-b border-primary/20 bg-primary/5">
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Account Settings
                      </CardTitle>
                      <CardDescription>Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            Email Notifications
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Receive email notifications when someone comments on your writeups
                          </p>
                        </div>
                        <Switch className="data-[state=checked]:bg-primary" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Two-Factor Authentication
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="self-start border-primary/30 text-primary hover:bg-primary/10"
                        >
                          Enable
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" />
                            Profile Visibility
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Control who can see your profile and writeups
                          </p>
                        </div>
                        <select className="h-9 rounded-md border border-primary/30 bg-black px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                          <option>Public</option>
                          <option>Team Only</option>
                          <option>Private</option>
                        </select>
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col sm:flex-row gap-3 sm:gap-0 border-t border-primary/20 bg-primary/5 p-6">
                      <Button
                        variant="default"
                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Save Settings
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


"use client"

import type React from "react"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { PenLine, FileText, User, Settings, Plus, Edit, Trash2, Calendar, Tag, Menu, X } from "lucide-react"
import { formatDate } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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
      <code {...props} className="bg-muted px-1 rounded">
        {children}
      </code>
    ) : (
      <pre {...props} className="bg-muted p-2 rounded">
        <code>{children}</code>
      </pre>
    ),
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

  const publishedPosts = posts.filter((post) => !post.isDraft)
  const draftPosts = posts.filter((post) => post.isDraft)

  const NavItems = () => (
    <nav className="flex flex-col w-full">
      <button
        className={`flex items-center gap-2 p-4 text-sm transition-colors hover:bg-muted/20 ${
          activeTab === "writeups" ? "bg-muted/20 text-primary" : "text-muted-foreground"
        }`}
        onClick={() => {
          setActiveTab("writeups")
          setSidebarOpen(false)
        }}
      >
        <FileText className="h-4 w-4" />
        My Writeups
      </button>
      <button
        className={`flex items-center gap-2 p-4 text-sm transition-colors hover:bg-muted/20 ${
          activeTab === "drafts" ? "bg-muted/20 text-primary" : "text-muted-foreground"
        }`}
        onClick={() => {
          setActiveTab("drafts")
          setSidebarOpen(false)
        }}
      >
        <PenLine className="h-4 w-4" />
        Drafts
      </button>
      <button
        className={`flex items-center gap-2 p-4 text-sm transition-colors hover:bg-muted/20 ${
          activeTab === "profile" ? "bg-muted/20 text-primary" : "text-muted-foreground"
        }`}
        onClick={() => {
          setActiveTab("profile")
          setSidebarOpen(false)
        }}
      >
        <User className="h-4 w-4" />
        Profile
      </button>
      <button
        className={`flex items-center gap-2 p-4 text-sm transition-colors hover:bg-muted/20 ${
          activeTab === "settings" ? "bg-muted/20 text-primary" : "text-muted-foreground"
        }`}
        onClick={() => {
          setActiveTab("settings")
          setSidebarOpen(false)
        }}
      >
        <Settings className="h-4 w-4" />
        Settings
      </button>
    </nav>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container px-4 py-6 md:py-12">
          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">
              {activeTab === "writeups" && "My Writeups"}
              {activeTab === "drafts" && "My Drafts"}
              {activeTab === "profile" && "My Profile"}
              {activeTab === "settings" && "Settings"}
            </h1>

            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">{session?.user?.name || "CryptoMaster"}</h2>
                        <p className="text-sm text-muted-foreground">Team Member</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8">
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
            <aside className="hidden md:block md:w-64">
              <Card className="sticky top-20">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-lg">{session?.user?.name || "CryptoMaster"}</CardTitle>
                      <div className="text-sm text-muted-foreground">Team Member</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <NavItems />
                </CardContent>
              </Card>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                {/* Title is shown in mobile nav for small screens */}
                <h1 className="hidden md:block text-3xl font-bold">
                  {activeTab === "writeups" && "My Writeups"}
                  {activeTab === "drafts" && "My Drafts"}
                  {activeTab === "profile" && "My Profile"}
                  {activeTab === "settings" && "Settings"}
                </h1>

                {(activeTab === "writeups" || activeTab === "drafts") && (
                  <Link href="/dashboard/new" className="ml-auto">
                    <Button variant="hacker" className="gap-2">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">New Writeup</span>
                      <span className="sm:hidden">New</span>
                    </Button>
                  </Link>
                )}
              </div>

              {activeTab === "writeups" && (
                <div className="space-y-4 md:space-y-6">
                  {publishedPosts.length > 0 ? (
                    publishedPosts.map((post) => (
                      <Card key={post.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <CardHeader className="flex-1 p-4 md:p-6">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <div className="inline-block rounded-full bg-muted px-2 py-1 text-xs flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {post.categoryName || "Uncategorized"}
                              </div>
                              <div className="inline-block rounded-full bg-muted px-2 py-1 text-xs flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(post.createdAt)}
                              </div>
                            </div>
                            <CardTitle className="text-lg md:text-xl mb-2">
                              <Link href={`/writeups/${post.slug}`} className="hover:text-primary">
                                {post.title}
                              </Link>
                            </CardTitle>
                            <div className="line-clamp-2 text-sm md:text-base">
                              <ReactMarkdown components={excerptComponents}>{post.excerpt}</ReactMarkdown>
                            </div>
                          </CardHeader>
                          <div className="flex items-center gap-2 p-4 md:p-6 border-t md:border-t-0 md:border-l border-primary/20">
                            <Link href={`/dashboard/edit/${post.id}`} className="flex-1 md:flex-none">
                              <Button variant="outline" size="sm" className="gap-1 w-full md:w-auto">
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-destructive hover:text-destructive flex-1 md:flex-none"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>No writeups yet</CardTitle>
                        <CardDescription>
                          You haven't created any writeups yet. Start sharing your CTF experiences!
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Link href="/dashboard/new">
                          <Button variant="hacker" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create your first writeup
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "drafts" && (
                <div className="space-y-4 md:space-y-6">
                  {draftPosts.length > 0 ? (
                    draftPosts.map((post) => (
                      <Card key={post.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <CardHeader className="flex-1 p-4 md:p-6">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <div className="inline-block rounded-full bg-muted px-2 py-1 text-xs flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {post.categoryName || "Uncategorized"}
                              </div>
                              <div className="inline-block rounded-full bg-muted px-2 py-1 text-xs flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(post.createdAt)}
                              </div>
                              <div className="inline-block rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 text-xs">
                                Draft
                              </div>
                            </div>
                            <CardTitle className="text-lg md:text-xl mb-2">
                              <Link href={`/dashboard/edit/${post.id}`} className="hover:text-primary">
                                {post.title}
                              </Link>
                            </CardTitle>
                            <div className="line-clamp-2 text-sm md:text-base">
                              <ReactMarkdown components={excerptComponents}>{post.excerpt}</ReactMarkdown>
                            </div>
                          </CardHeader>
                          <div className="flex items-center gap-2 p-4 md:p-6 border-t md:border-t-0 md:border-l border-primary/20">
                            <Link href={`/dashboard/edit/${post.id}`} className="flex-1 md:flex-none">
                              <Button variant="outline" size="sm" className="gap-1 w-full md:w-auto">
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-destructive hover:text-destructive flex-1 md:flex-none"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>No drafts yet</CardTitle>
                        <CardDescription>You don't have any draft writeups yet.</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Link href="/dashboard/new">
                          <Button variant="hacker" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create new draft
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "profile" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your public profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-black px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={session?.user?.name || "CryptoMaster"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-black px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={session?.user?.email || "crypto@example.com"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bio</label>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-black px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="Cryptography enthusiast and CTF player. I love breaking crypto challenges and sharing my knowledge with the community."
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col sm:flex-row gap-3 sm:gap-0">
                    <Button variant="hacker" className="w-full sm:w-auto">
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {activeTab === "settings" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive email notifications when someone comments on your writeups
                        </p>
                      </div>
                      <div className="h-6 w-11 rounded-full bg-muted p-1 transition-colors duration-200 ease-in-out self-start">
                        <div className="h-4 w-4 rounded-full bg-white"></div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" size="sm" className="self-start">
                        Enable
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col sm:flex-row gap-3 sm:gap-0">
                    <Button variant="hacker" className="w-full sm:w-auto">
                      Save Settings
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

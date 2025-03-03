"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Save,
  FileCode2,
  Minimize2,
  Maximize2,
  Clock,
  FileDown,
  Code,
  Terminal,
  Shield,
  Eye,
  Lock,
  Cpu,
  Database,
  Network,
  Trash2,
  Tag,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { createWriteup } from "@/app/actions/createWriteup"
import { updatePost } from "@/app/actions/updatePost"
import { saveDraftPost } from "@/app/actions/saveDraftPost"
import { fetchCategoriesAction } from "@/app/actions/fetchCategories"
import { MarkdownToolbar } from "@/components/markdown-toolbar"
import { CopyButton } from "@/components/copy-button"

type Category = {
  id: string
  name: string
}

const CTF_TEMPLATES = {
  basic: `# Challenge Name

## Description
*Challenge description goes here*

## Approach
*Explain your approach to solving the challenge*

## Solution
*Detailed solution steps*

## Flag
\`flag{example_flag_here}\`
`,
  detailed: `# Challenge Name

## Challenge Information
- **Category:** 
- **Points:** 
- **Solves:** 
- **Difficulty:** 

## Description
*Challenge description goes here*

## Files
*List any provided files*

## Initial Analysis
*First impressions and analysis of the challenge*

## Approach
*Explain your methodology and approach*

## Solution
*Detailed step-by-step solution*

### Step 1: Reconnaissance
*Initial reconnaissance steps*

### Step 2: Exploitation
*How you exploited the vulnerability*

### Step 3: Obtaining the Flag
*How you obtained the flag*

## Code
\`\`\`python
# Your solution code here
\`\`\`

## Lessons Learned
*What you learned from this challenge*

## Flag
\`flag{example_flag_here}\`
`,
}

type EditorProps = {
  postId?: string
}

export default function Editor({ postId }: EditorProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const previewWrapperRef = useRef<HTMLDivElement>(null)
  const [isEditorScrolling, setIsEditorScrolling] = useState(false)
  const [isPreviewScrolling, setIsPreviewScrolling] = useState(false)

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("write")
  const [error, setError] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [categoriesList, setCategoriesList] = useState<Category[]>([])
  const [isDraft, setIsDraft] = useState(false)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [draftId, setDraftId] = useState<string | null>(null)
  const [timeString, setTimeString] = useState("")

  const storageKey = postId
    ? `ctf-writeup-${postId}`
    : session && session.user && session.user.id
      ? `ctf-writeup-draft-${session.user.id}`
      : "ctf-writeup-draft"

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

  // Scroll synchronization between editor and preview
  useEffect(() => {
    if (
      viewMode !== "split" ||
      !editorRef.current ||
      !previewRef.current ||
      !editorWrapperRef.current ||
      !previewWrapperRef.current
    )
      return

    const handleEditorScroll = () => {
      if (isPreviewScrolling) return

      setIsEditorScrolling(true)

      const editorEl = editorRef.current
      const previewEl = previewWrapperRef.current

      if (!editorEl || !previewEl) return

      const editorScrollHeight = editorEl.scrollHeight - editorEl.clientHeight
      const previewScrollHeight = previewEl.scrollHeight - previewEl.clientHeight

      if (editorScrollHeight <= 0 || previewScrollHeight <= 0) return

      const scrollPercentage = editorEl.scrollTop / editorScrollHeight
      previewEl.scrollTop = scrollPercentage * previewScrollHeight

      setTimeout(() => setIsEditorScrolling(false), 100)
    }

    const handlePreviewScroll = () => {
      if (isEditorScrolling) return

      setIsPreviewScrolling(true)

      const editorEl = editorRef.current
      const previewEl = previewWrapperRef.current

      if (!editorEl || !previewEl) return

      const editorScrollHeight = editorEl.scrollHeight - editorEl.clientHeight
      const previewScrollHeight = previewEl.scrollHeight - previewEl.clientHeight

      if (editorScrollHeight <= 0 || previewScrollHeight <= 0) return

      const scrollPercentage = previewEl.scrollTop / previewScrollHeight
      editorEl.scrollTop = scrollPercentage * editorScrollHeight

      setTimeout(() => setIsPreviewScrolling(false), 100)
    }

    const editorElement = editorRef.current
    const previewElement = previewWrapperRef.current

    editorElement.addEventListener("scroll", handleEditorScroll)
    previewElement.addEventListener("scroll", handlePreviewScroll)

    return () => {
      editorElement.removeEventListener("scroll", handleEditorScroll)
      previewElement.removeEventListener("scroll", handlePreviewScroll)
    }
  }, [viewMode, isEditorScrolling, isPreviewScrolling])

  useEffect(() => {
    const savedWriteup = localStorage.getItem(storageKey)
    if (savedWriteup) {
      try {
        const parsed = JSON.parse(savedWriteup)
        setTitle(parsed.title || "")
        setCategory(parsed.category || "")
        setContent(parsed.content || "")
        setTags(parsed.tags ? (Array.isArray(parsed.tags) ? parsed.tags.join(", ") : parsed.tags) : "")
        setLastSaved(parsed.savedAt ? new Date(parsed.savedAt) : null)
        setIsDraft(parsed.isDraft)
      } catch (e) {
        console.error("Failed to parse saved writeup", e)
      }
    }
  }, [storageKey])

  useEffect(() => {
    if (!autoSaveEnabled) return
    const timeout = setTimeout(() => {
      if (title || content) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            title,
            category,
            content,
            tags,
            savedAt: new Date().toISOString(),
            isDraft,
          }),
        )
        setLastSaved(new Date())
      }
    }, 5000)
    return () => clearTimeout(timeout)
  }, [title, category, content, tags, autoSaveEnabled, storageKey, isDraft])

  useEffect(() => {
    let isMounted = true
    const fetchCategories = async () => {
      try {
        const categories = await fetchCategoriesAction()
        if (isMounted) {
          setCategoriesList(categories)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      if ((title || content) && session && session.user && session.user.id) {
        try {
          const draftResult = await saveDraftPost({
            title,
            categoryId: category,
            content,
            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            authorId: session.user.id,
            draftId,
          })
          if (draftResult?.id) {
            setDraftId(draftResult.id)
            toast({
              title: "Auto-saved",
              description: "Your draft has been saved to the database",
              className: "bg-primary/10 border-primary/30 text-white",
            })
          }
        } catch (err: any) {
          console.error("Auto-saving draft to DB failed", err)
        }
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [title, category, content, tags, session, draftId])

  useEffect(() => {
    if (isFullscreen) {
      setViewMode("split")
    }
  }, [isFullscreen])

  if (status === "unauthenticated") {
    redirect("/login")
  }

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault()

    if (!title.trim() || !content.trim() || !category) {
      setError("Please fill in all required fields including a valid category.")
      toast({
        title: "Error",
        description: "Please fill in all required fields including a valid category.",
        variant: "destructive",
      })
      return
    }

    if (!session || !session.user || !session.user.id) {
      setError("User not authenticated")
      return
    }
    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
      if (saveAsDraft) {
        const draftResult = await saveDraftPost({
          title,
          categoryId: category,
          content,
          tags: tagsArray,
          authorId: session.user.id,
          draftId,
        })
        if (draftResult?.id) setDraftId(draftResult.id)
      } else {
        if (postId) {
          const excerpt = content.slice(0, 200)
          await updatePost({
            id: postId,
            title,
            categoryId: category,
            content,
            excerpt,
            isDraft: false,
            tags: tagsArray,
          })
        } else {
          await createWriteup({
            title,
            categoryId: category,
            content,
            tags: tagsArray,
            authorId: session.user.id,
            isDraft: false,
          })
        }
      }

      localStorage.removeItem(storageKey)

      toast({
        title: saveAsDraft ? "Draft saved" : "Writeup published",
        description: saveAsDraft ? "Your draft has been saved." : "Your writeup is now live",
        className: "bg-primary/10 border-primary/30 text-white",
      })

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to save writeup")
      toast({
        title: "Error",
        description: err.message || "Failed to save writeup",
        variant: "destructive",
      })
    }
  }

  const clearDraft = () => {
    if (confirm("Are you sure you want to clear this draft? This action cannot be undone.")) {
      localStorage.removeItem(storageKey)
      setTitle("")
      setCategory("")
      setContent("")
      setTags("")
      setLastSaved(null)
      setIsDraft(false)
      setDraftId(null)
      toast({
        title: "Draft cleared",
        description: "Your draft has been deleted",
        className: "bg-primary/10 border-primary/30 text-white",
      })
    }
  }

  const insertTemplate = (template: string) => {
    setContent(CTF_TEMPLATES[template as keyof typeof CTF_TEMPLATES])
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const insertMarkdown = (markdownSyntax: string, selectionOffset = 0) => {
    if (!editorRef.current) return
    const textarea = editorRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    let newText: string
    let newCursorPos: number
    if (selectedText) {
      newText =
        textarea.value.substring(0, start) + markdownSyntax.replace("$1", selectedText) + textarea.value.substring(end)
      newCursorPos = end + markdownSyntax.length - 2
    } else {
      newText = textarea.value.substring(0, start) + markdownSyntax.replace("$1", "") + textarea.value.substring(end)
      newCursorPos = start + selectionOffset
    }
    setUndoStack((prev) => [...prev, content])
    setContent(newText)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault()
      insertMarkdown("    ", 4)
      return
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault()
      setUndoStack((prev) => {
        if (prev.length > 0) {
          const lastState = prev[prev.length - 1]
          setContent(lastState)
          return prev.slice(0, prev.length - 1)
        }
        return prev
      })
      return
    }
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault()
          insertMarkdown("**$1**", 2)
          break
        case "i":
          e.preventDefault()
          insertMarkdown("*$1*", 1)
          break
        case "k":
          e.preventDefault()
          insertMarkdown("[$1](url)", 1)
          break
        case "1":
          e.preventDefault()
          insertMarkdown("# $1", 2)
          break
        case "2":
          e.preventDefault()
          insertMarkdown("## $1", 3)
          break
        case "3":
          e.preventDefault()
          insertMarkdown("### $1", 4)
          break
      }
    }
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isFullscreen])

  useEffect(() => {
    if (isFullscreen && editorRef.current) {
      editorRef.current.focus()
    }
  }, [isFullscreen])

  // Function to get category icon based on category name
  function getCategoryIcon(categoryId: string) {
    const category = categoriesList.find((c) => c.id === categoryId)
    if (!category) return <FileCode2 className="h-4 w-4" />

    const name = category.name.toLowerCase()
    if (name.includes("web")) return <Code className="h-4 w-4" />
    if (name.includes("crypto")) return <Lock className="h-4 w-4" />
    if (name.includes("forensic")) return <Shield className="h-4 w-4" />
    if (name.includes("pwn") || name.includes("exploit")) return <Terminal className="h-4 w-4" />
    if (name.includes("reverse")) return <Cpu className="h-4 w-4" />
    if (name.includes("database") || name.includes("sql")) return <Database className="h-4 w-4" />
    if (name.includes("network")) return <Network className="h-4 w-4" />
    return <FileCode2 className="h-4 w-4" />
  }

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-black p-4 overflow-auto" : ""}`}>
      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="relative">
          {!isFullscreen && (
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm"></div>
          )}
          <Card
            className={`relative overflow-hidden ${isFullscreen ? "border-0 rounded-none shadow-none h-full bg-black" : "border-primary/30 bg-black/80 backdrop-blur-sm"}`}
          >
            <CardHeader className={`p-6 ${!isFullscreen ? "border-b border-primary/20 bg-primary/5" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Terminal className="h-5 w-5 text-primary" />
                  {postId ? "Edit Writeup" : "Create New Writeup"}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : "Not saved yet"}
                  </div>
                  <div className="h-1 w-1 rounded-full bg-primary/50"></div>
                  <div>{timeString}</div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium mb-2 block text-primary flex items-center gap-2"
                  >
                    <FileCode2 className="h-4 w-4" />
                    Title
                  </Label>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-md blur-sm opacity-50"></div>
                    <Input
                      id="title"
                      className="relative bg-black/80 border-primary/30 focus:border-primary"
                      placeholder="Enter writeup title"
                      value={title}
                      onChange={(e) => {
                        setUndoStack((prev) => [...prev, content])
                        setTitle(e.target.value)
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="md:w-1/3">
                  <Label
                    htmlFor="category"
                    className="text-sm font-medium mb-2 block text-primary flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Category
                  </Label>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-md blur-sm opacity-50"></div>
                    <Select value={category} onValueChange={(val) => setCategory(val)}>
                      <SelectTrigger className="relative bg-black/80 border-primary/30 focus:border-primary">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-primary/30">
                        {categoriesList.map((c: Category) => (
                          <SelectItem key={c.id} value={c.id} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(c.id)}
                              {c.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="tags" className="text-sm font-medium mb-2 block text-primary flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags (comma separated)
                </Label>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-md blur-sm opacity-50"></div>
                  <Input
                    id="tags"
                    className="relative bg-black/80 border-primary/30 focus:border-primary"
                    placeholder="Enter tags separated by commas"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertTemplate("basic")}
                    className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <FileCode2 className="h-3.5 w-3.5 mr-1" />
                    Basic Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertTemplate("detailed")}
                    className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <FileCode2 className="h-3.5 w-3.5 mr-1" />
                    Detailed Template
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Switch
                      id="auto-save"
                      checked={autoSaveEnabled}
                      onCheckedChange={setAutoSaveEnabled}
                      className="data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="auto-save" className="text-xs">
                      Auto-save
                    </Label>
                  </div>
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
                    <TabsList className="grid w-auto grid-cols-3 bg-primary/10 p-0.5">
                      <TabsTrigger
                        value="write"
                        className="text-xs px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Write
                      </TabsTrigger>
                      <TabsTrigger
                        value="preview"
                        className="text-xs px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Preview
                      </TabsTrigger>
                      <TabsTrigger
                        value="split"
                        className="text-xs px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Split
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-primary/30">
                        <p>{isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>

            <CardContent className={`${isFullscreen ? "p-0" : "p-6 pt-0"}`}>
              {viewMode === "split" ? (
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 min-w-0" ref={editorWrapperRef}>
                    <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm p-2 border-b border-primary/20">
                      <MarkdownToolbar onInsert={insertMarkdown} />
                    </div>
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-md blur-sm opacity-30"></div>
                      <textarea
                        ref={editorRef}
                        className="relative flex min-h-[400px] md:min-h-[600px] w-full rounded-md border border-primary/30 bg-black/80 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                        placeholder="Write your CTF writeup here using Markdown..."
                        value={content}
                        onChange={(e) => {
                          setUndoStack((prev) => [...prev, content])
                          setContent(e.target.value)
                        }}
                        onKeyDown={handleKeyDown}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0" ref={previewWrapperRef}>
                    <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm p-2 border-b border-primary/20 flex justify-between items-center">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        Preview
                      </span>
                      <div className="flex items-center gap-2">
                        <CopyButton text={content} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([content], { type: "text/markdown" })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = `${title || "writeup"}.md`
                            a.click()
                          }}
                          className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <FileDown className="h-3.5 w-3.5 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-md blur-sm opacity-30"></div>
                      <div
                        ref={previewRef}
                        className="relative min-h-[400px] md:min-h-[600px] border border-primary/30 rounded-md p-4 bg-black/80 overflow-auto"
                      >
                        {content ? (
                          <MarkdownPreview content={content} />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Your preview will appear here. Start writing to see it.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : viewMode === "write" ? (
                <>
                  <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm p-2 border-b border-primary/20">
                    <MarkdownToolbar onInsert={insertMarkdown} />
                  </div>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-md blur-sm opacity-30"></div>
                    <textarea
                      ref={editorRef}
                      className="relative flex min-h-[400px] md:min-h-[600px] w-full rounded-md border border-primary/30 bg-black/80 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                      placeholder="Write your CTF writeup here using Markdown..."
                      value={content}
                      onChange={(e) => {
                        setUndoStack((prev) => [...prev, content])
                        setContent(e.target.value)
                      }}
                      onKeyDown={handleKeyDown}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="relative">
                  <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm p-2 border-b border-primary/20 flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" />
                      Preview
                    </span>
                    <div className="flex items-center gap-2">
                      <CopyButton text={content} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([content], { type: "text/markdown" })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `${title || "writeup"}.md`
                          a.click()
                        }}
                        className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <FileDown className="h-3.5 w-3.5 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-md blur-sm opacity-30"></div>
                    <div
                      ref={previewRef}
                      className="relative min-h-[400px] md:min-h-[600px] border border-primary/30 rounded-md p-4 bg-black/80 overflow-auto"
                    >
                      {content ? (
                        <MarkdownPreview content={content} />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>Your preview will appear here. Start writing to see it.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {(!isFullscreen || viewMode === "preview") && (
              <CardFooter
                className={`${isFullscreen ? "fixed bottom-0 left-0 right-0 bg-black border-t border-primary/20 z-50" : "p-6 border-t border-primary/20 bg-primary/5"} flex flex-wrap gap-3`}
              >
                <Button
                  type="submit"
                  variant="default"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Save className="h-4 w-4" />
                  {postId ? "Update Writeup" : "Publish Writeup"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={(e) => handleSubmit(e, true)}
                >
                  <Clock className="h-4 w-4" />
                  Save as Draft
                </Button>
                <div className="flex-1"></div>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={clearDraft}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Draft
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </form>
    </div>
  )
}

// Update the MarkdownPreview component to better handle line breaks
function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-h1:text-2xl prose-h1:border-b prose-h1:border-primary/20 prose-h1:pb-2 prose-h2:text-xl prose-h2:border-b prose-h2:border-primary/10 prose-h2:pb-1 prose-h3:text-lg prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline prose-a:border-b prose-a:border-dotted prose-a:border-primary/50 hover:prose-a:border-primary prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Ensure line breaks are preserved
          br: ({ node, ...props }) => <br style={{ display: "block", content: "", marginTop: "0.75rem" }} {...props} />,
          // Ensure paragraphs have proper spacing
          p: ({ node, ...props }) => (
            <p style={{ marginBottom: "1rem", lineHeight: "1.6", whiteSpace: "pre-line" }} {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: "rgba(0, 255, 170, 0.3)",
                paddingLeft: "1rem",
                fontStyle: "italic",
                marginBottom: "1rem",
                backgroundColor: "rgba(0, 255, 170, 0.05)",
                padding: "0.5rem",
                borderRadius: "0 0.375rem 0.375rem 0",
                whiteSpace: "pre-line",
              }}
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              style={{
                border: "1px solid rgba(0, 255, 170, 0.2)",
                padding: "0.5rem",
                fontWeight: "semibold",
                backgroundColor: "rgba(0, 255, 170, 0.1)",
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td style={{ border: "1px solid rgba(0, 255, 170, 0.2)", padding: "0.5rem" }} {...props} />
          ),
          img: ({ node, ...props }) => (
            <div
              style={{
                maxWidth: "100%",
                margin: "1rem 0",
                borderRadius: "0.375rem",
                overflow: "hidden",
                border: "1px solid rgba(0, 255, 170, 0.3)",
                boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              <img style={{ maxWidth: "100%", height: "auto" }} {...props} />
            </div>
          ),
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "")
            return !inline && match ? (
              <div style={{ position: "relative", margin: "1.5rem 0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#1E1E1E",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem 0.375rem 0 0",
                    borderTop: "1px solid rgba(0, 255, 170, 0.3)",
                    borderLeft: "1px solid rgba(0, 255, 170, 0.3)",
                    borderRight: "1px solid rgba(0, 255, 170, 0.3)",
                    fontSize: "0.75rem",
                    color: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Code style={{ height: "1rem", width: "1rem", color: "rgb(0, 255, 170)" }} />
                    <span>{match[1]}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        height: "0.5rem",
                        width: "0.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(0, 255, 170, 0.5)",
                      }}
                    ></div>
                    <div
                      style={{
                        height: "0.5rem",
                        width: "0.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(0, 255, 170, 0.3)",
                      }}
                    ></div>
                    <div
                      style={{
                        height: "0.5rem",
                        width: "0.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(0, 255, 170, 0.1)",
                      }}
                    ></div>
                  </div>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: "0 0 0.375rem 0.375rem",
                    border: "1px solid rgba(0, 255, 170, 0.3)",
                    borderTop: "none",
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                style={{
                  backgroundColor: "rgba(0, 255, 170, 0.1)",
                  padding: "0.2rem 0.4rem",
                  borderRadius: "0.25rem",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  color: "rgb(0, 255, 170)",
                }}
                {...props}
              >
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}


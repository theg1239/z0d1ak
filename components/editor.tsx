"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Save,
  FileCode2,
  Minimize2,
  Maximize2,
  Clock,
  Copy,
  FileDown,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  LinkIcon,
  ImageIcon,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  Code,
  Terminal,
  Flag,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { createWriteup } from "@/app/actions/createWriteup";
import { updatePost } from "@/app/actions/updatePost";
import { saveDraftPost } from "@/app/actions/saveDraftPost";
import { fetchCategoriesAction } from "@/app/actions/fetchCategories";

type Category = {
  id: string;
  name: string;
};

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
};

type EditorProps = {
  postId?: string;
};

export default function Editor({ postId }: EditorProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("write");
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isDraft, setIsDraft] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);

  const storageKey = postId
    ? `ctf-writeup-${postId}`
    : session && session.user && session.user.id
    ? `ctf-writeup-draft-${session.user.id}`
    : "ctf-writeup-draft";
    
  useEffect(() => {
    const savedWriteup = localStorage.getItem(storageKey);
    if (savedWriteup) {
      try {
        const parsed = JSON.parse(savedWriteup);
        setTitle(parsed.title || "");
        setCategory(parsed.category || "");
        setContent(parsed.content || "");
        setTags(parsed.tags ? (Array.isArray(parsed.tags) ? parsed.tags.join(", ") : parsed.tags) : "");
        setLastSaved(parsed.savedAt ? new Date(parsed.savedAt) : null);
        setIsDraft(parsed.isDraft);
      } catch (e) {
        console.error("Failed to parse saved writeup", e);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (!autoSaveEnabled) return;
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
          })
        );
        setLastSaved(new Date());
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [title, category, content, tags, autoSaveEnabled, storageKey, isDraft]);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const categories = await fetchCategoriesAction();
        if (isMounted) {
          setCategoriesList(categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if ((title || content) && session && session.user && session.user.id) {
        try {
          const draftResult = await saveDraftPost({
            title,
            categoryId: category,
            content,
            tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
            authorId: session.user.id,
            draftId,
          });
          if (draftResult?.id) {
            setDraftId(draftResult.id);
            toast({ title: "Draft auto-saved to DB" });
          }
        } catch (err: any) {
          console.error("Auto-saving draft to DB failed", err);
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [title, category, content, tags, session, draftId]);

  useEffect(() => {
    if (isFullscreen) {
      setViewMode("split");
    }
  }, [isFullscreen]);

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !category) {
      setError("Please fill in all required fields including a valid category.");
      toast({
        title: "Error",
        description: "Please fill in all required fields including a valid category.",
        variant: "destructive",
      });   
      return;
    }

    if (!session || !session.user || !session.user.id) {
      setError("User not authenticated");
      return;
    }
    try {
      const tagsArray = tags.split(",").map(tag => tag.trim()).filter(Boolean);
      if (saveAsDraft) {
        const draftResult = await saveDraftPost({
          title,
          categoryId: category,
          content,
          tags: tagsArray,
          authorId: session.user.id,
          draftId,
        });
        if (draftResult?.id) setDraftId(draftResult.id);
      } else {
        if (postId) {
          const excerpt = content.slice(0, 200);
          await updatePost({
            id: postId,
            title,
            categoryId: category,
            content,
            excerpt,
            isDraft: false,
            tags: tagsArray,
          });
        } else {
          await createWriteup({
            title,
            categoryId: category,
            content,
            tags: tagsArray,
            authorId: session.user.id,
            isDraft: false,
          });
        }
      }

      localStorage.removeItem(storageKey);

      toast({
        title: saveAsDraft ? "Draft saved to DB successfully" : "Writeup published successfully",
        description: saveAsDraft ? "Your draft has been saved." : "Your writeup is now live",
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save writeup");
      toast({
        title: "Error",
        description: err.message || "Failed to save writeup",
        variant: "destructive",
      });
    }
  };

  const clearDraft = () => {
    if (confirm("Are you sure you want to clear this draft? This action cannot be undone.")) {
      localStorage.removeItem(storageKey);
      setTitle("");
      setCategory("");
      setContent("");
      setTags("");
      setLastSaved(null);
      setIsDraft(false);
      setDraftId(null);
      toast({
        title: "Draft cleared",
        description: "Your draft has been deleted",
      });
    }
  };

  const insertTemplate = (template: string) => {
    setContent(CTF_TEMPLATES[template as keyof typeof CTF_TEMPLATES]);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const insertMarkdown = (markdownSyntax: string, selectionOffset = 0) => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newText: string;
    let newCursorPos: number;
    if (selectedText) {
      newText =
        textarea.value.substring(0, start) +
        markdownSyntax.replace("$1", selectedText) +
        textarea.value.substring(end);
      newCursorPos = end + markdownSyntax.length - 2;
    } else {
      newText =
        textarea.value.substring(0, start) +
        markdownSyntax.replace("$1", "") +
        textarea.value.substring(end);
      newCursorPos = start + selectionOffset;
    }
    setUndoStack((prev) => [...prev, content]);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      insertMarkdown("    ", 4);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      setUndoStack((prev) => {
        if (prev.length > 0) {
          const lastState = prev[prev.length - 1];
          setContent(lastState);
          return prev.slice(0, prev.length - 1);
        }
        return prev;
      });
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          insertMarkdown("**$1**", 2);
          break;
        case "i":
          e.preventDefault();
          insertMarkdown("*$1*", 1);
          break;
        case "k":
          e.preventDefault();
          insertMarkdown("[$1](url)", 1);
          break;
        case "1":
          e.preventDefault();
          insertMarkdown("# $1", 2);
          break;
        case "2":
          e.preventDefault();
          insertMarkdown("## $1", 3);
          break;
        case "3":
          e.preventDefault();
          insertMarkdown("### $1", 4);
          break;
      }
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isFullscreen]);

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background p-4 overflow-auto" : ""}>
      <form onSubmit={(e) => handleSubmit(e, false)}>
        <Card
          className={`overflow-hidden ${isFullscreen ? "border-0 rounded-none shadow-none h-full" : "bg-card/50 backdrop-blur-sm border-primary/10"}`}
        >
          <CardHeader className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="title" className="text-sm font-medium mb-2 block text-primary">
                  Title
                </Label>
                <Input
                  id="title"
                  className="bg-background/50"
                  placeholder="Enter writeup title"
                  value={title}
                  onChange={(e) => {
                    setUndoStack((prev) => [...prev, content]);
                    setTitle(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="md:w-1/3">
                <Label htmlFor="category" className="text-sm font-medium mb-2 block text-primary">
                  Category
                </Label>
                <Select value={category} onValueChange={(val) => setCategory(val)}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesList.map((c: Category) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="tags" className="text-sm font-medium mb-2 block text-primary">
                Tags (comma separated)
              </Label>
              <Input
                id="tags"
                className="bg-background/50"
                placeholder="Enter tags separated by commas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate("basic")}
                  className="text-xs"
                >
                  <FileCode2 className="h-3.5 w-3.5 mr-1" />
                  Basic Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate("detailed")}
                  className="text-xs"
                >
                  <FileCode2 className="h-3.5 w-3.5 mr-1" />
                  Detailed Template
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Switch id="auto-save" checked={autoSaveEnabled} onCheckedChange={setAutoSaveEnabled} />
                  <Label htmlFor="auto-save" className="text-xs">
                    Auto-save
                  </Label>
                </div>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
                  <TabsList className="grid w-auto grid-cols-3">
                    <TabsTrigger value="write" className="text-xs px-2 py-1">
                      Write
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs px-2 py-1">
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="split" className="text-xs px-2 py-1">
                      Split
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
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
                <div className="flex-1 min-w-0">
                  <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm p-2 border-b">
                    <MarkdownToolbar onInsert={insertMarkdown} />
                  </div>
                  <textarea
                    ref={editorRef}
                    className="flex min-h-[400px] md:min-h-[600px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Write your CTF writeup here using Markdown..."
                    value={content}
                    onChange={(e) => {
                      setUndoStack((prev) => [...prev, content]);
                      setContent(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    required
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm p-2 border-b flex justify-between items-center">
                    <span className="text-sm font-medium">Preview</span>
                    <CopyButton text={content} />
                  </div>
                  <div className="min-h-[400px] md:min-h-[600px] border border-input rounded-md p-4 bg-background/50 overflow-auto">
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
            ) : viewMode === "write" ? (
              <>
                <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm p-2 border-b">
                  <MarkdownToolbar onInsert={insertMarkdown} />
                </div>
                <textarea
                  ref={editorRef}
                  className="flex min-h-[400px] md:min-h-[600px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Write your CTF writeup here using Markdown..."
                  value={content}
                  onChange={(e) => {
                    setUndoStack((prev) => [...prev, content]);
                    setContent(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  required
                />
              </>
            ) : (
              <div className="relative">
                <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm p-2 border-b flex justify-between items-center">
                  <span className="text-sm font-medium">Preview</span>
                  <div className="flex items-center gap-2">
                    <CopyButton text={content} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([content], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${title || "writeup"}.md`;
                        a.click();
                      }}
                      className="text-xs"
                    >
                      <FileDown className="h-3.5 w-3.5 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="min-h-[400px] md:min-h-[600px] border border-input rounded-md p-4 bg-background/50 overflow-auto">
                  {content ? (
                    <MarkdownPreview content={content} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>Your preview will appear here. Start writing to see it.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          {(!isFullscreen || viewMode === "preview") && (
            <CardFooter
              className={`${isFullscreen ? "fixed bottom-0 left-0 right-0 bg-background border-t z-50" : "p-6"} flex flex-wrap gap-3`}
            >
              <Button type="submit" variant="default" className="gap-2">
                <Save className="h-4 w-4" />
                {postId ? "Update Writeup" : "Publish Writeup"}
              </Button>
              <div className="flex-1"></div>
              <Button
                type="button"
                variant="secondary"
                className="gap-2"
                onClick={(e) => handleSubmit(e, true)}
              >
                <Clock className="h-4 w-4" />
                Save as Draft
              </Button>
            </CardFooter>
          )}
        </Card>
      </form>
    </div>
  );
}

function MarkdownToolbar({ onInsert }: { onInsert: (syntax: string, selectionOffset?: number) => void }) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("# $1", 2)}>
              <Heading1 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Heading 1</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("## $1", 3)}>
              <Heading2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Heading 2</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("### $1", 4)}>
              <Heading3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Heading 3</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("**$1**", 2)}>
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bold (Ctrl+B)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("*$1*", 1)}>
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Italic (Ctrl+I)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("[$1](url)", 1)}>
              <LinkIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Link (Ctrl+K)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("![alt text](image-url)", 2)}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Image</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("- $1", 2)}>
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bullet List</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("1. $1", 3)}>
              <ListOrdered className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Numbered List</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("- [ ] $1", 6)}>
              <CheckSquare className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Task List</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("```\n$1\n```", 4)}>
              <Code className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Code Block</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("```python\n$1\n```", 10)}>
              <FileCode2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Python Code Block</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("```bash\n$1\n```", 8)}>
              <Terminal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Terminal/Bash</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                onInsert("| Header | Header |\n| ------ | ------ |\n| Cell | Cell |\n| Cell | Cell |", 2)
              }
            >
              <Table className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Table</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsert("`flag{$1}`", 6)}>
              <Flag className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Flag Format</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs">
            <Copy className="h-3.5 w-3.5 mr-1" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy markdown to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          br: ({ node, ...props }) => (
            <br style={{ display: "block", content: "", marginTop: "0.75rem" }} {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "1.5rem", marginBottom: "1rem" }} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 style={{ fontSize: "1.75rem", fontWeight: "bold", marginTop: "1.25rem", marginBottom: "0.75rem" }} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginTop: "1rem", marginBottom: "0.5rem" }} {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 style={{ fontSize: "1.25rem", fontWeight: "bold", marginTop: "0.75rem", marginBottom: "0.5rem" }} {...props} />
          ),
          p: ({ node, ...props }) => (
            <p style={{ marginBottom: "1rem", lineHeight: "1.6" }} {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul style={{ listStyleType: "disc", paddingLeft: "2rem", marginBottom: "1rem" }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol style={{ listStyleType: "decimal", paddingLeft: "2rem", marginBottom: "1rem" }} {...props} />
          ),
          li: ({ node, ...props }) => (
            <li style={{ marginBottom: "0.25rem" }} {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: "rgba(0, 255, 170, 0.2)",
                paddingLeft: "1rem",
                fontStyle: "italic",
                marginBottom: "1rem",
              }}
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }} {...props} />
          ),
          table: ({ node, ...props }) => (
            <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
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
          td: ({ node, ...props }) => (
            <td style={{ border: "1px solid", padding: "0.5rem" }} {...props} />
          ),
          a: ({ node, ...props }) => (
            <a style={{ color: "rgb(0, 255, 170)", textDecoration: "none" }} target="_blank" rel="noopener noreferrer" {...props} />
          ),
          img: ({ node, ...props }) => (
            <img style={{ maxWidth: "100%", height: "auto", borderRadius: "0.375rem", marginTop: "1rem", marginBottom: "1rem" }} {...props} />
          ),
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: "1rem 0", borderRadius: "0.375rem" }}
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
          pre: ({ node, ...props }) => (
            <pre style={{ overflowX: "auto", borderRadius: "0.375rem", marginTop: "1rem", marginBottom: "1rem" }} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

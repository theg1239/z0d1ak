"use client"

import type React from "react"
import { useState, useEffect, useTransition, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Send, User, Terminal, Shield, Code } from "lucide-react"
import { likePost, addComment, getLikes, getComments } from "@/app/actions/postInteractions"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    name: string
    image?: string | null
  }
}

interface LikeCommentsProps {
  postId: string
}

export default function LikeComments({ postId }: LikeCommentsProps) {
  const [likes, setLikes] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [isPending, startTransition] = useTransition()
  const [showAllComments, setShowAllComments] = useState(false)
  const { data: session } = useSession()

  const fetchInteractions = useCallback(async () => {
    try {
      const [likesData, commentsData] = await Promise.all([getLikes(postId), getComments(postId)])
      setLikes(likesData.likes)
      setHasLiked(likesData.hasLiked)

      // Ensure each comment's createdAt is a string and user is always defined
      const formattedComments: Comment[] = commentsData.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        createdAt: new Date(comment.createdAt).toISOString(),
        user: comment.user ?? { name: "Unknown", image: null }, // Fix for null user
      }))

      setComments(formattedComments)
    } catch (error) {
      console.error("Error fetching interactions:", error)
    }
  }, [postId])

  useEffect(() => {
    fetchInteractions()
  }, [fetchInteractions])

  const handleLike = async () => {
    if (!session) {
      console.log("Please log in to like this post")
      return
    }

    try {
      startTransition(async () => {
        const res = await likePost(postId)
        setLikes(res.likes)
        setHasLiked(res.hasLiked)
      })
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      console.log("Please log in to comment")
      return
    }
    if (!commentText.trim()) return

    try {
      startTransition(async () => {
        const newComment = await addComment(postId, commentText)
        const formattedComment: Comment = {
          id: newComment.id,
          content: newComment.content,
          createdAt: new Date(newComment.createdAt).toISOString(),
          user: newComment.user ?? { name: "Unknown", image: null }, // Fix for null user
        }

        setComments((prev) => [formattedComment, ...prev])
        setCommentText("")
      })
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const visibleComments = showAllComments ? comments : comments.slice(0, 3)

  return (
    <div className="mt-12 space-y-8">
      {/* Interaction Buttons */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleLike}
          variant={hasLiked ? "default" : "outline"}
          size="sm"
          disabled={isPending}
          className={`gap-2 transition-all duration-300 ${hasLiked ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border-primary/30 text-primary hover:bg-primary/10"}`}
        >
          <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""} ${hasLiked ? "animate-pulse" : ""}`} />
          <span>{likes}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => document.getElementById("comment-input")?.focus()}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length}</span>
        </Button>
      </div>

      {/* Comments Section */}
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm"></div>
          <div className="relative bg-black border border-primary/30 rounded-xl p-4 md:p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 pb-2 border-b border-primary/20">
              <Terminal className="h-5 w-5 text-primary" />
              <span className="text-white">Comments</span>
              <span className="text-xs text-muted-foreground ml-2 font-mono">({comments.length})</span>
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-4 mb-8">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-lg blur-sm opacity-50"></div>
                <div className="relative">
                  <Textarea
                    id="comment-input"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[100px] bg-black/80 border-primary/30 focus:border-primary resize-none rounded-lg placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                  disabled={isPending || !commentText.trim()}
                >
                  <Send className="h-4 w-4" />
                  Submit
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {visibleComments.length > 0 ? (
                visibleComments.map((comment) => (
                  <div key={comment.id} className="group relative">
                    <div className="absolute -inset-2 bg-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex gap-4 p-3 rounded-lg transition-colors duration-300 group-hover:bg-black/50">
                      <Avatar className="h-10 w-10 border border-primary/30 shadow-[0_0_10px_rgba(0,255,170,0.2)]">
                        <AvatarImage src={comment.user.image || ""} alt={comment.user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{comment.user.name}</p>
                            <Shield className="h-3 w-3 text-primary" />
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-sm bg-black/50 p-3 rounded-md border-l-2 border-primary/30">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-primary/20 rounded-lg bg-black/50">
                  <Code className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {/* Show More Button */}
            {comments.length > 3 && (
              <div className="mt-6 pt-4 border-t border-primary/20 text-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="text-primary hover:text-primary/80 hover:bg-primary/5"
                >
                  {showAllComments ? "Show less" : `Show all ${comments.length} comments`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


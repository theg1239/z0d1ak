"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, User } from "lucide-react";
import { likePost, addComment, getLikes, getComments } from "@/app/actions/postInteractions";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    image?: string | null;
  };
}

interface LikeCommentsProps {
  postId: string;
}

export default function LikeComments({ postId }: LikeCommentsProps) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showAllComments, setShowAllComments] = useState(false);
  const { data: session } = useSession();

  const fetchInteractions = useCallback(async () => {
    try {
      const [likesData, commentsData] = await Promise.all([
        getLikes(postId),
        getComments(postId)
      ]);
      setLikes(likesData.likes);
      setHasLiked(likesData.hasLiked);

      // Ensure each comment's createdAt is a string and user is always defined
      const formattedComments: Comment[] = commentsData.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        createdAt: new Date(comment.createdAt).toISOString(),
        user: comment.user ?? { name: "Unknown", image: null }, // Fix for null user
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error("Error fetching interactions:", error);
    }
  }, [postId]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const handleLike = async () => {
    if (!session) {
      console.log("Please log in to like this post");
      return;
    }

    try {
      startTransition(async () => {
        const res = await likePost(postId);
        setLikes(res.likes);
        setHasLiked(res.hasLiked);
      });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      console.log("Please log in to comment");
      return;
    }
    if (!commentText.trim()) return;

    try {
      startTransition(async () => {
        const newComment = await addComment(postId, commentText);
        const formattedComment: Comment = {
          id: newComment.id,
          content: newComment.content,
          createdAt: new Date(newComment.createdAt).toISOString(),
          user: newComment.user ?? { name: "Unknown", image: null }, // Fix for null user
        };

        setComments((prev) => [formattedComment, ...prev]);
        setCommentText("");
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const visibleComments = showAllComments ? comments : comments.slice(0, 3);

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleLike}
          variant={hasLiked ? "default" : "outline"}
          size="sm"
          disabled={isPending}
          className="gap-2"
        >
          <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
          <span>{likes}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => document.getElementById("comment-input")?.focus()}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length}</span>
        </Button>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments
        </h2>

        <form onSubmit={handleAddComment} className="space-y-4">
          <Textarea
            id="comment-input"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" className="gap-2" variant="default" disabled={isPending || !commentText.trim()}>
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </form>

        <div className="space-y-6">
          {visibleComments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.user.image || ""} alt={comment.user.name} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{comment.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

        {comments.length > 3 && (
          <Button variant="link" onClick={() => setShowAllComments(!showAllComments)} className="mt-4">
            {showAllComments ? "Show less" : `Show all ${comments.length} comments`}
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { IVideo } from "@/models/Video";
import { IUser } from "@/models/User";
import mongoose from "mongoose";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import CommentSection from "./CommentSection";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VideoOverlayProps {
  video: IVideo;
}

export default function VideoOverlay({ video }: VideoOverlayProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  // Check if user has liked this video
  useEffect(() => {
    if (!session?.user?.email || !video._id) return;

    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/videos/${video._id}/like`);
        if (response.ok) {
          const data = await response.json();
          setLiked(data.liked || false);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [session, video._id]);

  const handleLike = async () => {
    if (!session) {
      toast({
        title: "Login required",
        description: "Please login to like videos",
        variant: "destructive",
      });
      return;
    }

    if (!video._id) return;

    setLoading(true);
    const previousLiked = liked;
    const previousCount = likesCount;

    // Optimistic update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await fetch(`/api/videos/${video._id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();
      setLiked(data.liked);
      setLikesCount(data.likes);
    } catch {
      // Revert on error
      setLiked(previousLiked);
      setLikesCount(previousCount);
      toast({
        title: "Error",
        description: "Failed to like video",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
        toast({
          title: "Shared",
          description: "Video shared successfully",
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Video link copied to clipboard",
      });
    }
  };

  // Author can be either ObjectId or populated User object
  const author = video.author as
    | (IUser & { _id?: mongoose.Types.ObjectId; id?: string })
    | mongoose.Types.ObjectId
    | undefined;
  const isPopulatedAuthor =
    author && typeof author === "object" && "email" in author;
  const authorName = isPopulatedAuthor
    ? author.displayName || author.username || author.email || "Unknown"
    : "Unknown";
  const authorAvatar = isPopulatedAuthor ? author.avatar || "" : "";
  const authorId = isPopulatedAuthor
    ? author._id?.toString() || author.id || ""
    : "";

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white pointer-events-none">
        <div className="flex items-end justify-between max-w-md mx-auto">
          {/* Left side - Author info */}
          <div className="flex-1 pointer-events-auto">
            <Link
              href={`/profile/${authorId}`}
              className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback>
                  {authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{authorName}</p>
              </div>
            </Link>
            <p className="text-sm mb-1 line-clamp-2">{video.title}</p>
            <p className="text-xs text-white/80 line-clamp-1">
              {video.description}
            </p>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex flex-col items-center gap-4 ml-4 pointer-events-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50",
                      liked && "text-red-500"
                    )}
                    onClick={handleLike}
                    disabled={loading}
                  >
                    <Heart className={cn("h-6 w-6", liked && "fill-current")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{liked ? "Unlike" : "Like"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-xs text-center">{likesCount}</p>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50"
                    onClick={() => setShowComments(true)}
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Comments</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50"
                    onClick={handleShare}
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {showComments && (
        <CommentSection
          videoId={video._id?.toString() || ""}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
}

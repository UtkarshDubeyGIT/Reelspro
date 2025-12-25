"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { IVideo } from "@/models/Video";
import ReelPlayer from "./ReelPlayer";
import VideoOverlay from "./VideoOverlay";
import { Skeleton } from "@/components/ui/skeleton";

interface ReelsFeedProps {
  initialVideos?: IVideo[];
}

export default function ReelsFeed({ initialVideos = [] }: ReelsFeedProps) {
  const [videos, setVideos] = useState<IVideo[]>(initialVideos);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);

  const loadMoreVideos = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/videos?limit=10&offset=${videos.length}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await response.json();

      if (data.videos && data.videos.length > 0) {
        setVideos((prev) => [...prev, ...data.videos]);
        setHasMore(data.pagination?.hasMore ?? false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading videos:", err);
      setError("Failed to load more videos");
    } finally {
      setLoading(false);
    }
  }, [videos.length, loading, hasMore]);

  // Set up Intersection Observer for auto-play
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setActiveIndex(index);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "0px",
      }
    );

    const currentRefs = videoRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) {
        observerRef.current?.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        currentRefs.forEach((ref) => {
          if (ref) {
            observerRef.current?.unobserve(ref);
          }
        });
      }
    };
  }, [videos.length]);

  // Load more when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > 0.8 && hasMore && !loading) {
        loadMoreVideos();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [hasMore, loading, loadMoreVideos]);

  const handleVideoEnd = () => {
    if (activeIndex < videos.length - 1) {
      setActiveIndex(activeIndex + 1);
      // Scroll to next video
      const nextRef = videoRefs.current[activeIndex + 1];
      if (nextRef) {
        nextRef.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  if (videos.length === 0 && !loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-background to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-foreground">No videos yet</p>
          <p className="text-sm text-muted-foreground">
            Upload a video to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {videos.map((video, index) => (
        <div
          key={video._id?.toString() || index}
          ref={(el) => {
            videoRefs.current[index] = el;
          }}
          data-index={index}
          className="relative h-screen w-full"
        >
          <ReelPlayer
            video={video}
            isActive={activeIndex === index}
            onVideoEnd={handleVideoEnd}
          />
          <VideoOverlay video={video} />
        </div>
      ))}

      {loading && (
        <div className="h-screen flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      {error && (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-background to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="text-center space-y-4">
            <p className="text-lg text-destructive mb-2 font-semibold">{error}</p>
            <Button
              onClick={loadMoreVideos}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      {!hasMore && videos.length > 0 && (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-background to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-lg">You're all caught up!</p>
            <p className="text-sm text-muted-foreground">No more videos to show</p>
          </div>
        </div>
      )}
    </div>
  );
}


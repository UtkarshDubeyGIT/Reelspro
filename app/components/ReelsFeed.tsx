"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { IVideo } from "@/models/Video";
import ReelPlayer from "./ReelPlayer";
import VideoOverlay from "./VideoOverlay";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";

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

    videoRefs.current.forEach((ref) => {
      if (ref) {
        observerRef.current?.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        videoRefs.current.forEach((ref) => {
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
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-2">No videos yet</p>
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
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-destructive mb-2">{error}</p>
            <button
              onClick={loadMoreVideos}
              className="text-sm underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {!hasMore && videos.length > 0 && (
        <div className="h-screen flex items-center justify-center">
          <p className="text-muted-foreground">No more videos</p>
        </div>
      )}
    </div>
  );
}


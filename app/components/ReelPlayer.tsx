"use client";

import { useEffect, useRef, useState } from "react";
import { IVideo } from "@/models/Video";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReelPlayerProps {
  video: IVideo;
  isActive: boolean;
  onVideoEnd?: () => void;
}

export default function ReelPlayer({ video, isActive, onVideoEnd }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Track user interaction globally
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
    };

    // Listen for any user interaction
    const events = ["click", "touchstart", "keydown"];
    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      // Only attempt to play if user has interacted
      if (hasUserInteracted) {
        videoElement.play().catch((err) => {
          // If play fails, show play button
          if (err.name === "NotAllowedError" || err.name === "NotSupportedError") {
            setNeedsInteraction(true);
          } else {
            console.error("Error playing video:", err);
            setHasError(true);
          }
        });
      } else {
        // Wait for user interaction
        setNeedsInteraction(true);
      }
    } else {
      // Pause video when not active
      videoElement.pause();
    }
  }, [isActive, hasUserInteracted]);

  const handleLoadedData = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleEnded = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  const handlePlayClick = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    setNeedsInteraction(false);
    setHasUserInteracted(true);

    try {
      await videoElement.play();
    } catch (err) {
      console.error("Error playing video:", err);
      setHasError(true);
    }
  };

  const handleVideoClick = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play().catch((err) => {
        console.error("Error playing video:", err);
      });
    } else {
      videoElement.pause();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-screen w-full bg-black flex items-center justify-center",
        "snap-start snap-always"
      )}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full bg-black/50" />
      )}
      
      {hasError ? (
        <div className="flex flex-col items-center justify-center text-white">
          <p className="text-lg mb-2">Failed to load video</p>
          <p className="text-sm text-gray-400">{video.title}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            className="h-full w-full object-contain cursor-pointer"
            playsInline
            loop={false}
            muted={false}
            onLoadedData={handleLoadedData}
            onError={handleError}
            onEnded={handleEnded}
            onClick={handleVideoClick}
          />
          {needsInteraction && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Button
                onClick={handlePlayClick}
                size="lg"
                className="rounded-full w-16 h-16 p-0"
                variant="secondary"
              >
                <Play className="w-8 h-8 ml-1" fill="currentColor" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}


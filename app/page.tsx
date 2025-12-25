"use client";

import { useEffect, useState } from "react";
import { IVideo } from "@/models/Video";
import ReelsFeed from "./components/ReelsFeed";

export default function Home() {
  const [initialVideos, setInitialVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/videos?limit=10&offset=0");
        const data = await response.json();
        setInitialVideos(data.videos || []);
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-background to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Loading videos...</p>
        </div>
      </div>
    );
  }

  return <ReelsFeed initialVideos={initialVideos} />;
}

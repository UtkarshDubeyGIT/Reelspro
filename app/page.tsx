"use client";

import { useEffect, useState } from "react";
import { IVideo } from "@/models/Video";
import ReelsFeed from "./components/ReelsFeed";
import { apiClient } from "@/lib/api-client";

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
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading videos...</p>
      </div>
    );
  }

  return <ReelsFeed initialVideos={initialVideos} />;
}

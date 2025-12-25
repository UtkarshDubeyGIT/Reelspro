"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IVideo } from "@/models/Video";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface UserProfile {
  _id: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  email?: string;
  bio?: string;
  videos: IVideo[];
  stats: {
    videos: number;
    followers: number;
    following: number;
  };
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-[9/16] w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive mb-2">{error || "Profile not found"}</p>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const userName = profile.displayName || profile.username || profile.email || "Unknown";
  const isOwnProfile = session?.user?.email === profile.email;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} alt={userName} />
                <AvatarFallback className="text-2xl">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{userName}</h1>
                {profile.username && (
                  <p className="text-muted-foreground mb-2">@{profile.username}</p>
                )}
                {profile.bio && (
                  <p className="text-sm mb-4">{profile.bio}</p>
                )}
                <div className="flex gap-4 mb-4">
                  <div>
                    <p className="font-semibold">{profile.stats.videos}</p>
                    <p className="text-sm text-muted-foreground">Videos</p>
                  </div>
                  <div>
                    <p className="font-semibold">{profile.stats.followers}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="font-semibold">{profile.stats.following}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </div>
                {!isOwnProfile && (
                  <Button>Follow</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="liked">Liked</TabsTrigger>
          </TabsList>
          <TabsContent value="videos">
            {profile.videos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No videos yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.videos.map((video) => (
                  <Link key={video._id?.toString()} href={`/?video=${video._id}`}>
                    <Card className="overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="aspect-[9/16] relative">
                        <video
                          src={video.videoUrl}
                          poster={video.thumbnailUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute bottom-2 left-2 flex items-center gap-2">
                          <Badge variant="secondary" className="bg-black/50 text-white">
                            <span className="mr-1">❤️</span>
                            {video.likes || 0}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-semibold line-clamp-1">{video.title}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="liked">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Liked videos coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


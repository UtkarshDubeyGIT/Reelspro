"use client";

import FileUpload from "../components/FileUpload";
import { apiClient } from "@/lib/api-client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number;
    aspectRatio: string;
  } | null>(null);
  const [progress, setProgress] = useState({ video: 0, thumb: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const disabled = status === "loading" || !session;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    if (!videoMetadata) {
      setError("Please upload a video first");
      return;
    }

    try {
      await apiClient.createVideo({
        title,
        description,
        videoUrl,
        thumbnailUrl,
        controls: true,
        duration: videoMetadata.duration,
        aspectRatio: videoMetadata.aspectRatio,
      });
      setSuccess("Saved video");
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setThumbnailUrl("");
      setVideoMetadata(null);
      setProgress({ video: 0, thumb: 0 });
      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save video";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-16 max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Upload Video</h1>
          <p className="text-muted-foreground">
            Upload a short-form video (max 60 seconds, 9:16 aspect ratio)
          </p>
          <Button variant="ghost" asChild>
            <Link href="/">← Back to feed</Link>
          </Button>
        </div>

        {disabled ? (
          <Card>
            <CardContent className="p-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please{" "}
                  <Link href="/login" className="underline font-medium">
                    login
                  </Link>{" "}
                  to upload videos.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
              <CardDescription>
                Upload your video and thumbnail, then add details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Video</label>
                    <FileUpload
                      fileType="video"
                      onSuccess={(res) => {
                        setVideoUrl(res.url);
                        if (res.duration && res.aspectRatio) {
                          setVideoMetadata({
                            duration: res.duration,
                            aspectRatio: res.aspectRatio,
                          });
                        }
                      }}
                      onProgress={(p) =>
                        setProgress((prev) => ({ ...prev, video: p }))
                      }
                      onVideoMetadata={(metadata) => setVideoMetadata(metadata)}
                    />
                    {progress.video > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Video upload: {progress.video}%
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Thumbnail</label>
                    <FileUpload
                      fileType="image"
                      onSuccess={(res) => setThumbnailUrl(res.url)}
                      onProgress={(p) =>
                        setProgress((prev) => ({ ...prev, thumb: p }))
                      }
                    />
                    {progress.thumb > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Thumbnail upload: {progress.thumb}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Enter video title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={3}
                      placeholder="Describe your video..."
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={
                    submitting || !videoUrl || !thumbnailUrl || !videoMetadata
                  }
                  className="w-full"
                >
                  {submitting ? "Saving…" : "Save Video"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

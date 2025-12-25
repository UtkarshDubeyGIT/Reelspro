"use client";

import { IKUpload } from "imagekitio-next";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadProps {
  onSuccess: (res: IKUploadResponse & { duration?: number; aspectRatio?: string }) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
  onVideoMetadata?: (metadata: { duration: number; aspectRatio: string }) => void;
}

export default function FileUpload({
  onSuccess,
  onProgress,
  fileType = "image",
  onVideoMetadata,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onError = (err: { message: string }) => {
    console.error("Upload error", err);
    setError(err.message);
    setUploading(false);
    setValidating(false);
  };

  const handleSuccess = (response: IKUploadResponse & { duration?: number; aspectRatio?: string }) => {
    setUploading(false);
    setValidating(false);
    setError(null);
    onSuccess(response);
  };

  const handleStartUpload = () => {
    setUploading(true);
    setError(null);
  };

  const handleProgress = (evt: ProgressEvent) => {
    if (evt.lengthComputable && onProgress) {
      const percentComplete = (evt.loaded / evt.total) * 100;
      onProgress(Math.round(percentComplete));
    }
  };

  const validateVideoMetadata = (file: File): Promise<{ duration: number; aspectRatio: string }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const duration = video.duration;
        const width = video.videoWidth;
        const height = video.videoHeight;
        const aspectRatio = `${width}:${height}`;
        const calculatedRatio = width / height;
        const targetRatio = 9 / 16;
        const tolerance = 0.05; // 5% tolerance

        if (duration > 60) {
          reject(new Error("Video duration must be 60 seconds or less"));
          return;
        }

        if (Math.abs(calculatedRatio - targetRatio) > tolerance) {
          reject(new Error(`Video aspect ratio must be 9:16. Current: ${aspectRatio}`));
          return;
        }

        resolve({ duration, aspectRatio: "9:16" });
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Failed to load video metadata"));
      };
    });
  };

  const validateFile = async (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a video file");
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("Video must be less than 100 MB");
        return false;
      }

      // Validate video metadata
      setValidating(true);
      try {
        const metadata = await validateVideoMetadata(file);
        if (onVideoMetadata) {
          onVideoMetadata(metadata);
        }
        setValidating(false);
        return true;
      } catch (err: any) {
        setError(err.message || "Video validation failed");
        setValidating(false);
        return false;
      }
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Use JPEG, PNG, or WEBP");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5 MB");
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-2 text-black">
      <div className="text-sm font-medium">Upload to ImageKit</div>
      <IKUpload
        fileName={fileType === "video" ? "video" : "image"}
        useUniqueFileName
        validateFile={validateFile}
        onError={onError}
        onSuccess={handleSuccess}
        onUploadProgress={handleProgress}
        onUploadStart={handleStartUpload}
        folder={fileType === "video" ? "/videos" : "/images"}
      />

      {validating && (
        <div className="flex items-center gap-2 text-xs text-black/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Validating video (duration & aspect ratio)…</span>
        </div>
      )}
      {uploading && (
        <div className="flex items-center gap-2 text-xs text-black/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading…</span>
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {fileType === "video" && !error && !uploading && !validating && (
        <p className="text-xs text-muted-foreground">
          Requirements: Max 60 seconds, 9:16 aspect ratio
        </p>
      )}
    </div>
  );
}

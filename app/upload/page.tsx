"use client";

import FileUpload from "../components/FileUpload";
import { apiClient } from "@/lib/api-client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [progress, setProgress] = useState({ video: 0, thumb: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const disabled = status === "loading" || !session;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await apiClient.createVideo({
        title,
        description,
        videoUrl,
        thumbnailUrl,
        controls: true,
      });
      setSuccess("Saved video");
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setThumbnailUrl("");
      setProgress({ video: 0, thumb: 0 });
    } catch (err) {
      console.error(err);
      setError("Failed to save video");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-black/60">
          Upload
        </p>
        <h1 className="text-3xl font-semibold text-black">
          Send a video to ImageKit
        </h1>
        <p className="text-sm text-black/70">
          Upload video and thumbnail, then save the record. Everything stays
          black & white.
        </p>
        <Link className="text-xs uppercase underline" href="/">
          Back to list
        </Link>
      </div>

      {disabled ? (
        <div className="rounded border border-dashed border-black/15 p-6 text-sm text-black/70">
          Login to upload.{" "}
          <Link className="underline" href="/login">
            Go to login
          </Link>
          .
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded border border-black/10 bg-white p-6"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wide text-black/60">
                Video
              </label>
              <FileUpload
                fileType="video"
                onSuccess={(res) => setVideoUrl(res.url)}
                onProgress={(p) =>
                  setProgress((prev) => ({ ...prev, video: p }))
                }
              />
              {progress.video > 0 && (
                <div className="text-xs text-black/60">
                  Video upload: {progress.video}%
                </div>
              )}
            </div>
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wide text-black/60">
                Thumbnail
              </label>
              <FileUpload
                fileType="image"
                onSuccess={(res) => setThumbnailUrl(res.url)}
                onProgress={(p) =>
                  setProgress((prev) => ({ ...prev, thumb: p }))
                }
              />
              {progress.thumb > 0 && (
                <div className="text-xs text-black/60">
                  Thumbnail upload: {progress.thumb}%
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-black/60">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="Title"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-black/60">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                rows={3}
                placeholder="What is this about?"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-black/60">
            <span>
              Video URL:{" "}
              {videoUrl ? (
                <span className="text-black">{videoUrl}</span>
              ) : (
                "Pending"
              )}
            </span>
            <span>
              Thumbnail URL:{" "}
              {thumbnailUrl ? (
                <span className="text-black">{thumbnailUrl}</span>
              ) : (
                "Pending"
              )}
            </span>
          </div>

          {error && (
            <div className="text-xs uppercase tracking-wide text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="text-xs uppercase tracking-wide text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !videoUrl || !thumbnailUrl}
            className="border border-black px-4 py-2 text-xs uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:border-black/30 disabled:text-black/30 hover:bg-black hover:text-white"
          >
            {submitting ? "Saving…" : "Save video"}
          </button>
        </form>
      )}
    </div>
  );
}

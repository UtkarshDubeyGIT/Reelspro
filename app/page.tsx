"use client";

import { apiClient } from "@/lib/api-client";
import { IVideo } from "@/models/Video";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

interface VideoFormState {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export default function Home() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<VideoFormState>({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
  });
  const { data: session } = useSession();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await apiClient.getVideos();
        setVideos(data);
      } catch (err) {
        setError("Could not load videos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await apiClient.createVideo(form);
      setVideos((prev) => [created, ...prev]);
      setForm({ title: "", description: "", videoUrl: "", thumbnailUrl: "" });
    } catch (err) {
      setError("Failed to save video");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-black/60">
          Reelspro
        </p>
        <h1 className="text-3xl font-semibold text-black">
          Simple reels board
        </h1>
        <p className="text-black/70 text-sm">
          Black-and-white workspace to list and add short videos. Auth to post;
          everyone can view.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Create a video</h2>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-black/60">
            <Link className="underline" href="/upload">
              Use uploader
            </Link>
            {!session && <span>Login to post</span>}
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded border border-black/10 bg-white p-4"
        >
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-black/60">
              Title
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="w-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-black"
              placeholder="Title"
              required
              disabled={!session}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-wide text-black/60">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-black"
              placeholder="What is this about?"
              rows={3}
              required
              disabled={!session}
            />
          </div>
          <div className="grid gap-2 md:grid-cols-2 md:gap-3">
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-black/60">
                Video URL
              </label>
              <input
                value={form.videoUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, videoUrl: e.target.value }))
                }
                className="w-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="https://"
                required
                disabled={!session}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-black/60">
                Thumbnail URL
              </label>
              <input
                value={form.thumbnailUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))
                }
                className="w-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="https://"
                required
                disabled={!session}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-black/60">
            <span>
              Provide direct URLs or use the ImageKit widget on upload pages.
            </span>
            <button
              type="submit"
              disabled={!session || submitting}
              className="border border-black px-4 py-2 text-xs uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:border-black/30 disabled:text-black/30 hover:bg-black hover:text-white"
            >
              {submitting ? "Saving..." : "Save video"}
            </button>
          </div>
          {error && (
            <div className="text-xs uppercase tracking-wide text-red-600">
              {error}
            </div>
          )}
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-black">Latest videos</h2>
        {loading ? (
          <div className="text-sm text-black/60">Loading…</div>
        ) : videos.length === 0 ? (
          <div className="rounded border border-dashed border-black/15 p-6 text-sm text-black/60">
            No videos yet. Add one to get started.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <article
                key={video._id?.toString() || video.title}
                className="space-y-3 rounded border border-black/10 bg-white p-4 shadow-[0_2px_0_#00000010]"
              >
                <div className="aspect-[9/16] w-full overflow-hidden rounded bg-black/5">
                  <video
                    className="h-full w-full object-cover"
                    src={video.videoUrl}
                    poster={video.thumbnailUrl}
                    controls={video.controls ?? true}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-black">
                    {video.title}
                  </h3>
                  <p className="text-sm text-black/70">{video.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

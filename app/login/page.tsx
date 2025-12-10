"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/");
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded border border-black/10 bg-white p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-black/60">
          Login
        </p>
        <h1 className="text-2xl font-semibold text-black">Access your reels</h1>
        <p className="text-sm text-black/70">
          Use the email and password you registered with to sign in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-black/60">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-black"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-black/60">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-black"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <div className="text-xs uppercase tracking-wide text-red-600">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full border border-black px-4 py-2 text-xs uppercase tracking-wide transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-black/30 disabled:text-black/30"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-xs text-black/60">
        Need an account?{" "}
        <Link className="underline" href="/register">
          Register
        </Link>
        .
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  const handleSignout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="border-b border-black/10 bg-white text-black">
      <div className="flex items-center justify-between py-4">
        <Link href="/" className="font-semibold tracking-tight">
          Reelspro
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {status === "loading" ? (
            <span className="text-xs">Loading…</span>
          ) : session ? (
            <>
              <span className="text-xs uppercase tracking-wide text-black/70">
                {session.user?.email}
              </span>
              <button
                onClick={handleSignout}
                className="border border-black px-3 py-1 text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="border border-black px-3 py-1 text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="border border-black px-3 py-1 text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

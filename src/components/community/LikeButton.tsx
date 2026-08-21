"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toggleLike } from "@/app/(main)/community/actions";

export function LikeButton({
  postId,
  liked,
  count,
  signedIn,
}: {
  postId: string;
  liked: boolean;
  count: number;
  signedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-700"
      >
        ▲ {count}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleLike(postId))}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-50 ${
        liked
          ? "border-orange-500 bg-orange-500/10 text-orange-500"
          : "border-zinc-300 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700"
      }`}
    >
      ▲ {count}
    </button>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-lg font-semibold">Something went wrong.</h1>
      <p className="max-w-sm text-sm text-zinc-500">
        We hit an unexpected error. Try again, or head back home if it keeps happening.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
        <Link href="/" className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700">
          Go home
        </Link>
      </div>
    </main>
  );
}

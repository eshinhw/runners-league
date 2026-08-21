"use client";

import { useEffect, useState } from "react";

// Preloads via a detached Image() instead of relying on the rendered <img>'s
// onError: the DOM "error" event doesn't bubble, and for an instantly-broken
// URL (cached failure, dead link) it can fire before React finishes
// attaching the handler — so onError alone can silently miss it and leave
// the browser's broken-image glyph on screen. A probe's load/error handlers
// are always wired up before its src is set, so this can't lose that race.
export function Avatar({
  src,
  alt,
  fallbackText,
  className = "",
}: {
  src: string | null;
  alt: string;
  fallbackText: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    if (!src) return;

    let cancelled = false;
    const probe = new window.Image();
    probe.onload = () => {
      if (!cancelled) setLoaded(true);
    };
    probe.onerror = () => {
      if (!cancelled) setLoaded(false);
    };
    probe.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full bg-zinc-200 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 ${className}`}
    >
      {loaded && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        fallbackText
      )}
    </div>
  );
}

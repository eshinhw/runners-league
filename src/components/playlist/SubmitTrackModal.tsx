"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { searchTracks, submitTrack } from "@/app/(main)/playlist/actions";
import { useToast } from "@/components/Toast";
import type { ItunesTrack } from "@/lib/itunes";

const SEARCH_DEBOUNCE_MS = 400;

export function SubmitTrackModal({ onSubmitted }: { onSubmitted: () => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ItunesTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchTracks(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function closeAndReset() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setError(null);
  }

  function pick(track: ItunesTrack) {
    setError(null);
    setPickingId(track.itunesTrackId);
    startTransition(async () => {
      try {
        const result = await submitTrack(track.itunesTrackId);
        closeAndReset();
        showToast(result.alreadyShared ? "Already on the chart — upvoted!" : "Song added to the chart");
        onSubmitted();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setPickingId(null);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white"
      >
        + Share a Song
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeAndReset}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Share a Song</h2>
              <button
                type="button"
                onClick={closeAndReset}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a song or artist…"
              className="w-full shrink-0 rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />

            {error && <p className="mt-2 shrink-0 text-sm text-rose-500">{error}</p>}

            <div className="mt-3 flex flex-col gap-1 overflow-y-auto">
              {searching && <p className="px-1 text-xs text-zinc-500">Searching…</p>}
              {!searching && query.trim() && results.length === 0 && (
                <p className="px-1 text-xs text-zinc-500">No matches — try a different search.</p>
              )}
              {results.map((track) => (
                <button
                  key={track.itunesTrackId}
                  type="button"
                  disabled={pending}
                  onClick={() => pick(track)}
                  className="flex items-center gap-3 rounded-lg border border-transparent p-2 text-left hover:border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  {track.albumArtUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={track.albumArtUrl} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded bg-zinc-200 dark:bg-zinc-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{track.title}</div>
                    <div className="truncate text-xs text-zinc-500">{track.artist}</div>
                  </div>
                  {pickingId === track.itunesTrackId && (
                    <span className="shrink-0 text-xs text-zinc-400">Adding…</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

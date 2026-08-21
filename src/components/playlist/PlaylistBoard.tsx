"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toggleTrackVote } from "@/app/(main)/playlist/actions";
import { SubmitTrackModal } from "@/components/playlist/SubmitTrackModal";
import type { PlaylistTrack } from "@/lib/playlist";

const POLL_MS = 8000;

function splitChart(tracks: PlaylistTrack[]) {
  const charted = tracks.filter((t) => t.score > 0);
  const unranked = [...tracks.filter((t) => t.score === 0)].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return { charted, unranked };
}

function VoteButton({
  score,
  voted,
  signedIn,
  pending,
  onVote,
}: {
  score: number;
  voted: boolean;
  signedIn: boolean;
  pending: boolean;
  onVote: () => void;
}) {
  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-700"
      >
        ▲ {score}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onVote}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-50 ${
        voted
          ? "border-orange-500 bg-orange-500/10 text-orange-500"
          : "border-zinc-300 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700"
      }`}
    >
      ▲ {score}
    </button>
  );
}

function TrackRow({
  track,
  rank,
  delta,
  signedIn,
  pending,
  onVote,
  rowRef,
}: {
  track: PlaylistTrack;
  rank: number | null;
  delta: number;
  signedIn: boolean;
  pending: boolean;
  onVote: () => void;
  rowRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={rowRef}
      className={`flex items-center gap-3 rounded-lg border p-3 ${
        rank !== null ? "border-zinc-200 dark:border-zinc-800" : "border-dashed border-zinc-300 dark:border-zinc-700"
      }`}
    >
      {rank !== null && (
        <div className="flex w-8 shrink-0 flex-col items-center">
          <span className="font-mono text-lg font-semibold tabular-nums">{rank}</span>
          {delta > 0 && <span className="text-[10px] font-medium text-emerald-500">▲{delta}</span>}
          {delta < 0 && <span className="text-[10px] font-medium text-rose-500">▼{Math.abs(delta)}</span>}
        </div>
      )}
      {track.albumArtUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={track.albumArtUrl} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
      ) : (
        <div className="h-12 w-12 shrink-0 rounded bg-zinc-200 dark:bg-zinc-800" />
      )}
      <div className="min-w-0 flex-1">
        <a
          href={track.itunesUrl}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-sm font-medium hover:underline"
        >
          {track.title}
        </a>
        <div className="truncate text-xs text-zinc-500">
          {track.artist} · shared by {track.submittedBy}
        </div>
      </div>
      <VoteButton score={track.score} voted={track.voted} signedIn={signedIn} pending={pending} onVote={onVote} />
    </div>
  );
}

export function PlaylistBoard({
  initialTracks,
  signedIn,
}: {
  initialTracks: PlaylistTrack[];
  signedIn: boolean;
}) {
  const [tracks, setTracks] = useState(initialTracks);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [movement, setMovement] = useState<Map<string, number>>(new Map());
  const prevRankRef = useRef<Map<string, number>>(new Map());
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const ranks = new Map<string, number>();
    splitChart(initialTracks).charted.forEach((t, i) => ranks.set(t.id, i));
    prevRankRef.current = ranks;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyTracks(next: PlaylistTrack[]) {
    const nextRanks = new Map<string, number>();
    splitChart(next).charted.forEach((t, i) => nextRanks.set(t.id, i));

    const nextMovement = new Map<string, number>();
    nextRanks.forEach((rank, id) => {
      const prevRank = prevRankRef.current.get(id);
      if (prevRank !== undefined) nextMovement.set(id, prevRank - rank);
    });
    setMovement(nextMovement);
    prevRankRef.current = nextRanks;

    const rects = new Map<string, DOMRect>();
    rowRefs.current.forEach((el, id) => rects.set(id, el.getBoundingClientRect()));
    prevRectsRef.current = rects;

    setTracks(next);
  }

  async function refreshNow() {
    try {
      const res = await fetch("/api/playlist", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as PlaylistTrack[];
      applyTracks(data);
    } catch {
      // transient network hiccup — the next poll will retry
    }
  }

  useLayoutEffect(() => {
    rowRefs.current.forEach((el, id) => {
      const prevRect = prevRectsRef.current.get(id);
      if (!prevRect) return;
      const newRect = el.getBoundingClientRect();
      const deltaY = prevRect.top - newRect.top;
      if (deltaY) {
        el.style.transition = "none";
        el.style.transform = `translateY(${deltaY}px)`;
        requestAnimationFrame(() => {
          el.style.transition = "transform 400ms ease";
          el.style.transform = "";
        });
      }
    });
  }, [tracks]);

  useEffect(() => {
    const interval = setInterval(refreshNow, POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVote(trackId: string) {
    setPendingId(trackId);
    const current = tracks.find((t) => t.id === trackId);
    if (current) {
      const optimistic = tracks.map((t) =>
        t.id === trackId ? { ...t, voted: !t.voted, score: t.score + (t.voted ? -1 : 1) } : t,
      );
      applyTracks(optimistic);
    }
    try {
      await toggleTrackVote(trackId);
    } finally {
      setPendingId(null);
    }
  }

  const { charted, unranked } = splitChart(tracks);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        {signedIn ? (
          <SubmitTrackModal onSubmitted={refreshNow} />
        ) : (
          <Link href="/login" className="text-sm font-medium text-orange-500 underline">
            Sign in to share a song
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          {charted.length === 0 && (
            <p className="text-sm text-zinc-500">No upvotes yet — be the first to vote for a song below.</p>
          )}
          {charted.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              rank={i + 1}
              delta={movement.get(track.id) ?? 0}
              signedIn={signedIn}
              pending={pendingId === track.id}
              onVote={() => handleVote(track.id)}
              rowRef={(el) => {
                if (el) rowRefs.current.set(track.id, el);
                else rowRefs.current.delete(track.id);
              }}
            />
          ))}
        </div>

        {unranked.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">New Submissions</h2>
            {unranked.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                rank={null}
                delta={0}
                signedIn={signedIn}
                pending={pendingId === track.id}
                onVote={() => handleVote(track.id)}
                rowRef={(el) => {
                  if (el) rowRefs.current.set(track.id, el);
                  else rowRefs.current.delete(track.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

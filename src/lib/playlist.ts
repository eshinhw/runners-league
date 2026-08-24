import { prisma } from "@/lib/prisma";

export type PlaylistTrack = {
  id: string;
  title: string;
  artist: string;
  albumArtUrl: string | null;
  itunesUrl: string;
  previewUrl: string | null;
  score: number;
  voted: boolean;
  submittedBy: string;
  submittedByUsername: string;
  createdAt: string;
  // Only the submitter can remove a track, and only while no one else has
  // upvoted it — once another runner likes it, it's no longer just theirs
  // to pull.
  canDelete: boolean;
};

export async function getPlaylist(viewerId: string | undefined): Promise<PlaylistTrack[]> {
  const tracks = await prisma.track.findMany({
    include: {
      submittedBy: { select: { displayId: true, username: true } },
      likes: { select: { userId: true } },
    },
    orderBy: [{ likes: { _count: "desc" } }, { createdAt: "asc" }],
  });

  return tracks.map((t) => {
    const likedByOthers = t.likes.some((l) => l.userId !== t.submittedById);
    return {
      id: t.id,
      title: t.title,
      artist: t.artist,
      albumArtUrl: t.albumArtUrl,
      itunesUrl: t.itunesUrl,
      previewUrl: t.previewUrl,
      score: t.likes.length,
      voted: viewerId ? t.likes.some((l) => l.userId === viewerId) : false,
      submittedBy: t.submittedBy.displayId,
      submittedByUsername: t.submittedBy.username,
      createdAt: t.createdAt.toISOString(),
      canDelete: viewerId === t.submittedById && !likedByOthers,
    };
  });
}

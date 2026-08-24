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
};

export async function getPlaylist(viewerId: string | undefined): Promise<PlaylistTrack[]> {
  const tracks = await prisma.track.findMany({
    include: {
      submittedBy: { select: { displayId: true, username: true } },
      likes: viewerId ? { where: { userId: viewerId }, select: { id: true } } : false,
      _count: { select: { likes: true } },
    },
    orderBy: [{ likes: { _count: "desc" } }, { createdAt: "asc" }],
  });

  return tracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    albumArtUrl: t.albumArtUrl,
    itunesUrl: t.itunesUrl,
    previewUrl: t.previewUrl,
    score: t._count.likes,
    voted: Array.isArray(t.likes) && t.likes.length > 0,
    submittedBy: t.submittedBy.displayId,
    submittedByUsername: t.submittedBy.username,
    createdAt: t.createdAt.toISOString(),
  }));
}

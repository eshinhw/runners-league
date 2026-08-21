"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { lookupItunesTrack, searchItunesTracks, type ItunesTrack } from "@/lib/itunes";
import { prisma } from "@/lib/prisma";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You need to be signed in.");
  return session.user.id;
}

export async function searchTracks(query: string): Promise<ItunesTrack[]> {
  return searchItunesTracks(query);
}

export async function submitTrack(itunesTrackId: string): Promise<{ alreadyShared: boolean }> {
  const userId = await requireUserId();

  const existing = await prisma.track.findUnique({ where: { itunesTrackId } });

  let trackId: string;
  let alreadyShared: boolean;

  if (existing) {
    trackId = existing.id;
    alreadyShared = true;
  } else {
    // Re-verify server-side rather than trusting client-submitted metadata —
    // this is what guarantees every chart entry is a real, existing song.
    const verified = await lookupItunesTrack(itunesTrackId);
    if (!verified) throw new Error("Couldn't verify that song — please pick one from the search results.");

    const created = await prisma.track.create({
      data: {
        itunesTrackId: verified.itunesTrackId,
        title: verified.title,
        artist: verified.artist,
        albumArtUrl: verified.albumArtUrl,
        previewUrl: verified.previewUrl,
        itunesUrl: verified.itunesUrl,
        submittedById: userId,
      },
    });
    trackId = created.id;
    alreadyShared = false;
  }

  await prisma.like.upsert({
    where: { userId_trackId: { userId, trackId } },
    create: { userId, trackId },
    update: {},
  });

  revalidatePath("/playlist");
  return { alreadyShared };
}

export async function toggleTrackVote(trackId: string) {
  const userId = await requireUserId();

  const existing = await prisma.like.findUnique({
    where: { userId_trackId: { userId, trackId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, trackId } });
  }

  revalidatePath("/playlist");
}

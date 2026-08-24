// One-off bootstrap for the Runners Playlist: creates a handful of
// well-known running anthems, verified against the real iTunes Search API
// (same lookup path as a real submission — see lib/itunes.ts / playlist
// actions.ts), then distributes upvotes across the current mock users so
// the chart looks populated. Purely additive, and every row it creates is
// owned by (or liked by) `isMockData: true` users, so `remove.ts` cleans it
// all up automatically along with everything else those users own.
//
// Run with:  npx tsx --env-file=.env prisma/mockData/seedPlaylist.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type ItunesApiResult = {
  wrapperType?: string;
  trackId?: number;
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
};

async function findTrack(term: string) {
  const url = `https://itunes.apple.com/search?media=music&entity=song&limit=1&term=${encodeURIComponent(term)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes search failed for "${term}"`);
  const data = (await res.json()) as { results?: ItunesApiResult[] };
  const r = data.results?.[0];
  if (!r?.trackId || !r.trackName || !r.artistName || !r.trackViewUrl) {
    throw new Error(`No verified iTunes match for "${term}"`);
  }
  return {
    itunesTrackId: String(r.trackId),
    title: r.trackName,
    artist: r.artistName,
    albumArtUrl: r.artworkUrl100 ? r.artworkUrl100.replace("100x100", "300x300") : null,
    previewUrl: r.previewUrl ?? null,
    itunesUrl: r.trackViewUrl,
  };
}

// [search term, upvote count] — ordered most- to least-voted. Upvote count
// is capped at the number of mock users available to cast them.
const RUNNING_ANTHEMS: [string, number][] = [
  ["Eye of the Tiger Survivor", 5],
  ["Lose Yourself Eminem", 4],
  ["Can't Stop the Feeling Justin Timberlake", 4],
  ["Stronger Kanye West", 3],
  ["Uptown Funk Mark Ronson", 2],
  ["Blinding Lights The Weeknd", 1],
];

async function main() {
  const mockUsers = await prisma.user.findMany({ where: { isMockData: true }, select: { id: true } });
  if (mockUsers.length === 0) throw new Error("No mock users found — run seed.ts first.");

  let created = 0;

  for (let i = 0; i < RUNNING_ANTHEMS.length; i++) {
    const [term, voteCount] = RUNNING_ANTHEMS[i];
    const verified = await findTrack(term);
    const submitter = mockUsers[i % mockUsers.length];

    const track = await prisma.track.upsert({
      where: { itunesTrackId: verified.itunesTrackId },
      update: {},
      create: {
        itunesTrackId: verified.itunesTrackId,
        title: verified.title,
        artist: verified.artist,
        albumArtUrl: verified.albumArtUrl,
        previewUrl: verified.previewUrl,
        itunesUrl: verified.itunesUrl,
        submittedById: submitter.id,
      },
    });

    // Submitter always upvotes their own share (matches submitTrack's
    // real behavior), then spread the remaining votes across other users.
    const voters = [submitter, ...mockUsers.filter((u) => u.id !== submitter.id)].slice(0, Math.max(voteCount, 1));
    for (const voter of voters) {
      await prisma.like.upsert({
        where: { userId_trackId: { userId: voter.id, trackId: track.id } },
        update: {},
        create: { userId: voter.id, trackId: track.id },
      });
    }

    created++;
    console.log(`${verified.title} — ${verified.artist} (${voters.length} votes)`);
  }

  console.log(`Seeded ${created} playlist tracks.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

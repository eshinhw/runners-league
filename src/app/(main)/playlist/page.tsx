import { PlaylistBoard } from "@/components/playlist/PlaylistBoard";
import { SignInGate } from "@/components/SignInGate";
import { auth } from "@/lib/auth";
import { getPlaylist } from "@/lib/playlist";

export const dynamic = "force-dynamic";

export default async function PlaylistPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <SignInGate
        title="Runners Playlist"
        description="Sign in to see the songs runners are running to and vote for your favorites."
      />
    );
  }

  const tracks = await getPlaylist(session.user.id);

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Runners Playlist</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Songs runners love to run with — upvote your favorites to send them up the chart.
        </p>
      </div>

      <PlaylistBoard initialTracks={tracks} signedIn />
    </main>
  );
}

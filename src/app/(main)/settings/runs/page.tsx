import { AddRaceModal } from "@/components/races/AddRaceModal";
import { EditRaceModal } from "@/components/races/EditRaceModal";
import { RunDeleteButton } from "@/components/RunDeleteButton";
import { auth } from "@/lib/auth";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MyRunsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-zinc-500">Sign in to manage My Races.</p>
      </main>
    );
  }

  const runs = await prisma.activity.findMany({
    where: { userId: session.user.id, source: "MANUAL", major: { not: null } },
    orderBy: { startedAt: "desc" },
  });
  const unitSystem = session.user.unitSystem;

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Races</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your World Marathon Majors finishes. These power your Rankings progress.
          </p>
        </div>
        <AddRaceModal />
      </div>

      <ul className="flex flex-col gap-3">
        {runs.length === 0 && <p className="text-sm text-zinc-500">No majors logged yet.</p>}
        {runs.map((run) => (
          <li key={run.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            {run.photoUrls.length > 0 && (
              <div className="mb-3 flex gap-2 overflow-x-auto">
                {run.photoUrls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt={run.title ?? "run photo"}
                    className="h-24 w-24 shrink-0 rounded object-cover"
                  />
                ))}
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{run.title}</div>
                <div className="text-xs text-zinc-500">{run.location ? `${run.location}` : ""}</div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <EditRaceModal run={run} />
                <RunDeleteButton activityId={run.id} />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm tabular-nums">
              <span>{formatDistance(run.distanceM, unitSystem)}</span>
              <span>{formatDuration(run.durationSec)}</span>
              <span className="text-zinc-500">{formatPace(run.avgPaceSecPerKm, unitSystem)}</span>
              {run.avgHeartRateBpm && <span className="text-zinc-500">{run.avgHeartRateBpm} bpm</span>}
              {run.avgCadenceSpm && <span className="text-zinc-500">{run.avgCadenceSpm} spm</span>}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

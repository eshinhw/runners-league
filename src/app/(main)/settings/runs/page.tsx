import { AddRaceModal } from "@/components/races/AddRaceModal";
import { EditRaceModal } from "@/components/races/EditRaceModal";
import { RunDeleteButton } from "@/components/RunDeleteButton";
import { DistanceValue, PaceValue } from "@/components/units/UnitDisplay";
import { UnitToggle } from "@/components/units/UnitToggle";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { auth } from "@/lib/auth";
import { formatDuration } from "@/lib/format";
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

      {runs.length > 0 && <UnitToggle className="self-start" />}

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
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{run.title}</span>
                  {run.verifiedAt && <VerifiedBadge className="h-4 w-4" />}
                </div>
                <div className="text-xs text-zinc-500">
                  {[
                    run.location,
                    run.bibNumber ? `Bib #${run.bibNumber}` : null,
                    run.officialFirstName || run.officialLastName
                      ? [run.officialFirstName, run.officialLastName].filter(Boolean).join(" ")
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {!run.verifiedAt && (
                  <div className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] text-zinc-500 dark:border-zinc-700">
                    Pending verification
                  </div>
                )}
                <EditRaceModal run={run} />
                <RunDeleteButton activityId={run.id} />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm tabular-nums">
              <span>
                <DistanceValue meters={run.distanceM} />
              </span>
              <span>{formatDuration(run.durationSec)}</span>
              <span className="text-zinc-500">
                <PaceValue secPerKm={run.avgPaceSecPerKm} />
              </span>
              {run.avgHeartRateBpm && <span className="text-zinc-500">{run.avgHeartRateBpm} bpm</span>}
              {run.avgCadenceSpm && <span className="text-zinc-500">{run.avgCadenceSpm} spm</span>}
              {run.elevationGainM != null && <span className="text-zinc-500">↗ {run.elevationGainM} m</span>}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

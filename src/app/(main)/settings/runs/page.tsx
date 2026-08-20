import { RunDeleteButton } from "@/components/RunDeleteButton";
import { auth } from "@/lib/auth";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { addRun } from "./actions";

export const dynamic = "force-dynamic";

const RUN_TYPE_LABEL: Record<string, string> = {
  RACE: "🏅 Official Race",
  EASY: "🙂 Training Run",
};

const DISTANCE_PRESETS = [
  { value: "5000", label: "5K" },
  { value: "10000", label: "10K" },
  { value: "21097", label: "Half Marathon" },
  { value: "42195", label: "Full Marathon" },
  { value: "custom", label: "Custom" },
];

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export default async function MyRunsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-zinc-500">Sign in to manage My Runs.</p>
      </main>
    );
  }

  const runs = await prisma.activity.findMany({
    where: { userId: session.user.id, source: "MANUAL" },
    orderBy: { startedAt: "desc" },
  });

  return (
    <main className="flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">My Runs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Log official race results or memorable training runs, with photos. These records aren&apos;t
          included in Rankings.
        </p>
      </div>

      <form action={addRun} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <input name="title" placeholder="Race/run name (e.g. 2026 Boston Marathon)" required className={inputCls} />

        <div className="grid grid-cols-2 gap-2">
          <select name="runType" defaultValue="RACE" className={inputCls}>
            {Object.entries(RUN_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input name="startedAt" type="date" required max={new Date().toISOString().slice(0, 10)} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select name="distancePreset" defaultValue="42195" className={inputCls}>
            {DISTANCE_PRESETS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <input name="distanceKm" type="number" step="0.01" min={0} placeholder="km if custom" className={inputCls} />
        </div>

        <div>
          <span className="mb-1 block text-xs font-medium text-zinc-500">Finish Time</span>
          <div className="grid grid-cols-3 gap-2">
            <input name="hours" type="number" min={0} max={99} placeholder="hh" className={inputCls} />
            <input name="minutes" type="number" min={0} max={59} placeholder="mm" className={inputCls} />
            <input name="seconds" type="number" min={0} max={59} placeholder="ss" className={inputCls} />
          </div>
        </div>

        <div>
          <span className="mb-1 block text-xs font-medium text-zinc-500">
            Stats (optional — leave blank if you don&apos;t have them)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <input name="avgPace" placeholder="Avg pace (m:ss)" className={inputCls} />
            <input name="avgHeartRate" type="number" min={0} max={250} placeholder="Avg HR (bpm)" className={inputCls} />
            <input name="avgCadence" type="number" min={0} max={250} placeholder="Avg cadence (spm)" className={inputCls} />
          </div>
        </div>

        <input name="location" placeholder="Location (e.g. Boston, MA)" className={inputCls} />

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500">Photos (medal, bib, finish line, etc.)</span>
          <input name="photos" type="file" accept="image/*" multiple className="text-xs" />
        </label>

        <button type="submit" className="mt-1 rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white">
          Add Run
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {runs.length === 0 && <p className="text-sm text-zinc-500">No runs logged yet.</p>}
        {runs.map((run) => (
          <li key={run.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            {run.photoUrls.length > 0 && (
              <div className="mb-3 flex gap-2 overflow-x-auto">
                {run.photoUrls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt={run.title ?? "run photo"} className="h-24 w-24 shrink-0 rounded object-cover" />
                ))}
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{run.title}</div>
                <div className="text-xs text-zinc-500">
                  {run.runType ? (RUN_TYPE_LABEL[run.runType] ?? run.runType) : ""} · {run.startedAt.toISOString().slice(0, 10)}
                  {run.location ? ` · ${run.location}` : ""}
                </div>
              </div>
              <RunDeleteButton activityId={run.id} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm tabular-nums">
              <span>{formatDistance(run.distanceM)}</span>
              <span>{formatDuration(run.durationSec)}</span>
              <span className="text-zinc-500">{formatPace(run.avgPaceSecPerKm)}/km</span>
              {run.avgHeartRateBpm && <span className="text-zinc-500">{run.avgHeartRateBpm} bpm</span>}
              {run.avgCadenceSpm && <span className="text-zinc-500">{run.avgCadenceSpm} spm</span>}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

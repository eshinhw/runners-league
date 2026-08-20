import { RunDeleteButton } from "@/components/RunDeleteButton";
import { auth } from "@/lib/auth";
import { formatDistance, formatDuration, formatPace } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { addRun } from "./actions";

export const dynamic = "force-dynamic";

const RUN_TYPE_LABEL: Record<string, string> = {
  RACE: "🏅 공식 레이스",
  SPEED: "⚡ 스피드",
  TEMPO: "🔥 템포",
  LSD: "🐢 LSD (롱런)",
  EASY: "🙂 이지런",
};

const DISTANCE_PRESETS = [
  { value: "5000", label: "5K" },
  { value: "10000", label: "10K" },
  { value: "21097", label: "하프 마라톤" },
  { value: "42195", label: "풀 마라톤" },
  { value: "custom", label: "직접 입력" },
];

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export default async function MyRunsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-zinc-500">My Runs를 관리하려면 로그인이 필요합니다.</p>
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
          공식 마라톤 기록이나 기억하고 싶은 러닝을 사진과 함께 직접 남겨보세요. 이 기록은 Rankings 집계에는
          포함되지 않습니다.
        </p>
      </div>

      <form action={addRun} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <input name="title" placeholder="레이스/러닝 이름 (예: 2026 서울 마라톤)" required className={inputCls} />

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
          <input name="distanceKm" type="number" step="0.01" min={0} placeholder="직접 입력 시 km" className={inputCls} />
        </div>

        <div>
          <span className="mb-1 block text-xs font-medium text-zinc-500">완주 시간</span>
          <div className="grid grid-cols-3 gap-2">
            <input name="hours" type="number" min={0} max={99} placeholder="시" className={inputCls} />
            <input name="minutes" type="number" min={0} max={59} placeholder="분" className={inputCls} />
            <input name="seconds" type="number" min={0} max={59} placeholder="초" className={inputCls} />
          </div>
        </div>

        <input name="location" placeholder="장소 (예: Boston, MA)" className={inputCls} />

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500">사진 (완주 메달, 기록증, 결승선 등)</span>
          <input name="photos" type="file" accept="image/*" multiple className="text-xs" />
        </label>

        <button type="submit" className="mt-1 rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white">
          기록 추가
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {runs.length === 0 && <p className="text-sm text-zinc-500">아직 등록된 기록이 없습니다.</p>}
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
                  {run.runType ? RUN_TYPE_LABEL[run.runType] : ""} · {run.startedAt.toISOString().slice(0, 10)}
                  {run.location ? ` · ${run.location}` : ""}
                </div>
              </div>
              <RunDeleteButton activityId={run.id} />
            </div>
            <div className="mt-2 flex gap-5 font-mono text-sm tabular-nums">
              <span>{formatDistance(run.distanceM)}</span>
              <span>{formatDuration(run.durationSec)}</span>
              <span className="text-zinc-500">{formatPace(run.avgPaceSecPerKm)}/km</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

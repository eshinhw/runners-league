import Link from "next/link";
import type { Gender, Region, RunType } from "@/generated/prisma/client";
import { RankChange } from "@/components/RankChange";
import { formatDistance } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  AGE_BANDS,
  AGE_BAND_LABEL,
  type AgeBand,
  GENDER_LABEL,
  getChampionCounts,
  getCurrentPeriodKey,
  getHallOfFame,
  getLeaderboard,
  getPeriodLabel,
  type PeriodKind,
  type RankingFilters,
  REGION_LABEL,
  RUN_TYPE_LABEL,
  shiftPeriodKey,
} from "@/lib/rankings";

export const dynamic = "force-dynamic";

type Tab = "week" | "month" | "hof";

type SearchParams = {
  tab?: string;
  gender?: string;
  region?: string;
  runType?: string;
  ageBand?: string;
};

const TABS: { key: Tab; label: string }[] = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "hof", label: "Hall of Fame" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

function pick<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export default async function RankingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const tab: Tab = sp.tab === "month" || sp.tab === "hof" ? sp.tab : "week";

  const filters: RankingFilters = {
    gender: pick(sp.gender, ["MALE", "FEMALE", "UNSPECIFIED"] as const) as Gender | undefined,
    region: pick(sp.region, Object.keys(REGION_LABEL) as Region[]),
    runType: pick(sp.runType, Object.keys(RUN_TYPE_LABEL) as RunType[]),
    ageBand: pick(sp.ageBand, AGE_BANDS) as AgeBand | undefined,
  };

  const kind: PeriodKind = tab === "month" ? "month" : "week";
  const periodKey = getCurrentPeriodKey(kind);
  const periodLabel = getPeriodLabel(kind, periodKey);

  const leaderboard = tab !== "hof" ? await getLeaderboard(prisma, kind, periodKey, filters, 50) : null;
  const winners = tab === "hof" ? await getHallOfFame(prisma) : [];

  let previousRankByUser = new Map<string, number>();
  let championCountByUser = new Map<string, number>();
  if (leaderboard) {
    const previousPeriodKey = shiftPeriodKey(kind, periodKey, -1);
    const previousBoard = await getLeaderboard(prisma, kind, previousPeriodKey, filters, 500);
    previousRankByUser = new Map(previousBoard.rows.map((r) => [r.userId, r.rank]));
    championCountByUser = await getChampionCounts(
      prisma,
      leaderboard.rows.map((r) => r.userId),
    );
  }

  const winnersByPeriod = new Map<string, typeof winners>();
  for (const w of winners) {
    const list = winnersByPeriod.get(w.periodLabel) ?? [];
    list.push(w);
    winnersByPeriod.set(w.periodLabel, list);
  }

  const filterQS = (overrides: Partial<SearchParams>) => {
    const merged = { tab, ...sp, ...overrides };
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) q.set(k, v);
    }
    return `/rankings?${q.toString()}`;
  };

  return (
    <main className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Rankings</h1>
        <p className="text-sm text-zinc-500">
          {tab === "hof" ? "All-time winners" : `${periodLabel} · Mileage leaderboard`}
        </p>
      </div>

      <nav className="flex gap-2 border-b border-zinc-200 pb-px dark:border-zinc-800">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={filterQS({ tab: t.key })}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-b-2 border-orange-500 text-zinc-900 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab !== "hof" && (
        <form className="flex flex-wrap gap-2 text-sm" action="/rankings" method="get">
          <input type="hidden" name="tab" value={tab} />
          <select name="gender" defaultValue={sp.gender ?? ""} className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">All genders</option>
            {(["MALE", "FEMALE"] as const).map((g) => (
              <option key={g} value={g}>
                {GENDER_LABEL[g]}
              </option>
            ))}
          </select>
          <select name="ageBand" defaultValue={sp.ageBand ?? ""} className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">All ages</option>
            {AGE_BANDS.map((a) => (
              <option key={a} value={a}>
                {AGE_BAND_LABEL[a]}
              </option>
            ))}
          </select>
          <select name="region" defaultValue={sp.region ?? ""} className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">All regions</option>
            {Object.entries(REGION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select name="runType" defaultValue={sp.runType ?? ""} className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="">All run types</option>
            {Object.entries(RUN_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded bg-orange-500 px-3 py-1 font-medium text-white">
            Apply
          </button>
          {(sp.gender || sp.region || sp.runType || sp.ageBand) && (
            <Link href={filterQS({ gender: "", region: "", runType: "", ageBand: "" })} className="px-2 py-1 text-zinc-500 underline">
              Reset
            </Link>
          )}
        </form>
      )}

      {tab !== "hof" ? (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
              <th className="w-12 py-2">Rank</th>
              <th className="w-12 py-2">Change</th>
              <th className="py-2">Runner</th>
              <th className="py-2 text-right">Mileage</th>
              <th className="py-2 text-right">Runs</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard && leaderboard.rows.length > 0 ? (
              leaderboard.rows.map((row) => {
                const championCount = championCountByUser.get(row.userId) ?? 0;
                return (
                  <tr key={row.userId} className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="py-2 font-mono tabular-nums">{MEDALS[row.rank - 1] ?? row.rank}</td>
                    <td className="py-2">
                      <RankChange current={row.rank} previous={previousRankByUser.get(row.userId)} />
                    </td>
                    <td className="py-2">
                      <Link href={`/profile/${row.username}`} className="inline-flex items-center gap-1.5 font-medium hover:underline">
                        {row.displayName}
                        {championCount > 0 && (
                          <span title={`${championCount}x all-time #1`} className="text-xs font-normal text-amber-500">
                            🏆{championCount > 1 ? `×${championCount}` : ""}
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums">{formatDistance(row.totalDistanceM)}</td>
                    <td className="py-2 text-right font-mono tabular-nums text-zinc-500">{row.runCount}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-zinc-500">
                  No results for this filter yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <div className="flex flex-col gap-6">
          {winnersByPeriod.size === 0 && <p className="text-sm text-zinc-500">No periods have closed yet.</p>}
          {[...winnersByPeriod.entries()].map(([label, list]) => (
            <div key={label} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="mb-3 font-medium">{label}</h3>
              <ol className="flex flex-col gap-2">
                {list
                  .sort((a, b) => a.rank - b.rank)
                  .map((w) => (
                    <li key={w.id} className="flex items-center gap-3 text-sm">
                      <span className="w-6">{MEDALS[w.rank - 1] ?? w.rank}</span>
                      <Link href={`/profile/${w.user.username}`} className="flex-1 font-medium hover:underline">
                        {w.user.displayName}
                      </Link>
                      <span className="font-mono tabular-nums text-zinc-500">{formatDistance(w.totalDistanceM)}</span>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

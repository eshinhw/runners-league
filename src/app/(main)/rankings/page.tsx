import Link from "next/link";
import type { MarathonMajor } from "@/generated/prisma/client";
import { formatDuration, formatPace } from "@/lib/format";
import { MAJOR_INFO, MAJORS_ORDER } from "@/lib/majors";
import { prisma } from "@/lib/prisma";
import { getEditionsWithResults, getMajorEditionLeaderboard, getMajorsCompletedLeaderboard } from "@/lib/rankings";

export const dynamic = "force-dynamic";

type Tab = "completed" | "edition";

type SearchParams = {
  tab?: string;
  major?: string;
  year?: string;
};

const TABS: { key: Tab; label: string }[] = [
  { key: "completed", label: "Majors Completed" },
  { key: "edition", label: "By Race" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

function isMajor(value: string | undefined): value is MarathonMajor {
  return !!value && (MAJORS_ORDER as string[]).includes(value);
}

export default async function RankingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const tab: Tab = sp.tab === "edition" ? "edition" : "completed";

  const editions = tab === "edition" ? await getEditionsWithResults(prisma) : [];
  const selectedMajor: MarathonMajor = isMajor(sp.major) ? sp.major : (editions[0]?.major ?? "TOKYO");
  const selectedYear = Number(sp.year) || editions[0]?.year || 2026;

  const completedRows = tab === "completed" ? await getMajorsCompletedLeaderboard(prisma) : [];
  const editionRows = tab === "edition" ? await getMajorEditionLeaderboard(prisma, selectedMajor, selectedYear) : [];

  return (
    <main className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Rankings</h1>
        <p className="text-sm text-zinc-500">Built from World Marathon Majors finishes logged in My Runs.</p>
      </div>

      <nav className="flex gap-2 border-b border-zinc-200 pb-px dark:border-zinc-800">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/rankings?tab=${t.key}`}
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

      {tab === "completed" ? (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
              <th className="w-12 py-2">Rank</th>
              <th className="py-2">Runner</th>
              <th className="py-2">Majors</th>
              <th className="py-2 text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {completedRows.length > 0 ? (
              completedRows.map((row) => (
                <tr key={row.userId} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 font-mono tabular-nums">{MEDALS[row.rank - 1] ?? row.rank}</td>
                  <td className="py-2">
                    <Link href={`/profile/${row.username}`} className="font-medium hover:underline">
                      {row.displayName}
                    </Link>
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {row.majorsCompleted.map((m) => (
                        <span
                          key={m}
                          title={MAJOR_INFO[m].name}
                          className="rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                        >
                          {MAJOR_INFO[m].city}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-right font-mono tabular-nums">{row.majorsCompleted.length} / 7</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-sm text-zinc-500">
                  No majors logged yet — add one in My Runs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <>
          <form className="flex flex-wrap gap-2 text-sm" action="/rankings" method="get">
            <input type="hidden" name="tab" value="edition" />
            <select name="major" defaultValue={selectedMajor} className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900">
              {MAJORS_ORDER.map((m) => (
                <option key={m} value={m}>
                  {MAJOR_INFO[m].name}
                </option>
              ))}
            </select>
            <select name="year" defaultValue={String(selectedYear)} className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900">
              {[2027, 2026, 2025, 2024].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded bg-orange-500 px-3 py-1 font-medium text-white">
              View
            </button>
          </form>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                <th className="w-12 py-2">Rank</th>
                <th className="py-2">Runner</th>
                <th className="py-2 text-right">Finish Time</th>
                <th className="py-2 text-right">Pace</th>
              </tr>
            </thead>
            <tbody>
              {editionRows.length > 0 ? (
                editionRows.map((row) => (
                  <tr key={row.userId} className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="py-2 font-mono tabular-nums">{MEDALS[row.rank - 1] ?? row.rank}</td>
                    <td className="py-2">
                      <Link href={`/profile/${row.username}`} className="font-medium hover:underline">
                        {row.displayName}
                      </Link>
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums">{formatDuration(row.durationSec)}</td>
                    <td className="py-2 text-right font-mono tabular-nums text-zinc-500">
                      {formatPace(row.avgPaceSecPerKm)}/km
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-zinc-500">
                    No finishers logged for {MAJOR_INFO[selectedMajor].name} {selectedYear} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}

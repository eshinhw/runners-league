import Link from "next/link";
import type { MarathonMajor, RaceDistance } from "@/generated/prisma/client";
import { CompletedTable } from "@/components/rankings/CompletedTable";
import { EditionTable } from "@/components/rankings/EditionTable";
import { SignInGate } from "@/components/SignInGate";
import { auth } from "@/lib/auth";
import { MAJOR_INFO, MAJORS_ORDER, RACE_DISTANCE_LABEL } from "@/lib/majors";
import { prisma } from "@/lib/prisma";
import { getEditionsWithResults, getMajorEditionLeaderboard, getMajorsCompletedLeaderboard } from "@/lib/rankings";

export const dynamic = "force-dynamic";

type Tab = "completed" | "edition";

type SearchParams = {
  tab?: string;
  major?: string;
  year?: string;
  distance?: string;
};

const TABS: { key: Tab; label: string }[] = [
  { key: "completed", label: "Majors Completed" },
  { key: "edition", label: "By Race" },
];

// High enough that pagination (not this cap) is what limits what's visible
// as the runner base grows.
const LEADERBOARD_LIMIT = 500;

function isMajor(value: string | undefined): value is MarathonMajor {
  return !!value && (MAJORS_ORDER as string[]).includes(value);
}

// The distance a runner most likely wants to see by default — every Major
// offers a full marathon, so it's the sensible default whenever no (valid)
// distance is selected yet.
function pickDefaultDistance(available: RaceDistance[]): RaceDistance {
  return available.includes("FULL") ? "FULL" : available[0];
}

export default async function RankingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <SignInGate
        title="Rankings"
        description="Sign in to see how you stack up against other runners chasing the World Marathon Majors."
      />
    );
  }

  const sp = await searchParams;
  const tab: Tab = sp.tab === "edition" ? "edition" : "completed";

  const editions = tab === "edition" ? await getEditionsWithResults(prisma) : [];
  const availableMajors = MAJORS_ORDER.filter((m) => editions.some((e) => e.major === m));
  const availableYears = [...new Set(editions.map((e) => e.year))].sort((a, b) => b - a);
  const selectedMajor: MarathonMajor = isMajor(sp.major) ? sp.major : (editions[0]?.major ?? "TOKYO");
  const selectedYear = Number(sp.year) || editions[0]?.year || availableYears[0] || 2026;
  const availableDistances = MAJOR_INFO[selectedMajor].distances;
  const selectedDistance: RaceDistance = availableDistances.includes(sp.distance as RaceDistance)
    ? (sp.distance as RaceDistance)
    : pickDefaultDistance(availableDistances);

  const completedRows = tab === "completed" ? await getMajorsCompletedLeaderboard(prisma, LEADERBOARD_LIMIT) : [];
  const editionRows =
    tab === "edition"
      ? await getMajorEditionLeaderboard(prisma, selectedMajor, selectedYear, selectedDistance, LEADERBOARD_LIMIT)
      : [];

  return (
    <main className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Rankings</h1>
        <p className="text-sm text-zinc-500">Built from World Marathon Majors finishes logged in My Races.</p>
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
        <CompletedTable rows={completedRows} />
      ) : editions.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">No race results logged yet — add one in My Races.</p>
      ) : (
        <>
          <form className="flex flex-wrap gap-2 text-sm" action="/rankings" method="get">
            <input type="hidden" name="tab" value="edition" />
            <select name="major" defaultValue={selectedMajor} className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900">
              {availableMajors.map((m) => (
                <option key={m} value={m}>
                  {MAJOR_INFO[m].name}
                </option>
              ))}
            </select>
            <select name="year" defaultValue={String(selectedYear)} className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900">
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select name="distance" defaultValue={selectedDistance} className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900">
              {availableDistances.map((d) => (
                <option key={d} value={d}>
                  {RACE_DISTANCE_LABEL[d]}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded bg-orange-500 px-3 py-1 font-medium text-white">
              View
            </button>
          </form>

          <EditionTable
            rows={editionRows}
            emptyMessage={`No finishers logged for ${MAJOR_INFO[selectedMajor].name} ${selectedYear} (${RACE_DISTANCE_LABEL[selectedDistance]}) yet.`}
          />
        </>
      )}
    </main>
  );
}

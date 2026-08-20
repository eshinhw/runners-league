import Link from "next/link";
import { ChallengeLeaveButton } from "@/components/ChallengeLeaveButton";
import { ensureCurrentChallenges, getChallengeLeaderboard } from "@/lib/challenges";
import { formatDistance } from "@/lib/format";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPeriodKey } from "@/lib/rankings";
import { joinChallenge } from "./actions";

export const dynamic = "force-dynamic";

type Tab = "week" | "month";

const TABS: { key: Tab; label: string; periodType: "WEEKLY" | "MONTHLY" }[] = [
  { key: "week", label: "이번 주", periodType: "WEEKLY" },
  { key: "month", label: "이번 달", periodType: "MONTHLY" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function RacesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab: Tab = sp.tab === "month" ? "month" : "week";
  const activeTab = TABS.find((t) => t.key === tab)!;

  const session = await auth();

  await ensureCurrentChallenges(prisma);

  const periodKey = getCurrentPeriodKey(tab);
  const challenges = await prisma.challenge.findMany({
    where: { periodType: activeTab.periodType, periodKey },
    orderBy: { createdAt: "asc" },
  });

  const myParticipations = session?.user?.id
    ? await prisma.challengeParticipant.findMany({
        where: { userId: session.user.id, challengeId: { in: challenges.map((c) => c.id) } },
        select: { challengeId: true },
      })
    : [];
  const myChallengeIds = new Set(myParticipations.map((p) => p.challengeId));

  const boards = await Promise.all(challenges.map((c) => getChallengeLeaderboard(prisma, c, 3)));

  return (
    <main className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Races</h1>
        <p className="mt-1 text-sm text-zinc-500">
          기간마다 열리는 가상 레이스에 참가해서 동기화된 마일리지로 겨뤄보세요.
        </p>
      </div>

      <nav className="flex gap-2 border-b border-zinc-200 pb-px dark:border-zinc-800">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/races?tab=${t.key}`}
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

      <div className="flex flex-col gap-4">
        {challenges.map((challenge, i) => {
          const { rows, participantCount } = boards[i];
          const joined = myChallengeIds.has(challenge.id);

          return (
            <article key={challenge.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">{challenge.title}</h2>
                  <p className="mt-0.5 text-xs text-zinc-500">{challenge.description}</p>
                </div>
                {challenge.targetDistanceM && (
                  <span className="shrink-0 rounded-full border border-orange-300 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:border-orange-800 dark:text-orange-400">
                    🎯 {formatDistance(challenge.targetDistanceM)}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500">참가자 {participantCount}명</span>
                {session?.user?.id ? (
                  joined ? (
                    <ChallengeLeaveButton challengeId={challenge.id} />
                  ) : (
                    <form action={joinChallenge.bind(null, challenge.id)}>
                      <button
                        type="submit"
                        className="rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white"
                      >
                        참가하기
                      </button>
                    </form>
                  )
                ) : (
                  <Link href="/login" className="text-sm font-medium text-orange-500 underline">
                    로그인 후 참가
                  </Link>
                )}
              </div>

              {rows.length > 0 && (
                <ol className="mt-3 flex flex-col gap-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-900">
                  {rows.map((row) => (
                    <li key={row.userId} className="flex items-center gap-3 text-sm">
                      <span className="w-6">{MEDALS[row.rank - 1] ?? row.rank}</span>
                      <Link href={`/profile/${row.username}`} className="flex-1 font-medium hover:underline">
                        {row.displayName}
                      </Link>
                      <span className="font-mono tabular-nums text-zinc-500">{formatDistance(row.totalDistanceM)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}

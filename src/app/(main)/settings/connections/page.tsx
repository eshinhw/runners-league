import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncStravaNow } from "./actions";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-zinc-500">연동을 관리하려면 로그인이 필요합니다.</p>
      </main>
    );
  }

  const [stravaAccount, stravaActivityCount] = await Promise.all([
    prisma.externalAccount.findFirst({ where: { userId: session.user.id, provider: "STRAVA" } }),
    prisma.activity.count({ where: { userId: session.user.id, source: "STRAVA" } }),
  ]);

  return (
    <main className="flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Connections</h1>
        <p className="mt-1 text-sm text-zinc-500">
          웨어러블 기기와 연동하면 러닝 기록이 자동으로 동기화됩니다. Rankings는 이렇게 기기에서 검증된 기록만
          집계합니다 — 수동 입력 기록은 제외됩니다.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div>
          <div className="font-medium">Strava</div>
          <div className="text-xs text-zinc-500">
            {stravaAccount ? `연결됨 · 동기화된 러닝 ${stravaActivityCount}건` : "연결되지 않음"}
          </div>
        </div>
        {stravaAccount ? (
          <form action={syncStravaNow}>
            <button type="submit" className="rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white">
              지금 동기화
            </button>
          </form>
        ) : (
          <a href="/api/strava/connect" className="rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white">
            연결하기
          </a>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 opacity-50 dark:border-zinc-800">
        <div>
          <div className="font-medium">Garmin</div>
          <div className="text-xs text-zinc-500">Garmin Developer Program 승인 후 지원 예정</div>
        </div>
        <button
          type="button"
          disabled
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-400 dark:border-zinc-700"
        >
          준비 중
        </button>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 opacity-50 dark:border-zinc-800">
        <div>
          <div className="font-medium">Apple Watch (HealthKit)</div>
          <div className="text-xs text-zinc-500">iOS 컴패니언 앱 필요 — 지원 예정</div>
        </div>
        <button
          type="button"
          disabled
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-400 dark:border-zinc-700"
        >
          준비 중
        </button>
      </div>
    </main>
  );
}

import { DeviceTokenPanel } from "@/components/DeviceTokenPanel";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncStravaNow } from "./actions";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-zinc-500">Sign in to manage your connections.</p>
      </main>
    );
  }

  const [stravaAccount, stravaActivityCount, healthActivityCount, deviceTokens] = await Promise.all([
    prisma.externalAccount.findFirst({ where: { userId: session.user.id, provider: "STRAVA" } }),
    prisma.activity.count({ where: { userId: session.user.id, source: "STRAVA" } }),
    prisma.activity.count({ where: { userId: session.user.id, source: "APPLE_HEALTH" } }),
    prisma.deviceToken.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, label: true, createdAt: true, lastUsedAt: true },
    }),
  ]);

  return (
    <main className="flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Connections</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Connecting a wearable syncs your runs automatically. Rankings only counts mileage verified this
          way — manual entries are excluded.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div>
          <div className="font-medium">Strava</div>
          <div className="text-xs text-zinc-500">
            {stravaAccount ? `Connected · ${stravaActivityCount} runs synced` : "Not connected"}
          </div>
        </div>
        {stravaAccount ? (
          <form action={syncStravaNow}>
            <button type="submit" className="rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white">
              Sync Now
            </button>
          </form>
        ) : (
          <a href="/api/strava/connect" className="rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white">
            Connect
          </a>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 opacity-50 dark:border-zinc-800">
        <div>
          <div className="font-medium">Garmin</div>
          <div className="text-xs text-zinc-500">Coming soon, pending Garmin Developer Program approval</div>
        </div>
        <button
          type="button"
          disabled
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-400 dark:border-zinc-700"
        >
          Coming Soon
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div>
          <div className="font-medium">Apple Watch (HealthKit)</div>
          <div className="text-xs text-zinc-500">
            {healthActivityCount} runs synced · sign in with this token in the iOS companion app
          </div>
        </div>
        <DeviceTokenPanel
          tokens={deviceTokens.map((t) => ({
            ...t,
            createdAt: t.createdAt.toISOString(),
            lastUsedAt: t.lastUsedAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </main>
  );
}

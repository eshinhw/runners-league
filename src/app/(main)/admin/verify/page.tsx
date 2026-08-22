import { VerifiedBadge } from "@/components/VerifiedBadge";
import { auth } from "@/lib/auth";
import { formatDuration } from "@/lib/format";
import { MAJOR_INFO } from "@/lib/majors";
import { prisma } from "@/lib/prisma";
import { unverifyRace, verifyRace } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminVerifyPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return (
      <main className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-zinc-500">Admins only.</p>
      </main>
    );
  }

  const races = await prisma.activity.findMany({
    where: { major: { not: null } },
    orderBy: [{ verifiedAt: "asc" }, { startedAt: "desc" }],
    include: { user: { select: { username: true, displayId: true } } },
  });

  const pending = races.filter((r) => !r.verifiedAt);
  const verified = races.filter((r) => r.verifiedAt);

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Verify Race Records</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Confirm a runner&apos;s major finish against their evidence (photos, bib, official results) before
          marking it verified.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 && <p className="text-sm text-zinc-500">Nothing waiting on review.</p>}
        {pending.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">
                {r.user.displayId} — {r.major ? MAJOR_INFO[r.major].name : r.title} ({r.startedAt.getUTCFullYear()})
              </div>
              <div className="text-xs text-zinc-500">
                {formatDuration(r.durationSec)} · {r.photoUrls.length} photo{r.photoUrls.length !== 1 ? "s" : ""}
              </div>
            </div>
            <form action={verifyRace}>
              <input type="hidden" name="activityId" value={r.id} />
              <button
                type="submit"
                className="rounded bg-orange-500 px-3 py-1.5 text-xs font-medium text-white"
              >
                Verify
              </button>
            </form>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
          Verified ({verified.length})
        </h2>
        {verified.length === 0 && <p className="text-sm text-zinc-500">No verified records yet.</p>}
        {verified.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 opacity-70 dark:border-zinc-800"
          >
            <VerifiedBadge className="h-4 w-4" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">
                {r.user.displayId} — {r.major ? MAJOR_INFO[r.major].name : r.title} ({r.startedAt.getUTCFullYear()})
              </div>
              <div className="text-xs text-zinc-500">{formatDuration(r.durationSec)}</div>
            </div>
            <form action={unverifyRace}>
              <input type="hidden" name="activityId" value={r.id} />
              <button type="submit" className="text-xs text-zinc-500 underline">
                Unverify
              </button>
            </form>
          </div>
        ))}
      </section>
    </main>
  );
}

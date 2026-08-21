import { AddGearModal } from "@/components/gear/AddGearModal";
import { GearSlotIcon } from "@/components/GearSlotIcon";
import { auth } from "@/lib/auth";
import { formatDistance } from "@/lib/format";
import { GEAR_CATEGORY_LABEL } from "@/lib/gear";
import { prisma } from "@/lib/prisma";
import { retireGear } from "../actions";

export const dynamic = "force-dynamic";

export default async function MyGearPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-zinc-500">Sign in to manage your gear.</p>
      </main>
    );
  }

  const gears = await prisma.gear.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Gears</h1>
        <AddGearModal />
      </div>

      <div className="flex flex-col gap-2">
        {gears.length === 0 && <p className="text-sm text-zinc-500">No gear added yet.</p>}
        {gears.map((g) => (
          <div
            key={g.id}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              g.retiredAt ? "border-zinc-200 opacity-60 dark:border-zinc-800" : "border-amber-500/30 bg-amber-500/5"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900">
              {g.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <GearSlotIcon
                  category={g.category}
                  className={`h-6 w-6 ${g.retiredAt ? "text-zinc-400" : "text-amber-500"}`}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {GEAR_CATEGORY_LABEL[g.category]}
              </div>
              <div className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {g.nickname ?? `${g.brand} ${g.model}`}
              </div>
            </div>

            {!g.retiredAt ? (
              <form action={retireGear}>
                <input type="hidden" name="gearId" value={g.id} />
                <button type="submit" className="shrink-0 text-xs text-zinc-500 underline">
                  Retire
                </button>
              </form>
            ) : (
              <span className="shrink-0 text-xs text-zinc-400">Retired</span>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

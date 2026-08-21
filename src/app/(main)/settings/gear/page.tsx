import type { Gear, GearCategory, UnitSystem } from "@/generated/prisma/client";
import { AddGearModal } from "@/components/gear/AddGearModal";
import { GearDeleteButton } from "@/components/gear/GearDeleteButton";
import { GearSlotIcon } from "@/components/GearSlotIcon";
import { auth } from "@/lib/auth";
import { formatDistance, formatGearName } from "@/lib/format";
import { GEAR_CATEGORY_LABEL, GEAR_CATEGORY_ORDER } from "@/lib/gear";
import { prisma } from "@/lib/prisma";
import { retireGear, unretireGear } from "../actions";

export const dynamic = "force-dynamic";

function GearRow({ gear, unitSystem }: { gear: Gear; unitSystem: UnitSystem }) {
  const metaParts = [
    gear.purchaseDate ? `Purchased ${gear.purchaseDate.getUTCFullYear()}` : null,
    gear.totalDistanceM > 0 ? formatDistance(gear.totalDistanceM, unitSystem) : null,
  ].filter((p): p is string => Boolean(p));

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 ${
        gear.retiredAt ? "border-zinc-200 opacity-60 dark:border-zinc-800" : "border-amber-500/30 bg-amber-500/5"
      }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900">
        {gear.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gear.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <GearSlotIcon
            category={gear.category}
            className={`h-6 w-6 ${gear.retiredAt ? "text-zinc-400" : "text-amber-500"}`}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {gear.nickname ?? formatGearName(gear.brand, gear.model)}
        </div>
        {metaParts.length > 0 && <div className="text-xs text-zinc-500">{metaParts.join(" · ")}</div>}
      </div>

      {!gear.retiredAt ? (
        <form action={retireGear}>
          <input type="hidden" name="gearId" value={gear.id} />
          <button type="submit" className="shrink-0 text-xs text-zinc-500 underline">
            Retire
          </button>
        </form>
      ) : (
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-zinc-400">Retired</span>
          <form action={unretireGear}>
            <input type="hidden" name="gearId" value={gear.id} />
            <button type="submit" className="text-xs text-zinc-500 underline">
              Restore
            </button>
          </form>
          <GearDeleteButton gearId={gear.id} />
        </div>
      )}
    </div>
  );
}

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

  const gearByCategory = new Map<GearCategory, Gear[]>();
  for (const g of gears) {
    const list = gearByCategory.get(g.category) ?? [];
    list.push(g);
    gearByCategory.set(g.category, list);
  }

  const sections = GEAR_CATEGORY_ORDER.map((category) => ({
    category,
    items: gearByCategory.get(category) ?? [],
  })).filter((s) => s.items.length > 0);

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Gears</h1>
        <AddGearModal />
      </div>

      {sections.length === 0 && <p className="text-sm text-zinc-500">No gear added yet.</p>}

      {sections.map(({ category, items }) => (
        <section key={category} className="flex flex-col gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
            {GEAR_CATEGORY_LABEL[category]}
          </h2>
          <div className="flex flex-col gap-2">
            {items.map((g) => (
              <GearRow key={g.id} gear={g} unitSystem={session.user.unitSystem} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

import type { Gear, GearCategory } from "@/generated/prisma/client";
import { AddGearModal } from "@/components/gear/AddGearModal";
import { EditGearModal } from "@/components/gear/EditGearModal";
import { ArchiveIcon, FavoriteIcon, RestoreIcon } from "@/components/gear/GearActionIcons";
import { GearDeleteButton } from "@/components/gear/GearDeleteButton";
import { GearSlotIcon } from "@/components/GearSlotIcon";
import { auth } from "@/lib/auth";
import { formatGearName } from "@/lib/format";
import { GEAR_CATEGORY_LABEL, GEAR_CATEGORY_ORDER } from "@/lib/gear";
import { prisma } from "@/lib/prisma";
import { retireGear, toggleFavoriteGear, unretireGear } from "../actions";

export const dynamic = "force-dynamic";

function FavoriteButton({ gearId, isFavorite }: { gearId: string; isFavorite: boolean }) {
  return (
    <form action={toggleFavoriteGear} className="flex items-center">
      <input type="hidden" name="gearId" value={gearId} />
      <button
        type="submit"
        aria-label={isFavorite ? "Unfavorite" : "Mark as favorite"}
        title={isFavorite ? "Unfavorite" : "Mark as favorite"}
        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center ${isFavorite ? "text-amber-400" : "text-zinc-400 hover:text-amber-400"}`}
      >
        <FavoriteIcon filled={isFavorite} className="h-4 w-4" />
      </button>
    </form>
  );
}

function GearRow({ gear }: { gear: Gear }) {
  const purchaseLabel = gear.purchaseDate ? `Purchased ${gear.purchaseDate.getUTCFullYear()}` : null;

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
        {purchaseLabel && <div className="text-xs text-zinc-500">{purchaseLabel}</div>}
      </div>

      {!gear.retiredAt ? (
        <div className="flex shrink-0 items-center gap-3">
          <FavoriteButton gearId={gear.id} isFavorite={gear.isFavorite} />
          <EditGearModal gear={gear} />
          <form action={retireGear} className="flex items-center">
            <input type="hidden" name="gearId" value={gear.id} />
            <button
              type="submit"
              aria-label="Archive"
              title="Archive"
              className="inline-flex h-4 w-4 items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <ArchiveIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs text-zinc-400">Archived</span>
          <form action={unretireGear} className="flex items-center">
            <input type="hidden" name="gearId" value={gear.id} />
            <button
              type="submit"
              aria-label="Restore"
              title="Restore"
              className="inline-flex h-4 w-4 items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <RestoreIcon className="h-4 w-4" />
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
        <div>
          <h1 className="text-xl font-semibold">My Gears</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Star one item per category — it shows as your Favorite Gear on your public profile, visible to other
            runners.
          </p>
        </div>
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
              <GearRow key={g.id} gear={g} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

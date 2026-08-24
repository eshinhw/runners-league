import type { GearCategory } from "@/generated/prisma/client";
import { ExternalLinkIcon } from "@/components/ActionIcons";
import { SignInGate } from "@/components/SignInGate";
import { auth } from "@/lib/auth";
import { formatGearName, shopSearchUrl } from "@/lib/format";
import { GEAR_CATEGORY_LABEL, GEAR_CATEGORY_ORDER } from "@/lib/gear";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Agg = { category: GearCategory; brand: string; model: string | null; count: number; totalDistanceM: number };

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function GearPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <SignInGate title="Top Gears" description="Sign in to see the most-used gear across Runners League." />;
  }

  // Every non-retired item in every runner's gear locker counts, favorited
  // or not — favorite is just what a runner chooses to show on their public
  // profile, not a gate on the community stats here.
  const allGear = await prisma.gear.findMany({
    where: { retiredAt: null },
    select: { ownerId: true, category: true, brand: true, model: true, totalDistanceM: true },
  });

  // Collapse to one row per owner+item first, so a runner who logged the
  // same brand/model more than once (e.g. replaced a worn-out pair with an
  // identical one) still counts once on the "Runners" leaderboard, with
  // both entries' mileage combined.
  const perOwnerItem = new Map<string, { category: GearCategory; brand: string; model: string | null; totalDistanceM: number }>();
  for (const g of allGear) {
    const key = `${g.ownerId}:${g.category}:${g.brand}:${g.model ?? ""}`;
    const existing = perOwnerItem.get(key);
    if (existing) {
      existing.totalDistanceM += g.totalDistanceM;
    } else {
      perOwnerItem.set(key, { category: g.category, brand: g.brand, model: g.model, totalDistanceM: g.totalDistanceM });
    }
  }

  const aggMap = new Map<string, Agg>();
  for (const g of perOwnerItem.values()) {
    const key = `${g.category}:${g.brand}:${g.model ?? ""}`;
    const existing = aggMap.get(key);
    if (existing) {
      existing.count += 1;
      existing.totalDistanceM += g.totalDistanceM;
    } else {
      aggMap.set(key, {
        category: g.category,
        brand: g.brand,
        model: g.model,
        count: 1,
        totalDistanceM: g.totalDistanceM,
      });
    }
  }

  const grouped = [...aggMap.values()];
  const byCategory = new Map<GearCategory, Agg[]>();
  for (const g of grouped) {
    const list = byCategory.get(g.category) ?? [];
    list.push(g);
    byCategory.set(g.category, list);
  }

  const sections = GEAR_CATEGORY_ORDER.map((category) => ({
    category,
    items: (byCategory.get(category) ?? []).sort((a, b) => b.count - a.count || b.totalDistanceM - a.totalDistanceM),
  })).filter((s) => s.items.length > 0);

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Top Gears</h1>
        <p className="mt-1 text-sm text-zinc-500">
          The most-used gear across Runners League, by category — counted from every runner&apos;s gear locker.
        </p>
      </div>

      {sections.length === 0 && <p className="text-sm text-zinc-500">No gear logged yet.</p>}

      {sections.map(({ category, items }) => (
        <section key={category} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{GEAR_CATEGORY_LABEL[category]}</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                <th className="w-10 py-2">Rank</th>
                <th className="py-2 pl-4">Item</th>
                <th className="py-2 text-right">Runners</th>
                <th className="w-20 py-2 text-right">Shop</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={`${item.brand}-${item.model}`} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 font-mono tabular-nums text-zinc-400">{MEDALS[i] ?? i + 1}</td>
                  <td className="py-2 pl-4 font-medium">{formatGearName(item.brand, item.model)}</td>
                  <td className="py-2 text-right font-mono tabular-nums text-zinc-500">{item.count}</td>
                  <td className="py-2 text-right">
                    <a
                      href={shopSearchUrl(item.brand, item.model)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-orange-500 hover:underline"
                    >
                      Shop
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </main>
  );
}

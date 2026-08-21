import type { GearCategory } from "@/generated/prisma/client";
import { SignInGate } from "@/components/SignInGate";
import { auth } from "@/lib/auth";
import { formatDistance } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<GearCategory, string> = {
  SHOE: "Shoes",
  WATCH: "Watches",
  APPAREL: "Apparel",
  ACCESSORY: "Accessories",
  NUTRITION: "Nutrition",
};

const CATEGORY_ORDER: GearCategory[] = ["SHOE", "WATCH", "APPAREL", "ACCESSORY", "NUTRITION"];

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function GearPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <SignInGate
        title="Top Gears"
        description="Sign in to see the most-used gear across Runners League."
      />
    );
  }

  const grouped = await prisma.gear.groupBy({
    by: ["category", "brand", "model"],
    _count: { _all: true },
    _sum: { totalDistanceM: true },
  });

  const byCategory = new Map<GearCategory, typeof grouped>();
  for (const g of grouped) {
    const list = byCategory.get(g.category) ?? [];
    list.push(g);
    byCategory.set(g.category, list);
  }

  const sections = CATEGORY_ORDER.map((category) => ({
    category,
    items: (byCategory.get(category) ?? [])
      .sort(
        (a, b) =>
          b._count._all - a._count._all || (b._sum.totalDistanceM ?? 0) - (a._sum.totalDistanceM ?? 0),
      )
      .slice(0, 3),
  })).filter((s) => s.items.length > 0);

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Top Gears</h1>
        <p className="mt-1 text-sm text-zinc-500">
          The most-used gear across Runners League, by category.
        </p>
      </div>

      {sections.length === 0 && <p className="text-sm text-zinc-500">No gear logged yet.</p>}

      {sections.map(({ category, items }) => (
        <section key={category} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{CATEGORY_LABEL[category]}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={`${item.brand}-${item.model}`}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="text-lg">{MEDALS[i]}</div>
                <div className="mt-1 font-medium">
                  {item.brand} {item.model}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {item._count._all} runner{item._count._all !== 1 ? "s" : ""} ·{" "}
                  {formatDistance(item._sum.totalDistanceM ?? 0)} total
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

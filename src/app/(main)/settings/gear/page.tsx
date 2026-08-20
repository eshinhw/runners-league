import { auth } from "@/lib/auth";
import { formatDistance } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { addGear, retireGear } from "../actions";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  SHOE: "Shoes",
  WATCH: "Watch",
  APPAREL: "Apparel",
  ACCESSORY: "Accessory (earbuds, etc.)",
  NUTRITION: "Nutrition",
};

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

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
    <main className="flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">My Gears</h1>

      <form action={addGear} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="grid grid-cols-2 gap-2">
          <select name="category" required defaultValue="SHOE" className={inputCls}>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input name="brand" placeholder="Brand" required className={inputCls} />
        </div>
        <input name="model" placeholder="Model" required className={inputCls} />
        <input name="nickname" placeholder="Nickname (optional)" className={inputCls} />
        <button type="submit" className="rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white">
          Add
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {gears.length === 0 && <p className="text-sm text-zinc-500">No gear added yet.</p>}
        {gears.map((g) => (
          <li
            key={g.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            <div>
              <div className="font-medium">{g.nickname ?? `${g.brand} ${g.model}`}</div>
              <div className="text-xs text-zinc-500">
                {CATEGORY_LABEL[g.category]} · {g.brand} {g.model} · {formatDistance(g.totalDistanceM)}
              </div>
            </div>
            {!g.retiredAt ? (
              <form action={retireGear}>
                <input type="hidden" name="gearId" value={g.id} />
                <button type="submit" className="text-xs text-zinc-500 underline">
                  Retire
                </button>
              </form>
            ) : (
              <span className="text-xs text-zinc-400">Retired</span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

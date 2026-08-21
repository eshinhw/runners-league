import { notFound } from "next/navigation";
import type { GearCategory } from "@/generated/prisma/client";
import { GearSlotIcon } from "@/components/GearSlotIcon";
import { TierBadge } from "@/components/TierBadge";
import { calculateAge, formatDuration, formatPace, initials } from "@/lib/format";
import { GEAR_CATEGORY_LABEL, GEAR_CATEGORY_ORDER } from "@/lib/gear";
import { MAJOR_INFO, MAJORS_ORDER } from "@/lib/majors";
import { prisma } from "@/lib/prisma";
import { getTierForCount } from "@/lib/tiers";

export const dynamic = "force-dynamic";

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M12 21s-7-7.2-7-12a7 7 0 0 1 14 0c0 4.8-7 12-7 12Z" />
      <circle cx={12} cy={9} r={2.5} />
    </svg>
  );
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      gears: { where: { retiredAt: null }, orderBy: { createdAt: "desc" } },
      activities: {
        where: { major: { not: null } },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  const age = calculateAge(user.birthDate);
  const location = [user.city, user.country].filter(Boolean).join(", ");
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const majorsCompleted = new Set(user.activities.map((a) => a.major)).size;
  const tier = getTierForCount(majorsCompleted, MAJORS_ORDER.length);
  const avatarSrc = user.avatarUrl ?? user.image;

  const gearByCategory = new Map<GearCategory, typeof user.gears>();
  for (const g of user.gears) {
    const list = gearByCategory.get(g.category) ?? [];
    list.push(g);
    gearByCategory.set(g.category, list);
  }

  const gearRows: { category: GearCategory; item: (typeof user.gears)[number] | null }[] = [];
  for (const category of GEAR_CATEGORY_ORDER) {
    const items = gearByCategory.get(category) ?? [];
    if (items.length === 0) {
      gearRows.push({ category, item: null });
    } else {
      for (const item of items) gearRows.push({ category, item });
    }
  }

  return (
    <main className="flex max-w-3xl flex-col gap-8">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xl font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt={user.displayId} className="h-full w-full object-cover" />
          ) : (
            initials(fullName || user.displayId)
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{user.displayId}</h1>
            <TierBadge tier={tier} size={30} />
          </div>
          {fullName && <p className="text-sm text-zinc-500">{fullName}</p>}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
            {age !== null && <span>{age} yo</span>}
            {location && (
              <span className="inline-flex items-center gap-1">
                <PinIcon className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
          </div>

          {user.bio && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{user.bio}</p>}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Race Records</h2>
        {user.activities.length === 0 ? (
          <p className="text-sm text-zinc-500">No majors logged yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                <th className="py-2">Race</th>
                <th className="py-2">Date</th>
                <th className="py-2 text-right">Finish Time</th>
                <th className="py-2 text-right">Pace</th>
              </tr>
            </thead>
            <tbody>
              {user.activities.map((a) => (
                <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 font-medium">
                    {a.major
                      ? `${a.startedAt.getUTCFullYear()} ${MAJOR_INFO[a.major].name}`
                      : a.title}
                  </td>
                  <td className="py-2 text-zinc-500">{a.startedAt.toISOString().slice(0, 10)}</td>
                  <td className="py-2 text-right font-mono tabular-nums">{formatDuration(a.durationSec)}</td>
                  <td className="py-2 text-right font-mono tabular-nums text-zinc-500">
                    {formatPace(a.avgPaceSecPerKm)}/km
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Gear</h2>
        <div className="flex flex-col gap-2">
          {gearRows.map(({ category, item }, i) => {
            const filled = item !== null;
            return (
              <div
                key={item?.id ?? `${category}-empty-${i}`}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  filled
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-dashed border-zinc-300 dark:border-zinc-700"
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900">
                  {item?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <GearSlotIcon
                      category={category}
                      className={`h-6 w-6 ${filled ? "text-amber-500" : "text-zinc-400"}`}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    {GEAR_CATEGORY_LABEL[category]}
                  </div>
                  {item ? (
                    <div className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
                      {item.nickname ?? `${item.brand} ${item.model}`}
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-400">Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

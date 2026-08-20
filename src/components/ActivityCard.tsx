import Link from "next/link";
import type { Gear, User } from "@/generated/prisma/client";
import { formatDistance, formatDuration, formatPace, formatRelativeTime, initials } from "@/lib/format";

type ActivityCardData = {
  id: string;
  title: string | null;
  distanceM: number;
  durationSec: number;
  avgPaceSecPerKm: number | null;
  startedAt: Date;
  user: User;
  gearLinks: { gear: Gear }[];
  _count: { comments: number; likes: number };
};

export function ActivityCard({ activity }: { activity: ActivityCardData }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {initials(activity.user.displayName)}
        </div>
        <div className="flex flex-col leading-tight">
          <Link href={`/profile/${activity.user.username}`} className="font-medium hover:underline">
            {activity.user.displayName}
          </Link>
          <span className="text-xs text-zinc-500">{formatRelativeTime(activity.startedAt)}</span>
        </div>
      </div>

      {activity.title && <h3 className="mt-3 font-medium">{activity.title}</h3>}

      <div className="mt-3 flex gap-6 font-mono text-sm tabular-nums">
        <Stat label="distance" value={formatDistance(activity.distanceM)} />
        <Stat label="pace /km" value={formatPace(activity.avgPaceSecPerKm)} />
        <Stat label="time" value={formatDuration(activity.durationSec)} />
      </div>

      {activity.gearLinks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activity.gearLinks.map(({ gear }) => (
            <span
              key={gear.id}
              className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
            >
              {gear.nickname ?? `${gear.brand} ${gear.model}`}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-4 text-sm text-zinc-500">
        <span>♡ {activity._count.likes}</span>
        <span>💬 {activity._count.comments}</span>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-semibold">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</span>
    </div>
  );
}

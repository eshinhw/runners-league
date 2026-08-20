import { ActivityCard } from "@/components/ActivityCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const activities = await prisma.activity.findMany({
    orderBy: { startedAt: "desc" },
    take: 20,
    include: {
      user: true,
      gearLinks: { include: { gear: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Feed</h1>
      {activities.length === 0 ? (
        <p className="text-sm text-zinc-500">아직 활동이 없습니다.</p>
      ) : (
        activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)
      )}
    </main>
  );
}

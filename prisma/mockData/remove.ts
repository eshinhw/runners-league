// Removes every row created by seed.ts (and any other mock content
// attached to those accounts since) in one pass — safe to run once real
// signups make the bootstrap data unnecessary. Only ever touches rows
// belonging to `isMockData: true` users; never touches real accounts.
//
// Run with:  npx tsx --env-file=.env prisma/mockData/remove.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const mockUsers = await prisma.user.findMany({ where: { isMockData: true }, select: { id: true } });
  const userIds = mockUsers.map((u) => u.id);

  if (userIds.length === 0) {
    console.log("No mock users found — nothing to remove.");
    return;
  }

  const [gearIds, activityIds, postIds, trackIds] = await Promise.all([
    prisma.gear.findMany({ where: { ownerId: { in: userIds } }, select: { id: true } }).then((r) => r.map((g) => g.id)),
    prisma.activity.findMany({ where: { userId: { in: userIds } }, select: { id: true } }).then((r) => r.map((a) => a.id)),
    prisma.post.findMany({ where: { authorId: { in: userIds } }, select: { id: true } }).then((r) => r.map((p) => p.id)),
    prisma.track.findMany({ where: { submittedById: { in: userIds } }, select: { id: true } }).then((r) => r.map((t) => t.id)),
  ]);

  await prisma.like.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { activityId: { in: activityIds } },
        { postId: { in: postIds } },
        { trackId: { in: trackIds } },
      ],
    },
  });
  await prisma.comment.deleteMany({
    where: { OR: [{ authorId: { in: userIds } }, { activityId: { in: activityIds } }, { postId: { in: postIds } }] },
  });
  await prisma.activityGear.deleteMany({
    where: { OR: [{ activityId: { in: activityIds } }, { gearId: { in: gearIds } }] },
  });
  await prisma.gearReview.deleteMany({ where: { OR: [{ authorId: { in: userIds } }, { gearId: { in: gearIds } }] } });
  await prisma.raceEntry.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.follow.deleteMany({ where: { OR: [{ followerId: { in: userIds } }, { followeeId: { in: userIds } }] } });
  await prisma.account.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });

  await prisma.activity.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.gear.deleteMany({ where: { ownerId: { in: userIds } } });
  await prisma.post.deleteMany({ where: { authorId: { in: userIds } } });
  await prisma.track.deleteMany({ where: { submittedById: { in: userIds } } });

  const { count } = await prisma.user.deleteMany({ where: { isMockData: true } });
  console.log(`Removed ${count} mock users and all of their associated data.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

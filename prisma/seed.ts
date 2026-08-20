import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.activityGear.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.gearReview.deleteMany();
  await prisma.gear.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.raceEntry.deleteMany();
  await prisma.race.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const [eddie, jenny, mark, sora] = await Promise.all([
    prisma.user.create({
      data: {
        email: "eddie@runnersleague.dev",
        username: "eddie",
        displayName: "Eddie Shin",
        bio: "Marathon PB 3:12. Training for Boston.",
        location: "Seoul, KR",
      },
    }),
    prisma.user.create({
      data: {
        email: "jenny@runnersleague.dev",
        username: "jenny.runs",
        displayName: "Jenny Park",
        bio: "Trail running & coffee.",
        location: "Seoul, KR",
      },
    }),
    prisma.user.create({
      data: {
        email: "mark@runnersleague.dev",
        username: "markk",
        displayName: "Mark Kim",
        bio: "Sub-40 10K chaser.",
        location: "Busan, KR",
      },
    }),
    prisma.user.create({
      data: {
        email: "sora@runnersleague.dev",
        username: "sora.k",
        displayName: "Sora Kang",
        bio: "First marathon this fall 🏃‍♀️",
        location: "Incheon, KR",
      },
    }),
  ]);

  await prisma.follow.createMany({
    data: [
      { followerId: eddie.id, followeeId: jenny.id },
      { followerId: eddie.id, followeeId: mark.id },
      { followerId: eddie.id, followeeId: sora.id },
      { followerId: jenny.id, followeeId: eddie.id },
      { followerId: mark.id, followeeId: eddie.id },
    ],
  });

  const [eddieShoe, eddieWatch, jennyShoe, markShoe] = await Promise.all([
    prisma.gear.create({
      data: {
        ownerId: eddie.id,
        category: "SHOE",
        brand: "Nike",
        model: "Vaporfly 3",
        nickname: "Race Day",
        purchaseDate: new Date("2026-03-01"),
        totalDistanceM: 312_000,
      },
    }),
    prisma.gear.create({
      data: {
        ownerId: eddie.id,
        category: "WATCH",
        brand: "Garmin",
        model: "Forerunner 965",
        purchaseDate: new Date("2025-11-15"),
        totalDistanceM: 1_204_000,
      },
    }),
    prisma.gear.create({
      data: {
        ownerId: jenny.id,
        category: "SHOE",
        brand: "Hoka",
        model: "Speedgoat 5",
        nickname: "Trail beast",
        purchaseDate: new Date("2026-01-10"),
        totalDistanceM: 452_000,
      },
    }),
    prisma.gear.create({
      data: {
        ownerId: mark.id,
        category: "SHOE",
        brand: "Asics",
        model: "Magic Speed 4",
        purchaseDate: new Date("2026-05-20"),
        totalDistanceM: 91_000,
      },
    }),
  ]);

  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

  const activitiesData = [
    {
      user: eddie,
      gear: [eddieShoe, eddieWatch],
      title: "Tempo run along the river",
      distanceM: 8200,
      durationSec: 37 * 60 + 41,
      startedAt: hoursAgo(2),
    },
    {
      user: jenny,
      gear: [jennyShoe],
      title: "Sunrise trail loop",
      distanceM: 15000,
      durationSec: 77 * 60 + 30,
      startedAt: hoursAgo(6),
    },
    {
      user: mark,
      gear: [markShoe],
      title: "Interval session — 8x400m",
      distanceM: 6400,
      durationSec: 27 * 60 + 12,
      startedAt: hoursAgo(20),
    },
    {
      user: sora,
      gear: [],
      title: "First 10K, done!",
      distanceM: 10000,
      durationSec: 62 * 60 + 5,
      startedAt: hoursAgo(30),
    },
    {
      user: eddie,
      gear: [eddieShoe],
      title: "Easy recovery jog",
      distanceM: 5000,
      durationSec: 28 * 60,
      startedAt: hoursAgo(48),
    },
  ];

  const activities = [];
  for (const a of activitiesData) {
    const activity = await prisma.activity.create({
      data: {
        userId: a.user.id,
        source: "MANUAL",
        title: a.title,
        distanceM: a.distanceM,
        durationSec: a.durationSec,
        avgPaceSecPerKm: Math.round(a.durationSec / (a.distanceM / 1000)),
        startedAt: a.startedAt,
        gearLinks: {
          create: a.gear.map((g) => ({ gearId: g.id })),
        },
      },
    });
    activities.push(activity);
  }

  await prisma.like.createMany({
    data: [
      { userId: jenny.id, activityId: activities[0].id },
      { userId: mark.id, activityId: activities[0].id },
      { userId: eddie.id, activityId: activities[1].id },
      { userId: sora.id, activityId: activities[0].id },
    ],
  });

  await prisma.comment.createMany({
    data: [
      { authorId: jenny.id, activityId: activities[0].id, body: "빠르다 🔥" },
      { authorId: eddie.id, activityId: activities[1].id, body: "코스 이쁘네요, 어디에요?" },
      { authorId: mark.id, activityId: activities[3].id, body: "첫 10K 축하해요!" },
    ],
  });

  console.log(`Seeded ${activities.length} activities across 4 users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

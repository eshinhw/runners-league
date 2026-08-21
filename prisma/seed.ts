import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type MarathonMajor } from "../src/generated/prisma/client";
import { MAJOR_INFO } from "../src/lib/majors";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

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

  const userSeeds = [
    { key: "eddie", email: "eddie@runnersleague.dev", username: "eddie", displayId: "eddie", firstName: "Eddie", lastName: "Shin", bio: "Marathon PB 3:12. Training for Boston.", city: "Toronto", country: "Canada", gender: "MALE" as const, birthDate: new Date("1992-04-12"), region: "ONTARIO" as const },
    { key: "jenny", email: "jenny@runnersleague.dev", username: "jenny.runs", displayId: "jenny.runs", firstName: "Jenny", lastName: "Park", bio: "Trail running & coffee.", city: "Toronto", country: "Canada", gender: "FEMALE" as const, birthDate: new Date("1996-09-03"), region: "ONTARIO" as const },
    { key: "mark", email: "mark@runnersleague.dev", username: "markk", displayId: "markk", firstName: "Mark", lastName: "Kim", bio: "Sub-40 10K chaser.", city: "Vancouver", country: "Canada", gender: "MALE" as const, birthDate: new Date("1988-01-20"), region: "BRITISH_COLUMBIA" as const },
    { key: "sora", email: "sora@runnersleague.dev", username: "sora.k", displayId: "sora.k", firstName: "Sora", lastName: "Kang", bio: "First marathon this fall 🏃‍♀️", city: "Montreal", country: "Canada", gender: "FEMALE" as const, birthDate: new Date("2001-06-30"), region: "QUEBEC" as const },
    { key: "jiho", email: "jiho@runnersleague.dev", username: "jiho.run", displayId: "jiho.run", firstName: "Jiho", lastName: "Lee", bio: "Ultra curious. 50K next spring.", city: "Calgary", country: "Canada", gender: "MALE" as const, birthDate: new Date("1984-11-08"), region: "ALBERTA" as const },
    { key: "yuna", email: "yuna@runnersleague.dev", username: "yuna.c", displayId: "yuna.c", firstName: "Yuna", lastName: "Choi", bio: "Weekend LSD, weekday commute runs.", city: "Ottawa", country: "Canada", gender: "FEMALE" as const, birthDate: new Date("1990-03-15"), region: "ONTARIO" as const },
  ];

  const users = Object.fromEntries(
    await Promise.all(
      userSeeds.map(async ({ key, ...data }) => [key, await prisma.user.create({ data })] as const),
    ),
  );
  const { eddie, jenny, mark, sora, jiho, yuna } = users;

  await prisma.follow.createMany({
    data: [
      { followerId: eddie.id, followeeId: jenny.id },
      { followerId: eddie.id, followeeId: mark.id },
      { followerId: eddie.id, followeeId: sora.id },
      { followerId: jenny.id, followeeId: eddie.id },
      { followerId: mark.id, followeeId: eddie.id },
      { followerId: jiho.id, followeeId: eddie.id },
      { followerId: yuna.id, followeeId: jenny.id },
    ],
  });

  const [eddieShoe, eddieWatch, jennyShoe, markShoe] = await Promise.all([
    prisma.gear.create({ data: { ownerId: eddie.id, category: "SHOE", brand: "Nike", model: "Vaporfly 3", nickname: "Race Day", purchaseDate: new Date("2026-03-01"), totalDistanceM: 312_000 } }),
    prisma.gear.create({ data: { ownerId: eddie.id, category: "WATCH", brand: "Garmin", model: "Forerunner 965", purchaseDate: new Date("2025-11-15"), totalDistanceM: 1_204_000 } }),
    prisma.gear.create({ data: { ownerId: jenny.id, category: "SHOE", brand: "Hoka", model: "Speedgoat 5", nickname: "Trail beast", purchaseDate: new Date("2026-01-10"), totalDistanceM: 452_000 } }),
    prisma.gear.create({ data: { ownerId: mark.id, category: "SHOE", brand: "Asics", model: "Magic Speed 4", purchaseDate: new Date("2026-05-20"), totalDistanceM: 91_000 } }),
  ]);

  // ---- World Marathon Majors results, powering Rankings ----
  const MAJOR_DATE: Record<MarathonMajor, Record<number, string>> = {
    TOKYO: { 2024: "2024-03-03", 2025: "2025-03-02", 2026: "2026-03-01" },
    BOSTON: { 2025: "2025-04-21", 2026: "2026-04-20" },
    LONDON: { 2026: "2026-04-26" },
    BERLIN: { 2025: "2025-09-28", 2026: "2026-09-27" },
    CHICAGO: { 2025: "2025-10-12", 2026: "2026-10-11" },
    NEW_YORK: { 2024: "2024-11-03", 2025: "2025-11-02", 2026: "2026-11-01" },
    SYDNEY: {},
  };

  const majorResults: { user: typeof eddie; major: MarathonMajor; year: number; durationSec: number }[] = [
    { user: eddie, major: "BOSTON", year: 2026, durationSec: 3 * 3600 + 12 * 60 + 40 },
    { user: eddie, major: "CHICAGO", year: 2025, durationSec: 3 * 3600 + 18 * 60 + 5 },
    { user: eddie, major: "TOKYO", year: 2026, durationSec: 3 * 3600 + 15 * 60 + 22 },
    { user: eddie, major: "NEW_YORK", year: 2024, durationSec: 3 * 3600 + 22 * 60 + 51 },

    { user: jiho, major: "TOKYO", year: 2026, durationSec: 3 * 3600 + 5 * 60 + 12 },
    { user: jiho, major: "BERLIN", year: 2025, durationSec: 2 * 3600 + 58 * 60 + 40 },
    { user: jiho, major: "CHICAGO", year: 2026, durationSec: 3 * 3600 + 1 * 60 + 33 },

    { user: jenny, major: "LONDON", year: 2026, durationSec: 3 * 3600 + 45 * 60 + 10 },
    { user: jenny, major: "NEW_YORK", year: 2025, durationSec: 3 * 3600 + 40 * 60 + 22 },

    { user: mark, major: "CHICAGO", year: 2026, durationSec: 3 * 3600 + 30 * 60 + 8 },

    { user: sora, major: "NEW_YORK", year: 2026, durationSec: 4 * 3600 + 12 * 60 + 51 },

    { user: yuna, major: "BERLIN", year: 2026, durationSec: 3 * 3600 + 55 * 60 + 2 },
    { user: yuna, major: "BOSTON", year: 2025, durationSec: 4 * 3600 + 2 * 60 + 15 },
  ];

  let majorsCount = 0;
  for (const r of majorResults) {
    const dateStr = MAJOR_DATE[r.major][r.year];
    if (!dateStr) continue;
    const info = MAJOR_INFO[r.major];
    await prisma.activity.create({
      data: {
        userId: r.user.id,
        source: "MANUAL",
        title: `${r.year} ${info.name}`,
        runType: "RACE",
        major: r.major,
        distanceM: 42195,
        durationSec: r.durationSec,
        avgPaceSecPerKm: Math.round(r.durationSec / 42.195),
        startedAt: new Date(`${dateStr}T09:00:00Z`),
        location: `${info.city}, ${info.country}`,
      },
    });
    majorsCount++;
  }

  // ---- Recent activities for the Feed ----
  const activitiesData = [
    { user: eddie, gear: [eddieShoe, eddieWatch], title: "Tempo run along the river", distanceM: 8200, durationSec: 37 * 60 + 41, runType: "TEMPO" as const, startedAt: hoursAgo(2) },
    { user: jenny, gear: [jennyShoe], title: "Sunrise trail loop", distanceM: 15000, durationSec: 77 * 60 + 30, runType: "LSD" as const, startedAt: hoursAgo(6) },
    { user: mark, gear: [markShoe], title: "Interval session — 8x400m", distanceM: 6400, durationSec: 27 * 60 + 12, runType: "SPEED" as const, startedAt: hoursAgo(20) },
    { user: sora, gear: [], title: "First 10K, done!", distanceM: 10000, durationSec: 62 * 60 + 5, runType: "EASY" as const, startedAt: hoursAgo(30) },
    { user: eddie, gear: [eddieShoe], title: "Easy recovery jog", distanceM: 5000, durationSec: 28 * 60, runType: "EASY" as const, startedAt: hoursAgo(48) },
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
        runType: a.runType,
        startedAt: a.startedAt,
        gearLinks: { create: a.gear.map((g) => ({ gearId: g.id })) },
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
      { authorId: jenny.id, activityId: activities[0].id, body: "That's fast 🔥" },
      { authorId: eddie.id, activityId: activities[1].id, body: "Beautiful route, where is this?" },
      { authorId: mark.id, activityId: activities[3].id, body: "Congrats on your first 10K!" },
    ],
  });

  console.log(
    `Seeded ${userSeeds.length} users, ${majorsCount} World Marathon Majors results, and ${activities.length} recent feed activities.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

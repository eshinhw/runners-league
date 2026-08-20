import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type RunType } from "../src/generated/prisma/client";
import { getCurrentPeriodKey, snapshotPeriodWinners } from "../src/lib/rankings";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const RUN_TYPES: RunType[] = ["EASY", "TEMPO", "SPEED", "LSD", "RACE"];

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

function dateInMonth(year: number, month: number, day: number, hour: number): Date {
  return new Date(Date.UTC(year, month - 1, day, hour));
}

async function main() {
  await prisma.leaderboardWinner.deleteMany();
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
    { key: "eddie", email: "eddie@runnersleague.dev", username: "eddie", displayName: "Eddie Shin", bio: "Marathon PB 3:12. Training for Boston.", city: "Toronto", country: "Canada", gender: "MALE" as const, birthDate: new Date("1992-04-12"), region: "ONTARIO" as const },
    { key: "jenny", email: "jenny@runnersleague.dev", username: "jenny.runs", displayName: "Jenny Park", bio: "Trail running & coffee.", city: "Toronto", country: "Canada", gender: "FEMALE" as const, birthDate: new Date("1996-09-03"), region: "ONTARIO" as const },
    { key: "mark", email: "mark@runnersleague.dev", username: "markk", displayName: "Mark Kim", bio: "Sub-40 10K chaser.", city: "Vancouver", country: "Canada", gender: "MALE" as const, birthDate: new Date("1988-01-20"), region: "BRITISH_COLUMBIA" as const },
    { key: "sora", email: "sora@runnersleague.dev", username: "sora.k", displayName: "Sora Kang", bio: "First marathon this fall 🏃‍♀️", city: "Montreal", country: "Canada", gender: "FEMALE" as const, birthDate: new Date("2001-06-30"), region: "QUEBEC" as const },
    { key: "jiho", email: "jiho@runnersleague.dev", username: "jiho.run", displayName: "Jiho Lee", bio: "Ultra curious. 50K next spring.", city: "Calgary", country: "Canada", gender: "MALE" as const, birthDate: new Date("1984-11-08"), region: "ALBERTA" as const },
    { key: "yuna", email: "yuna@runnersleague.dev", username: "yuna.c", displayName: "Yuna Choi", bio: "Weekend LSD, weekday commute runs.", city: "Ottawa", country: "Canada", gender: "FEMALE" as const, birthDate: new Date("1990-03-15"), region: "ONTARIO" as const },
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

  // ---- Historical activities (May/Jun/Jul 2026) to power monthly rankings + Hall of Fame ----
  // Each profile's [may, jun, jul] multiplier varies so different runners top different months.
  const profiles = [
    { user: eddie, runsPerMonth: 16, baseDistanceM: 8500, monthFactor: [1.0, 0.75, 1.15] },
    { user: jiho, runsPerMonth: 14, baseDistanceM: 9200, monthFactor: [0.8, 1.3, 0.9] },
    { user: jenny, runsPerMonth: 13, baseDistanceM: 7200, monthFactor: [0.7, 1.0, 1.2] },
    { user: yuna, runsPerMonth: 12, baseDistanceM: 6800, monthFactor: [1.1, 0.9, 0.85] },
    { user: mark, runsPerMonth: 10, baseDistanceM: 6000, monthFactor: [0.9, 0.95, 1.0] },
    { user: sora, runsPerMonth: 8, baseDistanceM: 5200, monthFactor: [0.6, 0.8, 1.05] },
  ];

  const months = [5, 6, 7];
  let historicalCount = 0;
  for (const profile of profiles) {
    for (const [mi, month] of months.entries()) {
      const factor = profile.monthFactor[mi];
      for (let i = 0; i < profile.runsPerMonth; i++) {
        const day = 1 + ((i * 3) % 27);
        const hour = 6 + (i % 4) * 3;
        const distanceM = Math.round(profile.baseDistanceM * factor * (0.7 + (i % 5) * 0.15));
        const durationSec = Math.round(distanceM / 1000 * (270 + (i % 4) * 20)); // ~4'30"-5'50" per km
        await prisma.activity.create({
          data: {
            userId: profile.user.id,
            // Device-verified source so these count toward Rankings/Hall of
            // Fame — "MANUAL" is reserved for self-reported My Runs entries,
            // which are intentionally excluded from ranked mileage.
            source: "APPLE_HEALTH",
            externalId: `seed-${profile.user.id}-${month}-${i}`,
            distanceM,
            durationSec,
            avgPaceSecPerKm: Math.round(durationSec / (distanceM / 1000)),
            runType: RUN_TYPES[i % RUN_TYPES.length],
            startedAt: dateInMonth(2026, month, day, hour),
          },
        });
        historicalCount++;
      }
    }
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

  // ---- Hall of Fame: snapshot the (now-closed) months we backfilled ----
  for (const month of months) {
    const periodKey = `2026-${String(month).padStart(2, "0")}`;
    await snapshotPeriodWinners(prisma, "month", periodKey, {}, 3);
  }

  console.log(
    `Seeded ${userSeeds.length} users, ${historicalCount} historical activities, ${activities.length} recent activities, and Hall of Fame winners for ${months.length} months.`,
  );
  console.log(`Current live ranking periods: month=${getCurrentPeriodKey("month")}, week=${getCurrentPeriodKey("week")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

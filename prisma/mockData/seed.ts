// Bootstrap seed: creates ~5 mock runners (profile, gear, World Marathon
// Majors race history) so the site doesn't look empty before real signups
// arrive. Purely additive — never deletes or modifies existing rows — and
// every row it creates is tagged `isMockData: true` so it can all be
// removed later in one pass with `remove.ts`.
//
// Run with:  npx tsx --env-file=.env prisma/mockData/seed.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Gender, type GearCategory } from "../../src/generated/prisma/client";
import { GEAR_PRODUCT_CATALOG, isCatalogCategory } from "../../src/lib/gear";
import {
  BIOS_BY_TONE,
  CALIBERS,
  CITIES,
  FIRST_NAMES,
  GENDER_WEIGHTS,
  GEAR_OWNERSHIP_ODDS,
  LAST_NAMES,
  POPULAR_BRANDS,
  RACE_DATES,
  RACE_LOCATION,
  makeRand,
  pick,
  weightedPick,
  type Caliber,
} from "./pools";

const MOCK_USER_COUNT = 5;
const SEED = 20260824;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugifyUsername(first: string, last: string, rand: () => number): string {
  const base = `${first}${last}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  const withNumber = rand() < 0.4;
  return withNumber ? `${base}${Math.floor(rand() * 89) + 10}` : base;
}

function toneForCaliber(caliber: Caliber): keyof typeof BIOS_BY_TONE {
  if (caliber === "elite" || caliber === "competitive") return "serious";
  if (caliber === "beginner") return "new";
  return "casual";
}

async function main() {
  const rand = makeRand(SEED);

  const existingUsernames = new Set((await prisma.user.findMany({ select: { username: true } })).map((u) => u.username));

  let created = 0;

  for (let i = 0; i < MOCK_USER_COUNT; i++) {
    const firstName = pick(FIRST_NAMES, rand);
    const lastName = pick(LAST_NAMES, rand);
    let username = slugifyUsername(firstName, lastName, rand);
    while (existingUsernames.has(username)) {
      username = `${username}${Math.floor(rand() * 900) + 100}`;
    }
    existingUsernames.add(username);

    const city = pick(CITIES, rand);
    const gender: Gender = weightedPick(GENDER_WEIGHTS, rand);
    const caliber = weightedPick(
      CALIBERS.map((c) => [c.key, c.weight] as [Caliber, number]),
      rand,
    );
    const caliberInfo = CALIBERS.find((c) => c.key === caliber)!;
    const bio = pick(BIOS_BY_TONE[toneForCaliber(caliber)], rand);
    const birthYear = 1971 + Math.floor(rand() * 33); // ~22-55 years old as of 2026

    const user = await prisma.user.create({
      data: {
        email: `${username}@mockuser.invalid`,
        username,
        displayId: username,
        firstName,
        lastName,
        bio,
        city: city.city,
        country: city.country,
        region: city.region ?? null,
        gender,
        birthDate: new Date(Date.UTC(birthYear, Math.floor(rand() * 12), 1 + Math.floor(rand() * 28))),
        isMockData: true,
      },
    });

    // ---- Gear ----
    for (const [category, odds] of GEAR_OWNERSHIP_ODDS) {
      if (rand() >= odds) continue;
      const cat = category as GearCategory;
      const brandPool = POPULAR_BRANDS[category];
      const brand = weightedPick(brandPool, rand);

      // Brand-only categories (APPAREL, NUTRITION, HEADLAMP, GLOVES) have no
      // model catalog to draw from, so `model` just stays null for them.
      let model: string | null = null;
      if (isCatalogCategory(cat)) {
        const models = GEAR_PRODUCT_CATALOG[cat][brand];
        if (models?.length) model = pick(models, rand);
      }

      await prisma.gear.create({
        data: {
          ownerId: user.id,
          category: cat,
          brand,
          model,
          isFavorite: rand() < 0.85,
          purchaseDate:
            rand() < 0.7 ? new Date(Date.UTC(2023 + Math.floor(rand() * 4), Math.floor(rand() * 12), 1)) : null,
        },
      });
    }

    // ---- Race history ----
    const raceCountRoll = rand();
    const raceCount = raceCountRoll < 0.15 ? 0 : raceCountRoll < 0.4 ? 1 : raceCountRoll < 0.65 ? 2 : raceCountRoll < 0.8 ? 3 : raceCountRoll < 0.9 ? 4 : raceCountRoll < 0.96 ? 5 : 6;

    const usedMajorYear = new Set<string>();
    const candidates = [...RACE_DATES].sort(() => rand() - 0.5);
    let picked = 0;
    for (const candidate of candidates) {
      if (picked >= raceCount) break;
      const key = `${candidate.major}-${candidate.year}`;
      if (usedMajorYear.has(key)) continue;
      usedMajorYear.add(key);
      picked++;

      const [minSec, maxSec] = caliberInfo.range;
      const baseSec = minSec + rand() * (maxSec - minSec);
      const variance = 1 + (rand() - 0.5) * 0.06; // +/-3% per race
      const durationSec = Math.round(baseSec * variance);
      const avgPaceSecPerKm = Math.round(durationSec / 42.195);

      await prisma.activity.create({
        data: {
          userId: user.id,
          title: `${candidate.year} ${candidate.major.replace("_", " ")} Marathon`,
          distanceM: 42195,
          durationSec,
          avgPaceSecPerKm,
          runType: "RACE",
          major: candidate.major,
          raceDistance: "FULL",
          startedAt: new Date(candidate.date),
          location: RACE_LOCATION[candidate.major],
          avgHeartRateBpm: 140 + Math.floor(rand() * 32),
          avgCadenceSpm: 168 + Math.floor(rand() * 18),
          // Left unverified deliberately — verification claims an admin
          // reviewed real evidence (bib/photos/timing page), which isn't
          // true for seeded data.
          verifiedAt: null,
        },
      });
    }

    created++;
  }

  console.log(`Created ${created} mock users (tagged isMockData: true).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

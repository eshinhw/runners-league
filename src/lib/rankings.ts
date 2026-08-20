import type { Gender, PeriodType, PrismaClient, Region, RunType } from "../generated/prisma/client";

export type PeriodKind = "week" | "month";

export const GENDER_LABEL: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  UNSPECIFIED: "All",
};

export const REGION_LABEL: Record<Region, string> = {
  ONTARIO: "Ontario",
  QUEBEC: "Quebec",
  BRITISH_COLUMBIA: "British Columbia",
  ALBERTA: "Alberta",
  MANITOBA: "Manitoba",
  SASKATCHEWAN: "Saskatchewan",
  NOVA_SCOTIA: "Nova Scotia",
  NEW_BRUNSWICK: "New Brunswick",
  NEWFOUNDLAND_AND_LABRADOR: "Newfoundland and Labrador",
  PRINCE_EDWARD_ISLAND: "Prince Edward Island",
  YUKON: "Yukon",
  NORTHWEST_TERRITORIES: "Northwest Territories",
  NUNAVUT: "Nunavut",
  OTHER: "Other",
};

export const RUN_TYPE_LABEL: Record<RunType, string> = {
  SPEED: "Speed",
  TEMPO: "Tempo",
  LSD: "LSD (Long Run)",
  EASY: "Easy Run",
  RACE: "Race",
};

export const AGE_BANDS = ["10s", "20s", "30s", "40s", "50s+"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const AGE_BAND_LABEL: Record<AgeBand, string> = {
  "10s": "10s",
  "20s": "20s",
  "30s": "30s",
  "40s": "40s",
  "50s+": "50s+",
};

export function computeAgeBand(birthDate: Date | null, at = new Date()): AgeBand | null {
  if (!birthDate) return null;
  let age = at.getFullYear() - birthDate.getFullYear();
  const hadBirthdayThisYear =
    at.getMonth() > birthDate.getMonth() ||
    (at.getMonth() === birthDate.getMonth() && at.getDate() >= birthDate.getDate());
  if (!hadBirthdayThisYear) age -= 1;

  if (age < 20) return "10s";
  if (age < 30) return "20s";
  if (age < 40) return "30s";
  if (age < 50) return "40s";
  return "50s+";
}

// ---- ISO week helpers ----

function isoWeekOf(date: Date, useUTC = false): { year: number; week: number } {
  const y = useUTC ? date.getUTCFullYear() : date.getFullYear();
  const m = useUTC ? date.getUTCMonth() : date.getMonth();
  const day = useUTC ? date.getUTCDate() : date.getDate();
  const d = new Date(Date.UTC(y, m, day));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
  return { year: d.getUTCFullYear(), week };
}

function isoWeekRange(year: number, week: number): { start: Date; end: Date } {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dayOfWeek = simple.getUTCDay();
  const diff = dayOfWeek <= 4 ? dayOfWeek - 1 : dayOfWeek - 8;
  const start = new Date(simple);
  start.setUTCDate(simple.getUTCDate() - diff);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return { start, end };
}

// ---- Period key <-> range/label ----

export function getCurrentPeriodKey(kind: PeriodKind): string {
  const now = new Date();
  if (kind === "month") {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  const { year, week } = isoWeekOf(now);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function getPeriodRange(kind: PeriodKind, key: string): { start: Date; end: Date } {
  if (kind === "month") {
    const [y, m] = key.split("-").map(Number);
    return { start: new Date(Date.UTC(y, m - 1, 1)), end: new Date(Date.UTC(y, m, 1)) };
  }
  const [y, wStr] = key.split("-W");
  return isoWeekRange(Number(y), Number(wStr));
}

// Shift a period key by `delta` periods (negative = earlier), e.g. for
// week-over-week / month-over-month rank comparisons.
export function shiftPeriodKey(kind: PeriodKind, key: string, delta: number): string {
  if (kind === "month") {
    const [y, m] = key.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  }
  const { start } = getPeriodRange(kind, key);
  const shifted = new Date(start);
  shifted.setUTCDate(shifted.getUTCDate() + delta * 7);
  const { year, week } = isoWeekOf(shifted, true);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

const MONTH_NAME = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ordinalSuffix(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
  if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
  if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
  return `${n}th`;
}

export function getPeriodLabel(kind: PeriodKind, key: string): string {
  if (kind === "month") {
    const [y, m] = key.split("-").map(Number);
    return `${MONTH_NAME[m - 1]} ${y}`;
  }
  const [yStr, wStr] = key.split("-W");
  const { start } = isoWeekRange(Number(yStr), Number(wStr));
  const weekOfMonth = Math.ceil(start.getUTCDate() / 7);
  return `${MONTH_NAME[start.getUTCMonth()]} ${ordinalSuffix(weekOfMonth)} week, ${start.getUTCFullYear()}`;
}

// ---- Leaderboard queries ----

export type RankingFilters = {
  gender?: Gender;
  region?: Region;
  runType?: RunType;
  ageBand?: AgeBand;
};

export type RankingRow = {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  totalDistanceM: number;
  runCount: number;
};

export async function getLeaderboard(
  db: PrismaClient,
  kind: PeriodKind,
  periodKey: string,
  filters: RankingFilters = {},
  limit = 50,
  // Restricts the board to a specific set of users (e.g. a challenge's
  // participants) — intersected with any demographic filters above, not a
  // replacement for them.
  participantUserIds?: string[],
): Promise<{ start: Date; end: Date; rows: RankingRow[] }> {
  const { start, end } = getPeriodRange(kind, periodKey);

  let eligibleUserIds: string[] | undefined;
  if (filters.gender || filters.region || filters.ageBand) {
    const candidates = await db.user.findMany({
      where: {
        ...(filters.gender ? { gender: filters.gender } : {}),
        ...(filters.region ? { region: filters.region } : {}),
      },
      select: { id: true, birthDate: true },
    });
    eligibleUserIds = candidates
      .filter((u) => !filters.ageBand || computeAgeBand(u.birthDate) === filters.ageBand)
      .map((u) => u.id);
  }
  if (participantUserIds) {
    eligibleUserIds = eligibleUserIds
      ? eligibleUserIds.filter((id) => participantUserIds.includes(id))
      : participantUserIds;
  }

  const grouped = await db.activity.groupBy({
    by: ["userId"],
    where: {
      startedAt: { gte: start, lt: end },
      // Only device-synced activities count toward rankings — manual entries
      // can't be trusted and would let anyone game their mileage.
      source: { not: "MANUAL" },
      ...(filters.runType ? { runType: filters.runType } : {}),
      ...(eligibleUserIds ? { userId: { in: eligibleUserIds } } : {}),
    },
    _sum: { distanceM: true },
    _count: { _all: true },
    orderBy: { _sum: { distanceM: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return { start, end, rows: [] };

  const users = await db.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, username: true, displayName: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const rows: RankingRow[] = grouped.map((g, i) => {
    const user = userMap.get(g.userId)!;
    return {
      rank: i + 1,
      userId: g.userId,
      username: user.username,
      displayName: user.displayName,
      totalDistanceM: g._sum.distanceM ?? 0,
      runCount: g._count._all,
    };
  });

  return { start, end, rows };
}

export async function snapshotPeriodWinners(
  db: PrismaClient,
  kind: PeriodKind,
  periodKey: string,
  filters: RankingFilters = {},
  topN = 3,
) {
  const { rows } = await getLeaderboard(db, kind, periodKey, filters, topN);
  if (rows.length === 0) return;

  const periodType: PeriodType = kind === "month" ? "MONTHLY" : "WEEKLY";
  const periodLabel = getPeriodLabel(kind, periodKey);

  await db.leaderboardWinner.createMany({
    data: rows.map((r) => ({
      periodType,
      periodKey,
      periodLabel,
      gender: filters.gender ?? null,
      region: filters.region ?? null,
      runType: filters.runType ?? null,
      ageBand: filters.ageBand ?? null,
      rank: r.rank,
      userId: r.userId,
      totalDistanceM: r.totalDistanceM,
      runCount: r.runCount,
    })),
  });
}

// Overall (unsegmented) #1 finishes, keyed by userId — powers the 🏆 champion badge.
export async function getChampionCounts(db: PrismaClient, userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();
  const wins = await db.leaderboardWinner.groupBy({
    by: ["userId"],
    where: {
      userId: { in: userIds },
      rank: 1,
      gender: null,
      region: null,
      runType: null,
      ageBand: null,
    },
    _count: { _all: true },
  });
  return new Map(wins.map((w) => [w.userId, w._count._all]));
}

export async function getHallOfFame(db: PrismaClient, periodType?: PeriodType, limit = 60) {
  return db.leaderboardWinner.findMany({
    where: {
      ...(periodType ? { periodType } : {}),
      gender: null,
      region: null,
      runType: null,
      ageBand: null,
    },
    orderBy: [{ periodKey: "desc" }, { rank: "asc" }],
    take: limit,
    include: { user: true },
  });
}

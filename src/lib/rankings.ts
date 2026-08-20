import type { Gender, PeriodType, PrismaClient, Region, RunType } from "../generated/prisma/client";

export type PeriodKind = "week" | "month";

export const GENDER_LABEL: Record<Gender, string> = {
  MALE: "남성",
  FEMALE: "여성",
  UNSPECIFIED: "전체",
};

export const REGION_LABEL: Record<Region, string> = {
  SEOUL: "서울",
  BUSAN: "부산",
  INCHEON: "인천",
  DAEGU: "대구",
  DAEJEON: "대전",
  GWANGJU: "광주",
  ULSAN: "울산",
  SEJONG: "세종",
  GYEONGGI: "경기",
  GANGWON: "강원",
  CHUNGBUK: "충북",
  CHUNGNAM: "충남",
  JEONBUK: "전북",
  JEONNAM: "전남",
  GYEONGBUK: "경북",
  GYEONGNAM: "경남",
  JEJU: "제주",
  OTHER: "기타",
};

export const RUN_TYPE_LABEL: Record<RunType, string> = {
  SPEED: "스피드",
  TEMPO: "템포",
  LSD: "LSD (롱런)",
  EASY: "이지런",
  RACE: "레이스",
};

export const AGE_BANDS = ["10s", "20s", "30s", "40s", "50s+"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const AGE_BAND_LABEL: Record<AgeBand, string> = {
  "10s": "10대",
  "20s": "20대",
  "30s": "30대",
  "40s": "40대",
  "50s+": "50대+",
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

const WEEK_ORDINAL = ["첫째", "둘째", "셋째", "넷째", "다섯째"];

export function getPeriodLabel(kind: PeriodKind, key: string): string {
  if (kind === "month") {
    const [y, m] = key.split("-").map(Number);
    return `${y}년 ${m}월`;
  }
  const [yStr, wStr] = key.split("-W");
  const { start } = isoWeekRange(Number(yStr), Number(wStr));
  const weekOfMonth = Math.ceil(start.getUTCDate() / 7);
  const ordinal = WEEK_ORDINAL[weekOfMonth - 1] ?? `${weekOfMonth}`;
  return `${start.getUTCFullYear()}년 ${start.getUTCMonth() + 1}월 ${ordinal}주`;
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

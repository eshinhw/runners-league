import type { Gender, MarathonMajor, PrismaClient } from "../generated/prisma/client";
import { MAJORS_ORDER } from "./majors";

export const GENDER_LABEL: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  UNSPECIFIED: "Select",
};

// ---- Majors Completed leaderboard: how many of the 7 majors each runner has finished ----

export type MajorsCompletedRow = {
  rank: number;
  userId: string;
  username: string;
  displayId: string;
  majorsCompleted: MarathonMajor[];
  bestTotalDurationSec: number; // sum of each completed major's fastest finish, tie-break only
};

export async function getMajorsCompletedLeaderboard(db: PrismaClient, limit = 50): Promise<MajorsCompletedRow[]> {
  const results = await db.activity.findMany({
    where: { major: { not: null } },
    select: {
      userId: true,
      major: true,
      durationSec: true,
      user: { select: { username: true, displayId: true } },
    },
  });

  const byUser = new Map<
    string,
    { username: string; displayId: string; bestByMajor: Map<MarathonMajor, number> }
  >();

  for (const r of results) {
    const major = r.major!;
    let entry = byUser.get(r.userId);
    if (!entry) {
      entry = { username: r.user.username, displayId: r.user.displayId, bestByMajor: new Map() };
      byUser.set(r.userId, entry);
    }
    const current = entry.bestByMajor.get(major);
    if (current === undefined || r.durationSec < current) {
      entry.bestByMajor.set(major, r.durationSec);
    }
  }

  const rows = [...byUser.entries()]
    .map(([userId, entry]) => ({
      userId,
      username: entry.username,
      displayId: entry.displayId,
      majorsCompleted: MAJORS_ORDER.filter((m) => entry.bestByMajor.has(m)),
      bestTotalDurationSec: [...entry.bestByMajor.values()].reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.majorsCompleted.length - a.majorsCompleted.length || a.bestTotalDurationSec - b.bestTotalDurationSec)
    .slice(0, limit);

  return rows.map((r, i) => ({ rank: i + 1, ...r }));
}

// ---- Per-edition leaderboard: finishers of one major in one year ----

export type MajorEditionRow = {
  rank: number;
  userId: string;
  username: string;
  displayId: string;
  durationSec: number;
  avgPaceSecPerKm: number | null;
};

export async function getMajorEditionLeaderboard(
  db: PrismaClient,
  major: MarathonMajor,
  year: number,
  limit = 50,
): Promise<MajorEditionRow[]> {
  const activities = await db.activity.findMany({
    where: {
      major,
      startedAt: { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) },
    },
    orderBy: { durationSec: "asc" },
    take: limit,
    select: {
      durationSec: true,
      avgPaceSecPerKm: true,
      userId: true,
      user: { select: { username: true, displayId: true } },
    },
  });

  return activities.map((a, i) => ({
    rank: i + 1,
    userId: a.userId,
    username: a.user.username,
    displayId: a.user.displayId,
    durationSec: a.durationSec,
    avgPaceSecPerKm: a.avgPaceSecPerKm,
  }));
}

// Distinct (major, year) editions that actually have at least one logged finisher.
export async function getEditionsWithResults(db: PrismaClient): Promise<{ major: MarathonMajor; year: number }[]> {
  const activities = await db.activity.findMany({
    where: { major: { not: null } },
    select: { major: true, startedAt: true },
  });
  const seen = new Map<string, { major: MarathonMajor; year: number }>();
  for (const a of activities) {
    const year = a.startedAt.getUTCFullYear();
    const key = `${a.major}-${year}`;
    if (!seen.has(key)) seen.set(key, { major: a.major!, year });
  }
  return [...seen.values()].sort((a, b) => b.year - a.year || MAJORS_ORDER.indexOf(a.major) - MAJORS_ORDER.indexOf(b.major));
}

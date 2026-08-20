import type { Challenge, PrismaClient } from "../generated/prisma/client";
import { getCurrentPeriodKey, getLeaderboard, getPeriodLabel, type PeriodKind } from "./rankings";

type ChallengeTemplate = {
  templateKey: string;
  kind: PeriodKind;
  titleFor: (periodLabel: string) => string;
  description: string;
  targetDistanceM: number | null;
};

const TEMPLATES: ChallengeTemplate[] = [
  {
    templateKey: "weekly-open",
    kind: "week",
    titleFor: (label) => `${label} Open Mileage Race`,
    description: "Whoever logs the most mileage this week wins. No target distance — pure mileage battle.",
    targetDistanceM: null,
  },
  {
    templateKey: "weekly-5k",
    kind: "week",
    titleFor: (label) => `${label} 5K Challenge`,
    description: "Run a combined 5km or more this week.",
    targetDistanceM: 5000,
  },
  {
    templateKey: "monthly-open",
    kind: "month",
    titleFor: (label) => `${label} Open Mileage Race`,
    description: "Whoever logs the most mileage this month wins. No target distance — pure mileage battle.",
    targetDistanceM: null,
  },
  {
    templateKey: "monthly-50k",
    kind: "month",
    titleFor: (label) => `${label} 50K Challenge`,
    description: "Run a combined 50km or more this month (about 12.5km/week).",
    targetDistanceM: 50_000,
  },
];

// Idempotent — safe to call on every /races page load. Prisma's upsert is a
// single atomic DB operation, so concurrent requests can't create duplicates.
export async function ensureCurrentChallenges(db: PrismaClient): Promise<void> {
  await Promise.all(
    TEMPLATES.map((template) => {
      const kind = template.kind;
      const periodType = kind === "month" ? "MONTHLY" : "WEEKLY";
      const periodKey = getCurrentPeriodKey(kind);
      const periodLabel = getPeriodLabel(kind, periodKey);

      return db.challenge.upsert({
        where: { periodType_periodKey_templateKey: { periodType, periodKey, templateKey: template.templateKey } },
        create: {
          templateKey: template.templateKey,
          periodType,
          periodKey,
          title: template.titleFor(periodLabel),
          description: template.description,
          targetDistanceM: template.targetDistanceM,
        },
        // Re-applied on every load so template copy edits (e.g. a wording or
        // locale change) propagate to already-created periods too.
        update: {
          title: template.titleFor(periodLabel),
          description: template.description,
          targetDistanceM: template.targetDistanceM,
        },
      });
    }),
  );
}

function challengeKind(periodType: Challenge["periodType"]): PeriodKind {
  return periodType === "MONTHLY" ? "month" : "week";
}

export async function getChallengeLeaderboard(db: PrismaClient, challenge: Challenge, limit = 50) {
  const participants = await db.challengeParticipant.findMany({
    where: { challengeId: challenge.id },
    select: { userId: true },
  });
  const participantUserIds = participants.map((p) => p.userId);

  if (participantUserIds.length === 0) {
    return { rows: [], participantCount: 0 };
  }

  const { rows } = await getLeaderboard(
    db,
    challengeKind(challenge.periodType),
    challenge.periodKey,
    {},
    limit,
    participantUserIds,
  );

  return { rows, participantCount: participantUserIds.length };
}

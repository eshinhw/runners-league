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
    titleFor: (label) => `${label} 오픈 마일리지 레이스`,
    description: "이번 주 가장 많이 뛴 참가자가 1위. 목표 거리 없이 순수 마일리지 대결.",
    targetDistanceM: null,
  },
  {
    templateKey: "weekly-5k",
    kind: "week",
    titleFor: (label) => `${label} 5K 챌린지`,
    description: "이번 주 안에 누적 5km 이상 뛰어보세요.",
    targetDistanceM: 5000,
  },
  {
    templateKey: "monthly-open",
    kind: "month",
    titleFor: (label) => `${label} 오픈 마일리지 레이스`,
    description: "이번 달 가장 많이 뛴 참가자가 1위. 목표 거리 없이 순수 마일리지 대결.",
    targetDistanceM: null,
  },
  {
    templateKey: "monthly-50k",
    kind: "month",
    titleFor: (label) => `${label} 50K 챌린지`,
    description: "이번 달 안에 누적 50km 이상 뛰어보세요 (주당 약 12.5km 페이스).",
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
        update: {},
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

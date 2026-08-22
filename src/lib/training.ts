import type { UnitSystem } from "@/generated/prisma/client";
import { distanceUnitLabel, formatDistanceKm, KM_PER_MI } from "@/lib/format";

export type TrainingWeek = {
  week: number;
  phase: "Base" | "Build" | "Peak" | "Taper" | "Race";
  weeklyKm: number;
  longRunKm: number;
  keyWorkout: string;
};

export type TrainingPlan = {
  key: string;
  title: string;
  subtitle: string;
  weeks: TrainingWeek[];
};

// Cutback (recovery) every 4th week — standard progressive-overload pattern.
function isCutbackWeek(week: number): boolean {
  return week % 4 === 0;
}

function buildWeeks(
  totalWeeks: number,
  startKm: number,
  peakKm: number,
  startLongRunKm: number,
  peakLongRunKm: number,
  taperWeeks: number,
  keyWorkouts: (week: number, phase: TrainingWeek["phase"]) => string,
): TrainingWeek[] {
  const buildEnd = totalWeeks - taperWeeks;
  const weeks: TrainingWeek[] = [];

  for (let w = 1; w <= totalWeeks; w++) {
    let phase: TrainingWeek["phase"];
    if (w === totalWeeks) phase = "Race";
    else if (w > buildEnd) phase = "Taper";
    else if (w > buildEnd * 0.55) phase = "Peak";
    else if (w > buildEnd * 0.2) phase = "Build";
    else phase = "Base";

    const progress = Math.min(1, (w - 1) / Math.max(1, buildEnd - 1));
    let weeklyKm = startKm + (peakKm - startKm) * progress;
    let longRunKm = startLongRunKm + (peakLongRunKm - startLongRunKm) * progress;

    if (phase === "Taper") {
      const taperProgress = (w - buildEnd) / taperWeeks;
      weeklyKm = peakKm * (1 - taperProgress * 0.55);
      longRunKm = peakLongRunKm * (1 - taperProgress * 0.6);
    }
    if (phase === "Race") {
      weeklyKm = 21;
      longRunKm = 42.2;
    }
    if (isCutbackWeek(w) && phase !== "Taper" && phase !== "Race") {
      weeklyKm *= 0.78;
      longRunKm *= 0.85;
    }

    weeks.push({
      week: w,
      phase,
      weeklyKm: Math.round(weeklyKm),
      longRunKm: phase === "Race" ? 42.2 : Math.round(Math.min(longRunKm, 34)),
      keyWorkout: keyWorkouts(w, phase),
    });
  }
  return weeks;
}

export const BEGINNER_PLAN: TrainingPlan = {
  key: "beginner",
  title: "Beginner — Finish Strong",
  subtitle: "16 weeks, 4 runs/week. Goal: cross the finish line feeling good.",
  weeks: buildWeeks(16, 18, 42, 8, 29, 3, (w, phase) => {
    if (phase === "Race") return "Race day — go run your marathon!";
    if (phase === "Taper") return "Easy running only, stay loose, trust your training.";
    if (isCutbackWeek(w)) return "Recovery week — easy running, extra rest day.";
    return "Easy-paced runs + one long run at a comfortable, conversational pace.";
  }),
};

export const SUB4_PLAN: TrainingPlan = {
  key: "sub4",
  title: "Sub-4:00 Marathon",
  subtitle: "16 weeks, 5 runs/week. Goal: break 4 hours (~5:41/km average).",
  weeks: buildWeeks(16, 32, 62, 13, 32, 3, (w, phase) => {
    if (phase === "Race") return "Race day — target ~5:41/km even split.";
    if (phase === "Taper") return "Easy running + short marathon-pace strides.";
    if (isCutbackWeek(w)) return "Recovery week — easy running only.";
    if (phase === "Peak") return "Tempo run + long run with marathon-pace finish miles.";
    if (phase === "Build") return "Tempo run (20-30 min @ threshold) + long run.";
    return "Easy runs + one moderate long run.";
  }),
};

export const SUB3_PLAN: TrainingPlan = {
  key: "sub3",
  title: "Sub-3:00 Marathon",
  subtitle: "16 weeks, 6 runs/week. Goal: break 3 hours (~4:15/km average).",
  weeks: buildWeeks(16, 50, 90, 16, 34, 2, (w, phase) => {
    if (phase === "Race") return "Race day — target ~4:15/km even split.";
    if (phase === "Taper") return "Sharpening intervals + easy running, cut volume ~40%.";
    if (isCutbackWeek(w)) return "Recovery week — easy running only.";
    if (phase === "Peak") return "VO2 intervals + tempo + long run with race-pace segments.";
    if (phase === "Build") return "Threshold intervals + long run with marathon-pace miles.";
    return "Easy runs + strides + one long run.";
  }),
};

export const STATIC_PLANS: TrainingPlan[] = [BEGINNER_PLAN, SUB4_PLAN, SUB3_PLAN];

// ---- Custom plan, computed from the runner's own inputs ----

export type CustomPlanInput = {
  currentWeeklyKm: number;
  avgPaceSecPerKm: number;
  weeksToRace: number;
  unitSystem?: UnitSystem;
};

export type CustomPlanResult = {
  plan: TrainingPlan;
  paces: { label: string; secPerKm: number }[];
  notes: string[];
};

function formatPaceLabel(secPerKm: number, unitSystem: UnitSystem = "METRIC"): string {
  const secPerUnit = unitSystem === "IMPERIAL" ? secPerKm * KM_PER_MI : secPerKm;
  const min = Math.floor(secPerUnit / 60);
  const sec = Math.round(secPerUnit % 60);
  return `${min}:${sec.toString().padStart(2, "0")}/${distanceUnitLabel(unitSystem)}`;
}

export function generateCustomPlan(input: CustomPlanInput): CustomPlanResult {
  const weeksToRace = Math.max(4, Math.min(40, Math.round(input.weeksToRace)));
  const currentKm = Math.max(5, input.currentWeeklyKm);
  const unitSystem = input.unitSystem ?? "METRIC";
  const taperWeeks = weeksToRace >= 10 ? 3 : 2;

  // Cap growth to a safe ~8%/week compounding rate, bounded by the weeks available.
  const buildWeeksCount = weeksToRace - taperWeeks;
  const maxGrowth = Math.pow(1.08, Math.max(1, buildWeeksCount));
  const peakKm = Math.round(Math.min(currentKm * maxGrowth, currentKm * 1.9, 95));
  const startLongRunKm = Math.round(Math.min(currentKm * 0.35, 16));
  const peakLongRunKm = Math.round(Math.min(peakKm * 0.36, 34));

  const notes: string[] = [];
  if (weeksToRace < 8) {
    notes.push(
      `Only ${weeksToRace} weeks out — this is a compressed plan focused on maintaining fitness and arriving healthy, not maximizing volume.`,
    );
  }
  if (peakKm - currentKm < currentKm * 0.15) {
    notes.push("Your race is close relative to your current mileage, so peak volume stays close to what you run today.");
  }
  notes.push("General guidance only, not medical advice — check with a doctor before starting a new training block, especially with any injury history.");

  const weeks = buildWeeks(weeksToRace, currentKm, peakKm, startLongRunKm, peakLongRunKm, taperWeeks, (w, phase) => {
    if (phase === "Race") return "Race day — trust the work you've put in.";
    if (phase === "Taper") return "Easy running + short pace-effort strides, cut volume for fresh legs.";
    if (isCutbackWeek(w)) return "Recovery week — easy running only.";
    if (phase === "Peak") return "Tempo or interval workout + long run with goal-pace segments.";
    if (phase === "Build") return "One quality workout (tempo/intervals) + long run.";
    return "Easy running + one longer run to build your base.";
  });

  const paces = [
    { label: "Easy", secPerKm: input.avgPaceSecPerKm + 50 },
    { label: "Long run", secPerKm: input.avgPaceSecPerKm + 30 },
    { label: "Tempo", secPerKm: Math.max(150, input.avgPaceSecPerKm - 15) },
    { label: "Interval (400-1000m)", secPerKm: Math.max(140, input.avgPaceSecPerKm - 35) },
  ];

  return {
    plan: {
      key: "custom",
      title: "Your Custom Plan",
      subtitle: `${weeksToRace} weeks, built from your current ${formatDistanceKm(currentKm, unitSystem)}/week base.`,
      weeks,
    },
    paces,
    notes,
  };
}

export { formatPaceLabel };

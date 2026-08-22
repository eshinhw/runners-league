import type { UnitSystem } from "@/generated/prisma/client";
import { distanceUnitLabel, formatDistanceKm } from "@/lib/format";
import type { TrainingPlan } from "@/lib/training";

const PHASE_COLOR: Record<string, string> = {
  Base: "text-zinc-500",
  Build: "text-blue-500",
  Peak: "text-orange-500",
  Taper: "text-emerald-500",
  Race: "text-rose-500",
};

export function TrainingPlanTable({
  plan,
  unitSystem = "METRIC",
}: {
  plan: TrainingPlan;
  unitSystem?: UnitSystem;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-medium">{plan.title}</h3>
        <p className="text-sm text-zinc-500">{plan.subtitle}</p>
      </div>

      {/* Key workout text is full sentences — too long for a table column on
          mobile, so stack each week as a card there instead of forcing a
          horizontal scroll. Table layout takes over from sm: up. */}
      <div className="flex flex-col gap-2 sm:hidden">
        {plan.weeks.map((w) => (
          <div key={w.week} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Week {w.week} · <span className={PHASE_COLOR[w.phase] ?? ""}>{w.phase}</span>
              </span>
              <span className="font-mono text-sm tabular-nums text-zinc-500">
                {formatDistanceKm(w.weeklyKm, unitSystem)} · {formatDistanceKm(w.longRunKm, unitSystem)} long
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{w.keyWorkout}</p>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
              <th className="w-14 py-2">Week</th>
              <th className="w-20 py-2">Phase</th>
              <th className="w-28 py-2 text-right">Weekly {distanceUnitLabel(unitSystem)}</th>
              <th className="w-28 py-2 pr-6 text-right">Long run</th>
              <th className="py-2 pl-4">Key workout</th>
            </tr>
          </thead>
          <tbody>
            {plan.weeks.map((w) => (
              <tr key={w.week} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 font-mono tabular-nums">{w.week}</td>
                <td className={`py-2 font-medium ${PHASE_COLOR[w.phase] ?? ""}`}>{w.phase}</td>
                <td className="py-2 text-right font-mono tabular-nums">{formatDistanceKm(w.weeklyKm, unitSystem)}</td>
                <td className="py-2 pr-6 text-right font-mono tabular-nums">
                  {formatDistanceKm(w.longRunKm, unitSystem)}
                </td>
                <td className="py-2 pl-4 text-zinc-500">{w.keyWorkout}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

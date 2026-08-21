import type { TrainingPlan } from "@/lib/training";

const PHASE_COLOR: Record<string, string> = {
  Base: "text-zinc-500",
  Build: "text-blue-500",
  Peak: "text-orange-500",
  Taper: "text-emerald-500",
  Race: "text-rose-500",
};

export function TrainingPlanTable({ plan }: { plan: TrainingPlan }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-medium">{plan.title}</h3>
        <p className="text-sm text-zinc-500">{plan.subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
              <th className="w-14 py-2">Week</th>
              <th className="w-20 py-2">Phase</th>
              <th className="w-28 py-2 text-right">Weekly km</th>
              <th className="w-28 py-2 text-right">Long run</th>
              <th className="py-2">Key workout</th>
            </tr>
          </thead>
          <tbody>
            {plan.weeks.map((w) => (
              <tr key={w.week} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 font-mono tabular-nums">{w.week}</td>
                <td className={`py-2 font-medium ${PHASE_COLOR[w.phase] ?? ""}`}>{w.phase}</td>
                <td className="py-2 text-right font-mono tabular-nums">{w.weeklyKm} km</td>
                <td className="py-2 text-right font-mono tabular-nums">{w.longRunKm} km</td>
                <td className="py-2 text-zinc-500">{w.keyWorkout}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

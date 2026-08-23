"use client";

import { useState } from "react";
import { TrainingPlanTable } from "@/components/TrainingPlanTable";
import { UnitToggle } from "@/components/units/UnitToggle";
import { useUnitSystem } from "@/components/units/UnitSystemProvider";
import { distanceUnitLabel, KM_PER_MI } from "@/lib/format";
import { formatPaceLabel, generateCustomPlan, type CustomPlanResult } from "@/lib/training";

const inputCls =
  "w-full min-w-0 rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

function parsePaceToSecPerUnit(raw: string): number | null {
  const match = raw.trim().match(/^(\d+):([0-5]?\d)$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function CustomPlanForm() {
  const { unitSystem } = useUnitSystem();
  const [result, setResult] = useState<CustomPlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unit = distanceUnitLabel(unitSystem);

  function handleSubmit(formData: FormData) {
    setError(null);

    const enteredDistance = Number(formData.get("currentWeeklyDistance"));
    const enteredPaceSecPerUnit = parsePaceToSecPerUnit(String(formData.get("avgPace") ?? ""));
    const weeksToRace = Number(formData.get("weeksToRace"));

    if (!enteredDistance || enteredDistance <= 0) {
      setError("Please enter your current weekly distance.");
      return;
    }
    if (!enteredPaceSecPerUnit) {
      setError(`Please enter your average pace as m:ss, e.g. 5:45.`);
      return;
    }
    if (!weeksToRace || weeksToRace <= 0) {
      setError("Please enter how many weeks are left until your race.");
      return;
    }

    const currentWeeklyKm = unitSystem === "IMPERIAL" ? enteredDistance * KM_PER_MI : enteredDistance;
    const avgPaceSecPerKm = unitSystem === "IMPERIAL" ? enteredPaceSecPerUnit / KM_PER_MI : enteredPaceSecPerUnit;

    setResult(generateCustomPlan({ currentWeeklyKm, avgPaceSecPerKm, weeksToRace, unitSystem }));
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-zinc-500">
            Tell us where you're starting from and we'll build a plan tailored to your timeline.
          </p>
          <UnitToggle className="shrink-0" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Current weekly distance ({unit})</span>
            <input
              name="currentWeeklyDistance"
              type="number"
              min={3}
              max={100}
              step={1}
              placeholder={unitSystem === "IMPERIAL" ? "e.g. 15" : "e.g. 25"}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Average pace (m:ss/{unit})</span>
            <input name="avgPace" placeholder="e.g. 5:45" className={inputCls} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Weeks left to race</span>
            <input
              name="weeksToRace"
              type="number"
              min={4}
              max={40}
              step={1}
              placeholder="e.g. 16"
              className={inputCls}
            />
          </label>
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button type="submit" className="self-start rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white">
          Build My Plan
        </button>
      </form>

      {result && (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-zinc-500">Suggested training paces</h3>
            <div className="flex flex-wrap gap-2">
              {result.paces.map((p) => (
                <span
                  key={p.label}
                  className="rounded-full border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700"
                >
                  {p.label}: <span className="font-mono">{formatPaceLabel(p.secPerKm, unitSystem)}</span>
                </span>
              ))}
            </div>
          </div>

          {result.notes.length > 0 && (
            <ul className="flex flex-col gap-1 text-xs text-zinc-500">
              {result.notes.map((n) => (
                <li key={n}>· {n}</li>
              ))}
            </ul>
          )}

          <TrainingPlanTable plan={result.plan} />
        </div>
      )}
    </div>
  );
}

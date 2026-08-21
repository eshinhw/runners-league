"use client";

import { useState } from "react";
import { TrainingPlanTable } from "@/components/TrainingPlanTable";
import { formatPaceLabel, generateCustomPlan, type CustomPlanResult } from "@/lib/training";

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

function parsePaceToSecPerKm(raw: string): number | null {
  const match = raw.trim().match(/^(\d+):([0-5]?\d)$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function CustomPlanForm() {
  const [result, setResult] = useState<CustomPlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);

    const currentWeeklyKm = Number(formData.get("currentWeeklyKm"));
    const avgPaceSecPerKm = parsePaceToSecPerKm(String(formData.get("avgPace") ?? ""));
    const raceDateRaw = String(formData.get("raceDate") ?? "");

    if (!currentWeeklyKm || currentWeeklyKm <= 0) {
      setError("Please enter your current weekly distance.");
      return;
    }
    if (!avgPaceSecPerKm) {
      setError("Please enter your average pace as m:ss, e.g. 5:45.");
      return;
    }
    if (!raceDateRaw) {
      setError("Please enter your target race date.");
      return;
    }

    const weeksToRace = (new Date(raceDateRaw).getTime() - Date.now()) / (7 * 24 * 3600 * 1000);
    if (weeksToRace < 0) {
      setError("Your race date needs to be in the future.");
      return;
    }

    setResult(generateCustomPlan({ currentWeeklyKm, avgPaceSecPerKm, weeksToRace }));
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">
          Tell us where you're starting from and we'll build a plan tailored to your timeline.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Current weekly distance (km)</span>
            <input name="currentWeeklyKm" type="number" min={5} max={150} step={1} placeholder="e.g. 25" className={inputCls} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Average pace (m:ss/km)</span>
            <input name="avgPace" placeholder="e.g. 5:45" className={inputCls} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Target race date</span>
            <input name="raceDate" type="date" min={new Date().toISOString().slice(0, 10)} className={inputCls} />
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
                  {p.label}: <span className="font-mono">{formatPaceLabel(p.secPerKm)}</span>
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

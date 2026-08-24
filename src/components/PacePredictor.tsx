"use client";

import { useState } from "react";
import { UnitToggle } from "@/components/units/UnitToggle";
import { useUnitSystem } from "@/components/units/UnitSystemProvider";
import { formatDuration } from "@/lib/format";
import { formatPaceLabel, PREDICTOR_KNOWN_DISTANCES_M, predictRaceTimes, type PacePrediction } from "@/lib/training";

const inputCls =
  "w-full min-w-0 rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function PacePredictor() {
  const { unitSystem } = useUnitSystem();
  const [prediction, setPrediction] = useState<PacePrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const distanceKey = String(formData.get("distance") ?? "5K") as keyof typeof PREDICTOR_KNOWN_DISTANCES_M;
    const knownDistanceM = PREDICTOR_KNOWN_DISTANCES_M[distanceKey] ?? PREDICTOR_KNOWN_DISTANCES_M["5K"];

    const hours = Number(formData.get("hours") ?? 0);
    const minutes = Number(formData.get("minutes") ?? 0);
    const seconds = Number(formData.get("seconds") ?? 0);
    const knownTimeSec = hours * 3600 + minutes * 60 + seconds;

    if (!knownTimeSec || knownTimeSec <= 0) {
      setError("Please enter your finish time.");
      return;
    }

    setPrediction(predictRaceTimes(knownDistanceM, knownTimeSec));
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-zinc-500">
            Enter a recent 5K or 10K time and we&apos;ll predict your Half and Full Marathon pace, using the{" "}
            <a
              href="https://en.wikipedia.org/wiki/Peter_Riegel"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Riegel formula
            </a>
            .
          </p>
          <UnitToggle className="shrink-0" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">Distance</span>
            <select name="distance" defaultValue="5K" className={inputCls}>
              <option value="5K">5K</option>
              <option value="10K">10K</option>
            </select>
          </label>
          <div>
            <span className="mb-1 block text-xs font-medium text-zinc-500">Finish Time</span>
            <div className="grid grid-cols-3 gap-2">
              <input name="hours" type="number" min={0} max={9} placeholder="hh" className={inputCls} />
              <input name="minutes" type="number" min={0} max={59} placeholder="mm" className={inputCls} />
              <input name="seconds" type="number" min={0} max={59} placeholder="ss" className={inputCls} />
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button type="submit" className="self-start rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white">
          Predict My Time
        </button>
      </form>

      {prediction && (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">Half Marathon</div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {formatDuration(Math.round(prediction.half.timeSec))}
              </div>
              <div className="mt-1 font-mono text-sm text-zinc-500">
                {formatPaceLabel(prediction.half.paceSecPerKm, unitSystem)}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">Full Marathon</div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {formatDuration(Math.round(prediction.full.timeSec))}
              </div>
              <div className="mt-1 font-mono text-sm text-zinc-500">
                {formatPaceLabel(prediction.full.paceSecPerKm, unitSystem)}
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Estimate only, based on the Riegel formula — actual race performance depends on training, pacing, and
            conditions.
          </p>
        </div>
      )}
    </div>
  );
}

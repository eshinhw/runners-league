"use client";

import { useUnitSystem } from "@/components/units/UnitSystemProvider";

export function UnitToggle({ className = "" }: { className?: string }) {
  const { unitSystem, toggleUnitSystem } = useUnitSystem();

  return (
    <button
      type="button"
      onClick={toggleUnitSystem}
      aria-label={`Switch to ${unitSystem === "METRIC" ? "miles" : "kilometers"}`}
      title="Toggle km / mi"
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-medium dark:border-zinc-700 ${className}`}
    >
      <span className={unitSystem === "METRIC" ? "text-orange-500" : "text-zinc-400 dark:text-zinc-600"}>km</span>
      <span className="text-zinc-300 dark:text-zinc-700">/</span>
      <span className={unitSystem === "IMPERIAL" ? "text-orange-500" : "text-zinc-400 dark:text-zinc-600"}>mi</span>
    </button>
  );
}

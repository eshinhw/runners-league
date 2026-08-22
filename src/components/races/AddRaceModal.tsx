"use client";

import { useRef, useState, useTransition } from "react";
import { addRun } from "@/app/(main)/settings/runs/actions";
import { useToast } from "@/components/Toast";
import { MAJOR_INFO, MAJORS_ORDER } from "@/lib/majors";

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 16 }, (_, i) => CURRENT_YEAR - i);

export function AddRaceModal() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const showToast = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addRun(formData);
        formRef.current?.reset();
        setOpen(false);
        showToast("Race added");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white"
      >
        + Add Race
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Race</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <select name="major" required defaultValue="" className={inputCls}>
                  <option value="" disabled>
                    Select a marathon
                  </option>
                  {MAJORS_ORDER.map((m) => (
                    <option key={m} value={m}>
                      {MAJOR_INFO[m].name}
                    </option>
                  ))}
                </select>
                <select name="year" required defaultValue={CURRENT_YEAR} className={inputCls}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500">Bib number (optional)</span>
                <input name="bibNumber" placeholder="e.g. F1234" className={inputCls} />
              </label>

              <div>
                <span className="mb-1 block text-xs font-medium text-zinc-500">Finish Time</span>
                <div className="grid grid-cols-3 gap-2">
                  <input name="hours" type="number" min={0} max={99} placeholder="hh" className={inputCls} />
                  <input name="minutes" type="number" min={0} max={59} placeholder="mm" className={inputCls} />
                  <input name="seconds" type="number" min={0} max={59} placeholder="ss" className={inputCls} />
                </div>
              </div>

              <div>
                <span className="mb-1 block text-xs font-medium text-zinc-500">
                  Stats (optional — leave blank if you don&apos;t have them)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    name="avgHeartRate"
                    type="number"
                    min={0}
                    max={250}
                    placeholder="Avg HR (bpm)"
                    className={inputCls}
                  />
                  <input
                    name="avgCadence"
                    type="number"
                    min={0}
                    max={250}
                    placeholder="Avg cadence (spm)"
                    className={inputCls}
                  />
                  <input
                    name="elevationGain"
                    type="number"
                    min={0}
                    max={5000}
                    placeholder="Elevation gain (m)"
                    className={inputCls}
                  />
                </div>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500">Photos (medal, bib, finish line, etc.)</span>
                <input name="photos" type="file" accept="image/*" multiple className="text-xs" />
              </label>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="mt-1 rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {pending ? "Adding…" : "Add Race"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { updateRun } from "@/app/(main)/settings/runs/actions";
import type { Activity } from "@/generated/prisma/client";
import { MAJOR_INFO, MAJORS_ORDER } from "@/lib/majors";

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 16 }, (_, i) => CURRENT_YEAR - i);

function secToHms(totalSec: number) {
  return {
    hours: Math.floor(totalSec / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

function secPerKmToPace(secPerKm: number | null) {
  if (!secPerKm) return "";
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function EditRaceModal({ run }: { run: Activity }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [keptPhotos, setKeptPhotos] = useState<string[]>(run.photoUrls);

  const { hours, minutes, seconds } = secToHms(run.durationSec);
  const year = run.startedAt.getUTCFullYear();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateRun(run.id, formData);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setKeptPhotos(run.photoUrls);
          setError(null);
          setOpen(true);
        }}
        className="text-xs text-zinc-500 underline"
      >
        Edit
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
              <h2 className="text-lg font-semibold">Edit Race</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <select name="major" required defaultValue={run.major ?? ""} className={inputCls}>
                  <option value="" disabled>
                    Select a marathon
                  </option>
                  {MAJORS_ORDER.map((m) => (
                    <option key={m} value={m}>
                      {MAJOR_INFO[m].name}
                    </option>
                  ))}
                </select>
                <select name="year" required defaultValue={year} className={inputCls}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="mb-1 block text-xs font-medium text-zinc-500">Finish Time</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    name="hours"
                    type="number"
                    min={0}
                    max={99}
                    placeholder="hh"
                    defaultValue={hours}
                    className={inputCls}
                  />
                  <input
                    name="minutes"
                    type="number"
                    min={0}
                    max={59}
                    placeholder="mm"
                    defaultValue={minutes}
                    className={inputCls}
                  />
                  <input
                    name="seconds"
                    type="number"
                    min={0}
                    max={59}
                    placeholder="ss"
                    defaultValue={seconds}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <span className="mb-1 block text-xs font-medium text-zinc-500">
                  Stats (optional — leave blank if you don&apos;t have them)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    name="avgPace"
                    placeholder="Avg pace (m:ss)"
                    defaultValue={secPerKmToPace(run.avgPaceSecPerKm)}
                    className={inputCls}
                  />
                  <input
                    name="avgHeartRate"
                    type="number"
                    min={0}
                    max={250}
                    placeholder="Avg HR (bpm)"
                    defaultValue={run.avgHeartRateBpm ?? ""}
                    className={inputCls}
                  />
                  <input
                    name="avgCadence"
                    type="number"
                    min={0}
                    max={250}
                    placeholder="Avg cadence (spm)"
                    defaultValue={run.avgCadenceSpm ?? ""}
                    className={inputCls}
                  />
                </div>
              </div>

              {run.photoUrls.length > 0 && (
                <div>
                  <span className="mb-1 block text-xs font-medium text-zinc-500">Existing photos</span>
                  <div className="flex flex-wrap gap-2">
                    {run.photoUrls.map((url) => {
                      const isKept = keptPhotos.includes(url);
                      return (
                        <label key={url} className="relative cursor-pointer">
                          <input
                            type="checkbox"
                            name="keepPhoto"
                            value={url}
                            checked={isKept}
                            onChange={(e) =>
                              setKeptPhotos((prev) =>
                                e.target.checked ? [...prev, url] : prev.filter((u) => u !== url),
                              )
                            }
                            className="sr-only"
                          />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt=""
                            className={`h-16 w-16 rounded object-cover ${isKept ? "" : "opacity-30"}`}
                          />
                          {!isKept && (
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-rose-500">
                              Remove
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500">Add more photos</span>
                <input name="photos" type="file" accept="image/*" multiple className="text-xs" />
              </label>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="mt-1 rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

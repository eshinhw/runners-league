"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/(main)/settings/profile/actions";
import type { Gender } from "@/generated/prisma/client";
import { GENDER_LABEL } from "@/lib/rankings";

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-700 dark:text-zinc-200">{value}</span>
    </div>
  );
}

const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function birthDateParts(date: Date | null): { year: string; month: string; day: string } {
  if (!date) return { year: "", month: "", day: "" };
  return {
    year: String(date.getUTCFullYear()),
    month: String(date.getUTCMonth() + 1),
    day: String(date.getUTCDate()),
  };
}

function formatBirthDate(date: Date | null): string {
  if (!date) return "—";
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

type ProfileUser = {
  displayId: string;
  firstName: string;
  lastName: string | null;
  bio: string | null;
  gender: Gender;
  birthDate: Date | null;
  country: string | null;
  city: string | null;
  weightKg: number | null;
  heightCm: number | null;
};

export function ProfileEditor({ user }: { user: ProfileUser }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const birthParts = birthDateParts(user.birthDate);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateProfile(formData);
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  if (!editing) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <Row label="Display ID" value={user.displayId} />
          <Row label="Name" value={fullName || "—"} />
          <Row label="Bio" value={user.bio || "—"} />
          <div className="grid grid-cols-2 gap-3">
            <Row label="Gender" value={GENDER_LABEL[user.gender]} />
            <Row label="Date of Birth" value={formatBirthDate(user.birthDate)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Row label="Country" value={user.country || "—"} />
            <Row label="City" value={user.city || "—"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Row label="Weight" value={user.weightKg ? `${user.weightKg} kg` : "—"} />
            <Row label="Height" value={user.heightCm ? `${user.heightCm} cm` : "—"} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="self-start rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Display ID">
        <input name="displayId" defaultValue={user.displayId} required className={inputCls} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name">
          <input name="firstName" defaultValue={user.firstName} required className={inputCls} />
        </Field>
        <Field label="Last Name">
          <input name="lastName" defaultValue={user.lastName ?? ""} className={inputCls} />
        </Field>
      </div>

      <Field label="Bio">
        <textarea name="bio" defaultValue={user.bio ?? ""} rows={3} className={inputCls} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Gender">
          <select name="gender" defaultValue={user.gender} className={inputCls}>
            {Object.entries(GENDER_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date of Birth">
          <div className="grid grid-cols-3 gap-2">
            <select name="birthYear" defaultValue={birthParts.year} className={inputCls}>
              <option value="">Year</option>
              {BIRTH_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select name="birthMonth" defaultValue={birthParts.month} className={inputCls}>
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select name="birthDay" defaultValue={birthParts.day} className={inputCls}>
              <option value="">Day</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Country">
          <input name="country" defaultValue={user.country ?? "Canada"} placeholder="e.g. Canada" className={inputCls} />
        </Field>
        <Field label="City">
          <input name="city" defaultValue={user.city ?? ""} placeholder="e.g. Toronto" className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Weight (kg)">
          <input
            name="weightKg"
            type="number"
            step="0.1"
            min={20}
            max={300}
            defaultValue={user.weightKg ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Height (cm)">
          <input
            name="heightCm"
            type="number"
            min={100}
            max={250}
            defaultValue={user.heightCm ?? ""}
            className={inputCls}
          />
        </Field>
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

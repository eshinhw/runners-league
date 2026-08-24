"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/(main)/settings/profile/actions";
import { Avatar } from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import type { Gender } from "@/generated/prisma/client";
import { COUNTRIES } from "@/lib/countries";
import { initials } from "@/lib/format";
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
  avatarUrl: string | null;
  image: string | null;
  contactEmail: string | null;
  contactVisible: boolean;
};

export function ProfileEditor({ user }: { user: ProfileUser }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const showToast = useToast();

  const birthParts = birthDateParts(user.birthDate);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const avatarSrc = avatarPreview ?? user.avatarUrl ?? user.image;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setEditing(false);
      setAvatarPreview(null);
      showToast("Profile saved");
    });
  }

  if (!editing) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Avatar
              src={avatarSrc}
              alt=""
              fallbackText={initials(fullName || user.displayId)}
              className="h-16 w-16 shrink-0 text-lg"
            />
            <Row label="Display ID" value={user.displayId} />
          </div>
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
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-zinc-500">Contact Info</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  user.contactVisible
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                {user.contactVisible ? "Public" : "Private"}
              </span>
            </div>
            <span className="text-sm text-zinc-700 dark:text-zinc-200">{user.contactEmail || "—"}</span>
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
      <div className="flex items-center gap-4">
        <Avatar
          src={avatarSrc}
          alt=""
          fallbackText={initials(fullName || user.displayId)}
          className="h-16 w-16 shrink-0 text-lg"
        />
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500">Avatar</span>
          <input name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="text-xs" />
        </label>
      </div>

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
          <select name="country" defaultValue={user.country ?? ""} className={inputCls}>
            <option value="">Select a country</option>
            {user.country && !COUNTRIES.includes(user.country) && (
              <option value={user.country}>{user.country}</option>
            )}
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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

      <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
        <span className="text-xs font-medium text-zinc-500">Contact Info</span>
        <Field label="Email">
          <input
            name="contactEmail"
            type="email"
            defaultValue={user.contactEmail ?? ""}
            placeholder="you@example.com"
            className={inputCls}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input
            name="contactVisible"
            type="checkbox"
            defaultChecked={user.contactVisible}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          Show Contact Info on my public profile
        </label>
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

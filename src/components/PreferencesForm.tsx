"use client";

import { useTransition } from "react";
import { updatePreferences } from "@/app/(main)/settings/preferences/actions";
import { useToast } from "@/components/Toast";
import type { Language, UnitSystem } from "@/generated/prisma/client";

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function PreferencesForm({
  unitSystem,
  language,
}: {
  unitSystem: UnitSystem;
  language: Language;
}) {
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updatePreferences(formData);
      showToast("Preferences saved");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-500">Units</span>
        <select name="unitSystem" defaultValue={unitSystem} className={inputCls}>
          <option value="METRIC">Metric (km, kg)</option>
          <option value="IMPERIAL">Imperial (mi, lb)</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-500">Language</span>
        <select name="language" defaultValue={language} className={inputCls}>
          <option value="EN">English</option>
          <option value="KO">한국어</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

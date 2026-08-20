import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GENDER_LABEL, REGION_LABEL } from "@/lib/rankings";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

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

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-zinc-500">Sign in to edit your profile.</p>
      </main>
    );
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <main className="flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">My Profile</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your personal information.</p>
      </div>

      <form action={updateProfile} className="flex flex-col gap-4">
        <Field label="Name">
          <input name="displayName" defaultValue={user.displayName} required className={inputCls} />
        </Field>
        <Field label="Bio">
          <textarea name="bio" defaultValue={user.bio ?? ""} rows={3} className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input name="city" defaultValue={user.city ?? ""} placeholder="e.g. Toronto" className={inputCls} />
          </Field>
          <Field label="Country">
            <input name="country" defaultValue={user.country ?? "Canada"} placeholder="e.g. Canada" className={inputCls} />
          </Field>
        </div>

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
          <input
            name="birthDate"
            type="date"
            defaultValue={toDateInputValue(user.birthDate)}
            max={new Date().toISOString().slice(0, 10)}
            className={inputCls}
          />
        </Field>

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

        <Field label="Rankings Region Segment">
          <select name="region" defaultValue={user.region ?? ""} className={inputCls}>
            <option value="">Not set</option>
            {Object.entries(REGION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-zinc-400">
          Gender, date of birth, and region are used for Rankings segment filters.
        </p>

        <button type="submit" className="mt-1 rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white">
          Save
        </button>
      </form>
    </main>
  );
}

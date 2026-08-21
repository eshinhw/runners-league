import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePreferences } from "./actions";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export default async function PreferencesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-zinc-500">Sign in to change your settings.</p>
      </main>
    );
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Units, language, and other site-wide preferences.</p>
      </div>

      <form action={updatePreferences} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500">Units</span>
          <select name="unitSystem" defaultValue={user.unitSystem} className={inputCls}>
            <option value="METRIC">Metric (km, kg)</option>
            <option value="IMPERIAL">Imperial (mi, lb)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500">Language</span>
          <select name="language" defaultValue={user.language} className={inputCls}>
            <option value="EN">English</option>
            <option value="KO">한국어</option>
          </select>
        </label>

        <button type="submit" className="mt-1 rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white">
          Save
        </button>
      </form>
    </main>
  );
}

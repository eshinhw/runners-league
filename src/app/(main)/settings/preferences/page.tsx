import Link from "next/link";
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
        <p className="text-sm text-zinc-500">설정을 변경하려면 로그인이 필요합니다.</p>
      </main>
    );
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <main className="flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">단위, 언어 등 웹페이지 전반 설정입니다.</p>
      </div>

      <form action={updatePreferences} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500">단위</span>
          <select name="unitSystem" defaultValue={user.unitSystem} className={inputCls}>
            <option value="METRIC">미터법 (km, kg)</option>
            <option value="IMPERIAL">야드파운드법 (mi, lb)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500">언어</span>
          <select name="language" defaultValue={user.language} className={inputCls}>
            <option value="KO">한국어</option>
            <option value="EN">English</option>
          </select>
        </label>

        <button type="submit" className="mt-1 rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white">
          저장
        </button>
      </form>

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <Link href="/settings/connections" className="text-sm font-medium text-orange-500 underline">
          웨어러블 기기 연동 관리 (Strava, Apple Watch) →
        </Link>
      </div>
    </main>
  );
}

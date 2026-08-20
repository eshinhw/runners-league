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

export default async function SettingsPage() {
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
    <main className="flex max-w-md flex-col gap-5">
      <h1 className="text-xl font-semibold">Settings</h1>
      <form action={updateProfile} className="flex flex-col gap-4">
        <Field label="이름">
          <input name="displayName" defaultValue={user.displayName} required className={inputCls} />
        </Field>
        <Field label="소개">
          <textarea name="bio" defaultValue={user.bio ?? ""} rows={3} className={inputCls} />
        </Field>
        <Field label="지역 (표시용)">
          <input name="location" defaultValue={user.location ?? ""} placeholder="예: Seoul, KR" className={inputCls} />
        </Field>
        <Field label="성별">
          <select name="gender" defaultValue={user.gender} className={inputCls}>
            {Object.entries(GENDER_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="출생연도">
          <input
            name="birthYear"
            type="number"
            defaultValue={user.birthYear ?? ""}
            min={1930}
            max={new Date().getFullYear()}
            className={inputCls}
          />
        </Field>
        <Field label="랭킹 지역 세그먼트">
          <select name="region" defaultValue={user.region ?? ""} className={inputCls}>
            <option value="">선택 안 함</option>
            {Object.entries(REGION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-zinc-400">성별·출생연도·지역은 Rankings 세그먼트 필터에 사용됩니다.</p>
        <button type="submit" className="mt-1 rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white">
          저장
        </button>
      </form>
    </main>
  );
}

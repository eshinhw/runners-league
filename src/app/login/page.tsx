import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { emailSignIn, googleSignIn } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="h-5 w-5 rounded bg-orange-500" />
        Runners League
      </Link>

      <div className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <div>
          <h1 className="text-lg font-semibold">로그인</h1>
          <p className="mt-1 text-sm text-zinc-500">계속하려면 로그인 방법을 선택하세요.</p>
        </div>

        <form action={googleSignIn}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Google로 계속하기
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          또는
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <form action={emailSignIn} className="flex flex-col gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            이메일로 로그인 링크 받기
          </button>
        </form>
      </div>
    </main>
  );
}

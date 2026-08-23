import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GoogleIcon } from "@/components/GoogleIcon";
import { LogoMark } from "@/components/LogoMark";
import { auth } from "@/lib/auth";
import { emailSignIn, googleSignIn } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        <Link href="/" className="flex items-center gap-2 font-display font-medium tracking-tight">
          <LogoMark className="h-6 w-6" />
          Runners League
        </Link>

        <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <div className="text-center">
            <h1 className="text-lg font-semibold">Log In</h1>
            <p className="mt-1 text-sm text-zinc-500">Continue with Google, or sign in with a magic link.</p>
          </div>

          <form action={googleSignIn} className="flex justify-center">
            <button
              type="submit"
              className="flex h-10 w-64 items-center justify-center gap-3 rounded-md border border-[#8e918f] bg-[#131314] px-4 text-sm font-medium tracking-wide text-[#e3e3e3] transition-colors hover:bg-[#1c1c1d]"
            >
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </button>
          </form>

          <div className="flex w-full items-center gap-3 text-xs text-zinc-400">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            or
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <form action={emailSignIn} className="flex w-64 flex-col gap-2">
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="flex h-10 w-full items-center justify-center rounded-md border border-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Continue with Email
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

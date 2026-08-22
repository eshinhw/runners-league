import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GoogleIcon } from "@/components/GoogleIcon";
import { LogoMark } from "@/components/LogoMark";
import { auth } from "@/lib/auth";
import { googleSignIn } from "@/lib/auth-actions";

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
            <p className="mt-1 text-sm text-zinc-500">Continue with your Google account.</p>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}

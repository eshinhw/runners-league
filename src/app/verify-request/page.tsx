import Link from "next/link";
import { Footer } from "@/components/Footer";
import { LogoMark } from "@/components/LogoMark";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x={3} y={5} width={18} height={14} rx={2} />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        <Link href="/" className="flex items-center gap-2 font-display font-medium tracking-tight">
          <LogoMark className="h-6 w-6" />
          Runners League
        </Link>

        <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
            <MailIcon className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold">Check your email</h1>
          <p className="text-sm text-zinc-500">
            We sent you a sign-in link. Click it to continue — you can close this tab.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

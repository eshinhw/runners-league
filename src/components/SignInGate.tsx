import Link from "next/link";

export function SignInGate({ title, description }: { title: string; description: string }) {
  return (
    <main className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="max-w-sm text-sm text-zinc-500">{description}</p>
      <Link
        href="/login"
        className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
      >
        Log In
      </Link>
    </main>
  );
}

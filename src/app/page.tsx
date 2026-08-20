import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Runners League</h1>
      <p className="max-w-md text-zinc-500">
        러너들이 장비, 러닝 데이터, 레이스 정보를 나누고 마일리지로 순위를 겨루는 커뮤니티.
      </p>
      <nav className="flex gap-6 text-sm font-medium">
        <Link href="/gear">Gear Locker</Link>
        <Link href="/races">Race Hub</Link>
        <Link href="/rankings">Rankings</Link>
      </nav>
    </main>
  );
}

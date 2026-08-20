import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";
import { auth } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/gear", label: "Gear" },
  { href: "/races", label: "Races" },
  { href: "/rankings", label: "Rankings" },
];

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-2xl items-center gap-6 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="h-5 w-5 rounded bg-orange-500" />
            Runners League
          </Link>
          <nav className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-zinc-900 dark:hover:text-zinc-50">
                {item.label}
              </Link>
            ))}
          </nav>
          <UserMenu
            user={
              session?.user
                ? { displayName: session.user.name ?? "Runner", image: session.user.image ?? null }
                : null
            }
          />
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>
    </div>
  );
}

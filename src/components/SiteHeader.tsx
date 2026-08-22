import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { MobileNav } from "@/components/MobileNav";
import { UserMenu } from "@/components/UserMenu";
import { auth } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/races", label: "Races" },
  { href: "/training", label: "Training" },
  { href: "/rankings", label: "Rankings" },
  { href: "/gear", label: "Top Gears" },
  { href: "/playlist", label: "Runners Playlist" },
  { href: "/community", label: "Community" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6">
        <Link href="/" className="flex items-center gap-2 font-display font-medium tracking-tight">
          <LogoMark className="h-6 w-6" />
          Runners League
        </Link>
        <nav className="hidden gap-4 text-sm text-zinc-500 md:flex dark:text-zinc-400">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-zinc-900 dark:hover:text-zinc-50">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <MobileNav items={NAV_ITEMS} />
          <UserMenu
            user={
              session?.user
                ? {
                    displayName: session.user.name ?? "Runner",
                    image: session.user.avatarUrl ?? session.user.image ?? null,
                    isAdmin: session.user.isAdmin,
                  }
                : null
            }
          />
        </div>
      </div>
    </header>
  );
}

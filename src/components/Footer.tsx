import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
        <p>© {year} Runners League. All rights reserved.</p>
        <nav className="flex gap-4">
          <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            About
          </Link>
          <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}

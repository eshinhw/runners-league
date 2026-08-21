"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { userSignOut } from "@/lib/auth-actions";
import { initials } from "@/lib/format";

type SessionUser = {
  displayName: string;
  image: string | null;
};

export function UserMenu({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="ml-auto rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Login
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative ml-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.displayName} className="h-full w-full object-cover" />
        ) : (
          initials(user.displayName)
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-10 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        >
          <Link
            href="/settings/profile"
            role="menuitem"
            className="block px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            onClick={() => setOpen(false)}
          >
            My Profile
          </Link>
          <Link
            href="/settings/runs"
            role="menuitem"
            className="block px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            onClick={() => setOpen(false)}
          >
            My Races
          </Link>
          <Link
            href="/settings/gear"
            role="menuitem"
            className="block px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            onClick={() => setOpen(false)}
          >
            My Gears
          </Link>
          <Link
            href="/settings/preferences"
            role="menuitem"
            className="block px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <form action={userSignOut}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-rose-600 hover:bg-zinc-100 dark:text-rose-400 dark:hover:bg-zinc-900"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";

// Shared treatment for every inline "runner name" link to a public profile
// (leaderboard rows, post/comment authors, playlist submitters, etc).
// hover:underline alone is invisible on touch devices since there's no
// hover state — a persistent, muted underline keeps these links quiet in
// meta text while still being discoverable without a mouse.
export function RunnerLink({
  username,
  className = "",
  children,
}: {
  username: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/profile/${username}`}
      className={`underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:decoration-zinc-700 dark:hover:decoration-zinc-400 ${className}`}
    >
      {children}
    </Link>
  );
}

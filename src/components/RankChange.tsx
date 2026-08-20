export function RankChange({ current, previous }: { current: number; previous: number | undefined }) {
  if (previous === undefined) {
    return (
      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
        NEW
      </span>
    );
  }
  const diff = previous - current;
  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        ▲{diff}
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
        ▼{-diff}
      </span>
    );
  }
  return <span className="text-xs text-zinc-400">–</span>;
}

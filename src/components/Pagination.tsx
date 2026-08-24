"use client";

import { useMemo, useState } from "react";

export const PAGE_SIZES = [10, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

// Shared client-side pagination for long tables (Rankings, Top Gears) —
// slices an already-fetched array rather than round-tripping to the
// server, since these lists are small enough (dozens to low hundreds of
// rows) that fetching the page server-side would just add latency for no
// benefit.
export function usePagination<T>(items: T[], initialPageSize: PageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * pageSize;

  const pageItems = useMemo(() => items.slice(start, start + pageSize), [items, start, pageSize]);

  return {
    page: clampedPage,
    pageSize,
    totalPages,
    pageItems,
    total: items.length,
    setPage,
    setPageSize: (size: PageSize) => {
      setPageSize(size);
      setPage(1);
    },
  };
}

export function PaginationControls({
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: PageSize;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}) {
  // Nothing to control if every page size would already fit the whole list
  // on one page — no point showing "Show 10/25/50" buttons that can never
  // change what's visible.
  if (total <= PAGE_SIZES[0]) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-zinc-500">
      <div className="flex items-center gap-1.5">
        Show
        {PAGE_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onPageSizeChange(size)}
            className={`rounded-full border px-2.5 py-1 font-medium ${
              pageSize === size
                ? "border-orange-500 bg-orange-500/10 text-orange-500"
                : "border-zinc-300 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700"
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="tabular-nums">
          {start}–{end} of {total}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            className="rounded border border-zinc-300 px-2 py-1 disabled:opacity-40 dark:border-zinc-700"
          >
            ‹
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            className="rounded border border-zinc-300 px-2 py-1 disabled:opacity-40 dark:border-zinc-700"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

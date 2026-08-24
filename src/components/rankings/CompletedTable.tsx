"use client";

import { PaginationControls, usePagination } from "@/components/Pagination";
import { RunnerLink } from "@/components/RunnerLink";
import { TierBadge } from "@/components/TierBadge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { MAJOR_INFO, MAJORS_ORDER } from "@/lib/majors";
import type { MajorsCompletedRow } from "@/lib/rankings";
import { getTierForCount } from "@/lib/tiers";

export function CompletedTable({ rows }: { rows: MajorsCompletedRow[] }) {
  const { page, pageSize, totalPages, pageItems, total, setPage, setPageSize } = usePagination(rows);

  return (
    <div className="flex flex-col gap-2">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
            <th className="w-10 py-2">#</th>
            <th className="py-2">Tier</th>
            <th className="py-2">Runner</th>
            <th className="py-2">Majors</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.length > 0 ? (
            pageItems.map((row) => {
              const tier = getTierForCount(row.majorsCompleted.length, MAJORS_ORDER.length);
              return (
                <tr key={row.userId} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 font-mono tabular-nums text-zinc-400">{row.rank}</td>
                  <td className="py-2">
                    <TierBadge tier={tier} size={36} />
                  </td>
                  <td className="py-2">
                    <RunnerLink username={row.username} className="inline-flex items-center gap-1.5 font-medium">
                      {row.displayId}
                      {row.allVerified && <VerifiedBadge className="h-3.5 w-3.5" />}
                    </RunnerLink>
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {row.majorsCompleted.map((m) => (
                        <span
                          key={m}
                          title={MAJOR_INFO[m].name}
                          className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                        >
                          <span>{MAJOR_INFO[m].flag}</span>
                          {MAJOR_INFO[m].city}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="py-6 text-center text-sm text-zinc-500">
                No majors logged yet — add one in My Races.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

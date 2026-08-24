"use client";

import { PaginationControls, usePagination } from "@/components/Pagination";
import { RunnerLink } from "@/components/RunnerLink";
import { PaceValue } from "@/components/units/UnitDisplay";
import { UnitToggle } from "@/components/units/UnitToggle";
import { VerificationStatus } from "@/components/VerificationStatus";
import { formatDuration } from "@/lib/format";
import type { MajorEditionRow } from "@/lib/rankings";

const MEDALS = ["🥇", "🥈", "🥉"];

export function EditionTable({ rows, emptyMessage }: { rows: MajorEditionRow[]; emptyMessage: string }) {
  const { page, pageSize, totalPages, pageItems, total, setPage, setPageSize } = usePagination(rows);

  return (
    <div className="flex flex-col gap-3">
      <UnitToggle className="self-start" />
      <div className="flex flex-col gap-2">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
              <th className="w-12 py-2">Rank</th>
              <th className="py-2">Runner</th>
              <th className="py-2 pl-4 text-right">Finish Time</th>
              <th className="py-2 pl-4 text-right">Pace</th>
              <th className="py-2 pl-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length > 0 ? (
              pageItems.map((row) => (
                <tr key={row.userId} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 font-mono tabular-nums">{MEDALS[row.rank - 1] ?? row.rank}</td>
                  <td className="py-2">
                    <RunnerLink username={row.username} className="font-medium">
                      {row.displayId}
                    </RunnerLink>
                  </td>
                  <td className="py-2 pl-4 text-right font-mono tabular-nums">{formatDuration(row.durationSec)}</td>
                  <td className="py-2 pl-4 text-right font-mono tabular-nums text-zinc-500">
                    <PaceValue secPerKm={row.avgPaceSecPerKm} />
                  </td>
                  <td className="py-2 pl-4 text-right">
                    <VerificationStatus verified={row.verified} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-zinc-500">
                  {emptyMessage}
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
    </div>
  );
}

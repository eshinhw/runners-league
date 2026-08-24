"use client";

import type { GearCategory } from "@/generated/prisma/client";
import { ExternalLinkIcon } from "@/components/ActionIcons";
import { PaginationControls, usePagination } from "@/components/Pagination";
import { formatGearName, shopSearchUrl } from "@/lib/format";

export type TopGearRow = { brand: string; model: string | null; count: number };

const MEDALS = ["🥇", "🥈", "🥉"];

export function TopGearsCategoryTable({ items, category }: { items: TopGearRow[]; category: GearCategory }) {
  const { page, pageSize, totalPages, pageItems, total, setPage, setPageSize } = usePagination(items);

  return (
    <div className="flex flex-col gap-2">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
            <th className="w-10 py-2">Rank</th>
            <th className="py-2 pl-4">Item</th>
            <th className="py-2 text-right">Runners</th>
            <th className="w-20 py-2 text-right">Shop</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((item, i) => (
            <tr key={`${item.brand}-${item.model}`} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2 font-mono tabular-nums text-zinc-400">
                {MEDALS[(page - 1) * pageSize + i] ?? (page - 1) * pageSize + i + 1}
              </td>
              <td className="py-2 pl-4 font-medium">{formatGearName(item.brand, item.model)}</td>
              <td className="py-2 text-right font-mono tabular-nums text-zinc-500">{item.count}</td>
              <td className="py-2 text-right">
                <a
                  href={shopSearchUrl(item.brand, item.model, category)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-orange-500 hover:underline"
                >
                  Shop
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                </a>
              </td>
            </tr>
          ))}
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

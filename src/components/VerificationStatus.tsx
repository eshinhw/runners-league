import { VerifiedBadge } from "@/components/VerifiedBadge";

// Explicit Verified/Unverified pill for a single race record — shown as its
// own column wherever Race Records appear so the unverified state is a
// visible fact, not just the absence of a badge.
export function VerificationStatus({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
        <VerifiedBadge className="h-3 w-3" />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] text-zinc-500 dark:border-zinc-700">
      Unverified
    </span>
  );
}

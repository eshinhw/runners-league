"use client";

import { useTransition } from "react";
import { leaveChallenge } from "@/app/(main)/races/actions";

export function ChallengeLeaveButton({ challengeId }: { challengeId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm("Leave this challenge? Rejoining will bring back your full mileage for this period.")) {
          startTransition(() => leaveChallenge(challengeId));
        }
      }}
      className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
    >
      Joined · Leave
    </button>
  );
}

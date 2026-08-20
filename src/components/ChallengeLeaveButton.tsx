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
        if (window.confirm("챌린지에서 나가시겠어요? 다시 참가하면 이번 기간 전체 기록이 다시 반영돼요.")) {
          startTransition(() => leaveChallenge(challengeId));
        }
      }}
      className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
    >
      참가중 · 나가기
    </button>
  );
}

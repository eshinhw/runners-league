"use client";

import { useTransition } from "react";
import { deleteRun } from "@/app/(main)/settings/runs/actions";

export function RunDeleteButton({ activityId }: { activityId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm("이 기록을 삭제할까요? 되돌릴 수 없습니다.")) {
          startTransition(() => deleteRun(activityId));
        }
      }}
      className="text-xs text-rose-500 underline disabled:opacity-50"
    >
      삭제
    </button>
  );
}

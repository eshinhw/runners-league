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
        if (window.confirm("Delete this race? This can't be undone.")) {
          startTransition(() => deleteRun(activityId));
        }
      }}
      className="text-xs text-rose-500 underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}

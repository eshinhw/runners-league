"use client";

import { useTransition } from "react";
import { deleteRun } from "@/app/(main)/settings/runs/actions";
import { DeleteIcon } from "@/components/ActionIcons";

export function RunDeleteButton({ activityId }: { activityId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label="Delete"
      title="Delete"
      onClick={() => {
        if (window.confirm("Delete this race? This can't be undone.")) {
          startTransition(() => deleteRun(activityId));
        }
      }}
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-rose-500 hover:text-rose-600 disabled:opacity-50"
    >
      <DeleteIcon className="h-4 w-4" />
    </button>
  );
}

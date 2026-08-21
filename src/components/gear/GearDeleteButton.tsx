"use client";

import { useTransition } from "react";
import { deleteGear } from "@/app/(main)/settings/actions";

export function GearDeleteButton({ gearId }: { gearId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm("Permanently delete this gear? This can't be undone.")) {
          const formData = new FormData();
          formData.set("gearId", gearId);
          startTransition(() => deleteGear(formData));
        }
      }}
      className="shrink-0 text-xs text-rose-500 underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}

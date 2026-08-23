"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deletePost } from "@/app/(main)/community/actions";
import { DeleteIcon } from "@/components/ActionIcons";

export function PostDeleteButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label="Delete post"
      title="Delete post"
      onClick={() => {
        if (window.confirm("Delete this post? This can't be undone.")) {
          startTransition(async () => {
            await deletePost(postId);
            router.push("/community");
          });
        }
      }}
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-rose-500 hover:text-rose-600 disabled:opacity-50"
    >
      <DeleteIcon className="h-4 w-4" />
    </button>
  );
}

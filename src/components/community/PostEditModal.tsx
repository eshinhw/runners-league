"use client";

import { useState, useTransition } from "react";
import { updatePost } from "@/app/(main)/community/actions";
import { EditIcon } from "@/components/ActionIcons";
import { MarkdownEditor } from "@/components/community/MarkdownEditor";
import { useToast } from "@/components/Toast";
import type { Post } from "@/generated/prisma/client";

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function PostEditModal({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updatePost(post.id, formData);
        setOpen(false);
        showToast("Post updated");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Edit post"
        title="Edit post"
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <EditIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Post</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                name="title"
                placeholder="Title"
                required
                maxLength={140}
                defaultValue={post.title}
                className={inputCls}
              />

              <div className="grid grid-cols-2 gap-2">
                <select name="type" defaultValue={post.type} className={inputCls}>
                  <option value="DISCUSSION">💬 Discussion</option>
                  <option value="ARTICLE">📰 Info</option>
                  <option value="QUESTION">❓ Q&amp;A</option>
                </select>
                <input
                  name="tags"
                  placeholder="Tags, comma separated (optional)"
                  defaultValue={post.tags.join(", ")}
                  className={inputCls}
                />
              </div>

              <MarkdownEditor name="body" placeholder="What's on your mind?" required rows={3} defaultValue={post.body} />

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {pending ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

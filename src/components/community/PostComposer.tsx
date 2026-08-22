"use client";

import { useRef, useState, useTransition } from "react";
import { createPost } from "@/app/(main)/community/actions";
import { MarkdownEditor } from "@/components/community/MarkdownEditor";
import { useToast } from "@/components/Toast";

const inputCls =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function PostComposer() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const showToast = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createPost(formData);
        formRef.current?.reset();
        setOpen(false);
        showToast("Posted");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white"
      >
        Post
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <input name="title" placeholder="Title" required maxLength={140} className={inputCls} />

      <div className="grid grid-cols-2 gap-2">
        <select name="type" defaultValue="DISCUSSION" className={inputCls}>
          <option value="DISCUSSION">💬 Discussion</option>
          <option value="ARTICLE">📰 Info</option>
          <option value="QUESTION">❓ Q&amp;A</option>
        </select>
        <input name="tags" placeholder="Tags, comma separated (optional)" className={inputCls} />
      </div>

      <MarkdownEditor name="body" placeholder="What's on your mind?" required rows={3} />

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Posting…" : "Post"}
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
  );
}

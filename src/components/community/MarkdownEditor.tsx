"use client";

import { useRef } from "react";

function wrapSelection(el: HTMLTextAreaElement, before: string, after: string, placeholder: string) {
  const { selectionStart: start, selectionEnd: end, value } = el;
  const selected = value.slice(start, end) || placeholder;
  el.value = value.slice(0, start) + before + selected + after + value.slice(end);
  const cursorStart = start + before.length;
  el.focus();
  el.setSelectionRange(cursorStart, cursorStart + selected.length);
}

function prefixLines(el: HTMLTextAreaElement, prefix: string) {
  const { selectionStart: start, selectionEnd: end, value } = el;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEndSearch = value.indexOf("\n", end);
  const lineEnd = lineEndSearch === -1 ? value.length : lineEndSearch;
  const block = value.slice(lineStart, lineEnd);
  const prefixed = block
    .split("\n")
    .map((line) => prefix + line)
    .join("\n");
  el.value = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
  el.focus();
  const delta = prefixed.length - block.length;
  el.setSelectionRange(start + prefix.length, Math.max(start + prefix.length, end + delta));
}

type ToolbarAction = { label: string; title: string; className?: string; run: (el: HTMLTextAreaElement) => void };

const ACTIONS: ToolbarAction[] = [
  { label: "B", title: "Bold", className: "font-bold", run: (el) => wrapSelection(el, "**", "**", "bold text") },
  { label: "I", title: "Italic", className: "italic", run: (el) => wrapSelection(el, "*", "*", "italic text") },
  { label: "H1", title: "Heading (large)", className: "text-xs font-semibold", run: (el) => prefixLines(el, "# ") },
  { label: "H2", title: "Heading (medium)", className: "text-xs font-semibold", run: (el) => prefixLines(el, "## ") },
  { label: "❝", title: "Quote", run: (el) => prefixLines(el, "> ") },
  { label: "•", title: "Bullet list", run: (el) => prefixLines(el, "- ") },
  { label: "1.", title: "Numbered list", className: "text-xs", run: (el) => prefixLines(el, "1. ") },
  { label: "🔗", title: "Link", className: "text-xs", run: (el) => wrapSelection(el, "[", "](https://)", "link text") },
  { label: "</>", title: "Code", className: "font-mono text-xs", run: (el) => wrapSelection(el, "`", "`", "code") },
];

export function MarkdownEditor({
  name,
  placeholder,
  required,
  rows = 3,
  defaultValue,
}: {
  name: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  defaultValue?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="overflow-hidden rounded border border-zinc-300 dark:border-zinc-700">
      <div className="flex flex-wrap gap-0.5 border-b border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
        {ACTIONS.map((action) => (
          <button
            key={action.title}
            type="button"
            title={action.title}
            onClick={() => ref.current && action.run(ref.current)}
            className={`flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-sm text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800 ${action.className ?? ""}`}
          >
            {action.label}
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        name={name}
        placeholder={placeholder}
        required={required}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full resize-y bg-white px-3 py-1.5 text-sm outline-none dark:bg-zinc-900"
      />
    </div>
  );
}

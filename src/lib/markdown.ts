import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

marked.use({
  breaks: true,
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${title}"` : "";
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer nofollow">${text}</a>`;
    },
  },
});

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "del",
  "h1", "h2", "h3",
  "ul", "ol", "li",
  "blockquote", "code", "pre",
  "a",
];

// Post/comment bodies are stored as raw Markdown source and rendered to
// sanitized HTML only at display time — keeps the editor round-trippable
// and means a sanitizer bug can't corrupt stored content, only a render.
export function renderMarkdown(raw: string): string {
  const html = marked.parse(raw, { async: false });
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "title", "target", "rel"],
  });
}

// Plain-text summary for list previews — strips markdown syntax rather than
// rendering HTML, so line-clamp truncation stays simple and predictable.
export function stripMarkdown(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

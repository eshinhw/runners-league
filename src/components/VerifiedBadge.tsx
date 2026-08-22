export function VerifiedBadge({ className, title = "Verified" }: { className?: string; title?: string }) {
  return (
    <span title={title} className="inline-flex shrink-0">
      <svg viewBox="0 0 20 20" role="img" aria-label={title} className={className}>
        <circle cx="10" cy="10" r="10" className="fill-blue-500" />
        <path
          d="M6 10.2l2.6 2.6L14.2 7"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

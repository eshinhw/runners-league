type IconProps = { className?: string };

const common = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Shared across any "manage your own thing" list — gear rows, community
// posts, etc. Always rendered at the same className size by callers, which
// is what keeps a row of these lined up instead of drifting at odd heights.
export function EditIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <path d="M14.7 3.3a1.5 1.5 0 0 1 2.1 2.1l-9 9-3.2.9.9-3.2 9.2-8.8Z" />
      <path d="M12.4 5.6l2 2" />
    </svg>
  );
}

export function DeleteIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <path d="M4 6h12M8 6V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V6" />
      <path d="M6 6l.6 9.8a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9L14 6" />
      <line x1={8.5} y1={9} x2={8.5} y2={13.5} />
      <line x1={11.5} y1={9} x2={11.5} y2={13.5} />
    </svg>
  );
}

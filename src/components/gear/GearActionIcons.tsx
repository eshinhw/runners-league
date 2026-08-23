type IconProps = { className?: string };

const common = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Gear-specific action icons. Edit/Delete are shared across other "manage
// your own thing" lists too — see @/components/ActionIcons.
export function FavoriteIcon({ filled, className }: IconProps & { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 2.3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8Z" />
    </svg>
  );
}

export function ArchiveIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <rect x={3} y={4.5} width={14} height={3} rx={0.8} />
      <path d="M4.3 7.5v7.2a1.3 1.3 0 0 0 1.3 1.3h8.8a1.3 1.3 0 0 0 1.3-1.3V7.5" />
      <line x1={8} y1={11} x2={12} y2={11} />
    </svg>
  );
}

export function RestoreIcon({ className }: IconProps) {
  return (
    <svg {...common} className={className}>
      <path d="M4.3 10a5.7 5.7 0 1 0 1.7-4.1" />
      <path d="M4 5.3v3.4h3.4" />
    </svg>
  );
}

// "Pace Bars" mark — three splits, each faster than the last.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g transform="skewX(-12)">
        <rect x="16" y="55" width="15" height="26" rx="4" className="fill-zinc-500" />
        <rect x="40" y="37" width="15" height="44" rx="4" className="fill-zinc-400" />
        <rect x="64" y="16" width="15" height="65" rx="4" className="fill-orange-500" />
      </g>
    </svg>
  );
}

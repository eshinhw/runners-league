import type { Tier } from "@/lib/tiers";

function starburstPoints(cx: number, cy: number, outerR: number, innerR: number, spikes: number): string {
  const step = Math.PI / spikes;
  let rot = -Math.PI / 2;
  const pts: string[] = [];
  for (let i = 0; i < spikes; i++) {
    pts.push(`${(cx + Math.cos(rot) * outerR).toFixed(2)},${(cy + Math.sin(rot) * outerR).toFixed(2)}`);
    rot += step;
    pts.push(`${(cx + Math.cos(rot) * innerR).toFixed(2)},${(cy + Math.sin(rot) * innerR).toFixed(2)}`);
    rot += step;
  }
  return pts.join(" ");
}

export function TierBadge({ tier, size = 36 }: { tier: Tier; size?: number }) {
  const gradId = `tier-grad-${tier.count}`;
  const glowId = `tier-glow-${tier.count}`;
  const plain = tier.rays === 0;
  const glowColor = tier.colors[tier.colors.length - 1];

  return (
    <svg width={size} height={size} viewBox="0 0 60 60" role="img" aria-label={tier.name}>
      <title>{tier.name}</title>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          {tier.colors.map((c, i) => (
            <stop key={c} offset={`${(i / (tier.colors.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        {tier.radiant && (
          <radialGradient id={glowId}>
            <stop offset="0%" stopColor={tier.colors[0]} stopOpacity={0.9} />
            <stop offset="60%" stopColor={glowColor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={glowColor} stopOpacity={0} />
          </radialGradient>
        )}
      </defs>

      {tier.radiant ? (
        <circle cx={30} cy={30} r={30} fill={`url(#${glowId})`} />
      ) : (
        tier.glow && <circle cx={30} cy={30} r={28} fill={`url(#${gradId})`} opacity={0.28} />
      )}

      {!plain && (
        <polygon points={starburstPoints(30, 30, 27, 18, tier.rays)} fill={`url(#${gradId})`} />
      )}

      <circle
        cx={30}
        cy={30}
        r={16}
        fill={plain ? "none" : `url(#${gradId})`}
        stroke={plain ? tier.colors[0] : "rgba(255,255,255,0.5)"}
        strokeWidth={plain ? 2 : 1.5}
      />

      <text
        x={30}
        y={31}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={17}
        fontWeight={700}
        fill={plain ? tier.colors[0] : tier.radiant ? "#78350f" : "#ffffff"}
        stroke={plain ? "none" : tier.radiant ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.35)"}
        strokeWidth={tier.radiant ? 2.5 : 2}
        paintOrder="stroke"
      >
        {tier.count}
      </text>
    </svg>
  );
}

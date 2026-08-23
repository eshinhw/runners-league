import type { MarathonMajor } from "@/generated/prisma/client";
import { MAJOR_INFO } from "@/lib/majors";

// Each card's sky uses that race's own signature accent gradient (already
// defined per major in MAJOR_INFO) so the set reads as one family by
// composition — same layout, same silhouette treatment — while still being
// visually distinct card to card. Ink stays fixed and dark so the landmark
// silhouette stays legible against every accent pair.
const INK = "#1b1626";

const GROUND_Y = 172;

// Deterministic pseudo-random low-rise buildings filling out the rest of the
// skyline around the signature landmark, seeded by the major key so each
// card gets a distinct but stable silhouette.
function fillerBuildings(seed: string): { x: number; width: number; height: number }[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return h / 0xffffffff;
  };

  const buildings: { x: number; width: number; height: number }[] = [];
  let x = -6;
  while (x < 300) {
    const width = 14 + rand() * 20;
    buildings.push({ x, width, height: 16 + rand() * 40 });
    x += width + 3 + rand() * 5;
  }
  return buildings;
}

function Landmark({ major, skyBottom }: { major: MarathonMajor; skyBottom: string }) {
  switch (major) {
    case "TOKYO":
      // Tokyo Tower: a tapering lattice spire.
      return (
        <polygon
          fill={INK}
          points="124,172 136,110 147,70 149,20 150,14 151,20 153,70 164,110 176,172"
        />
      );
    case "BOSTON":
      // Zakim Bridge: twin cable-stayed pylons over the roadway.
      return (
        <g fill={INK}>
          <polygon points="102,172 118,172 112,64 108,64" />
          <polygon points="182,172 198,172 192,54 188,54" />
          <rect x={70} y={150} width={160} height={7} />
          <g stroke={INK} strokeWidth={1.5}>
            <line x1={110} y1={68} x2={80} y2={150} />
            <line x1={110} y1={68} x2={104} y2={150} />
            <line x1={110} y1={68} x2={128} y2={150} />
            <line x1={190} y1={58} x2={150} y2={150} />
            <line x1={190} y1={58} x2={182} y2={150} />
            <line x1={190} y1={58} x2={214} y2={150} />
          </g>
        </g>
      );
    case "LONDON":
      // Elizabeth Tower (Big Ben): tapering clock tower with a pointed spire.
      return (
        <g fill={INK}>
          <polygon points="132,172 132,55 138,50 162,50 168,55 168,172" />
          <polygon points="140,50 160,50 150,16" />
          <circle cx={150} cy={88} r={9} fill="none" stroke={skyBottom} strokeWidth={2} />
        </g>
      );
    case "CAPE_TOWN":
      // Table Mountain: broad flat-topped massif behind the city.
      return <polygon fill={INK} points="60,172 78,96 90,82 210,82 222,96 240,172" />;
    case "SYDNEY":
      // Opera House shells in front of the Harbour Bridge arc.
      return (
        <g>
          <path d="M85,150 Q150,88 260,150" fill="none" stroke={INK} strokeWidth={6} />
          <path d="M118,172 Q126,118 152,106 Q163,138 144,172 Z" fill={INK} />
          <path d="M144,172 Q160,102 196,90 Q209,128 180,172 Z" fill={INK} />
          <path d="M180,172 Q199,110 224,101 Q235,132 212,172 Z" fill={INK} />
        </g>
      );
    case "BERLIN":
      // Brandenburg Gate: colonnade with entablature and attic.
      return (
        <g fill={INK}>
          {[104, 122, 140, 160, 178, 196].map((x) => (
            <rect key={x} x={x} y={90} width={10} height={82} />
          ))}
          <rect x={96} y={80} width={118} height={11} />
          <rect x={122} y={58} width={66} height={23} />
          <rect x={148} y={48} width={14} height={11} />
        </g>
      );
    case "CHICAGO":
      // Willis Tower: stepped setbacks rising to twin antennae.
      return (
        <g fill={INK}>
          <rect x={120} y={100} width={60} height={72} />
          <rect x={128} y={62} width={20} height={38} />
          <rect x={154} y={40} width={18} height={60} />
          <line x1={137} y1={62} x2={137} y2={38} stroke={INK} strokeWidth={2} />
          <line x1={163} y1={40} x2={163} y2={14} stroke={INK} strokeWidth={2} />
        </g>
      );
    case "NEW_YORK":
      // Statue of Liberty: robed figure with a raised torch.
      return (
        <g fill={INK}>
          <polygon points="134,172 138,90 150,80 162,90 166,172" />
          <circle cx={150} cy={68} r={11} />
          {[-1, -0.5, 0, 0.5, 1].map((k) => (
            <polygon
              key={k}
              points={`${150 + k * 6},58 ${150 + k * 6 - 2},50 ${150 + k * 6 + 2},50`}
            />
          ))}
          <rect x={163} y={45} width={5} height={38} transform="rotate(-18 163 45)" />
          <circle cx={177} cy={40} r={6} />
        </g>
      );
  }
}

export function MajorArt({ major, className }: { major: MarathonMajor; className?: string }) {
  const buildings = fillerBuildings(major);
  const gradId = `sky-${major}`;
  const [skyTop, skyBottom] = MAJOR_INFO[major].accent;

  return (
    <svg
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid slice"
      className={`block ${className ?? ""}`}
      role="img"
      aria-label="City skyline illustration"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBottom} />
        </linearGradient>
      </defs>
      <rect width={300} height={200} fill={`url(#${gradId})`} />
      {/* One shared group so overlapping shapes don't double up in opacity —
          the filler buildings and the signature landmark read as a single
          continuous skyline silhouette rather than an icon floating on top. */}
      <g fill={INK} opacity={0.88}>
        {buildings.map((b, i) => (
          <rect key={i} x={b.x} y={GROUND_Y - b.height} width={b.width} height={b.height} />
        ))}
        <Landmark major={major} skyBottom={skyBottom} />
      </g>
    </svg>
  );
}

export type Tier = {
  count: number;
  name: string;
  colors: string[]; // 2+ gradient stops, low tier -> high tier
  rays: number; // 0 = plain ring, higher = more ornate starburst
  glow: boolean;
  radiant?: boolean; // extra-intense multi-layer glow, reserved for the top tier
};

const NUMBER_WORD = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

// Tiers for counts 0..(maxCount - 1). The top tier (count === maxCount, every
// major completed) is always generated dynamically below so its name and
// gradient scale automatically if the Majors series grows past 7.
const BASE_TIERS: Omit<Tier, "count">[] = [
  { name: "Starting Line", colors: ["#71717a", "#52525b"], rays: 0, glow: false }, // gray
  { name: "First Major", colors: ["#c2743a", "#7c4a1e"], rays: 3, glow: false }, // bronze
  { name: "Double Major", colors: ["#a1a7b3", "#6b7280"], rays: 4, glow: false }, // silver
  { name: "Half Star", colors: ["#38bdf8", "#0369a1"], rays: 5, glow: false }, // blue
  { name: "Four Star", colors: ["#c084fc", "#7e22ce"], rays: 6, glow: true }, // purple
  { name: "Five Star", colors: ["#f472b6", "#a21caf"], rays: 7, glow: true }, // magenta
  { name: "Six Star", colors: ["#2dd4bf", "#0f766e"], rays: 8, glow: true }, // platinum teal
];

export function getTiers(maxCount: number): Tier[] {
  const tiers: Tier[] = BASE_TIERS.slice(0, maxCount).map((t, i) => ({ ...t, count: i }));

  tiers.push({
    count: maxCount,
    name: `${NUMBER_WORD[maxCount] ?? maxCount} Star Finisher`,
    colors: ["#fef08a", "#f59e0b", "#b45309"], // gold, extreme glow
    rays: 12,
    glow: true,
    radiant: true,
  });

  return tiers;
}

export function getTierForCount(count: number, maxCount: number): Tier {
  const tiers = getTiers(maxCount);
  return tiers[Math.min(Math.max(count, 0), maxCount)];
}

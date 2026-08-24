// Data pools for the mock-user bootstrap seed (see seed.ts / remove.ts).
// Kept separate from prisma/seed.ts (the destructive local dev reset
// script) — this one is purely additive and safe to run against a real
// database.
import type { Gender, MarathonMajor, Region } from "../../src/generated/prisma/client";

export const FIRST_NAMES = [
  "Alex", "Jamie", "Sam", "Taylor", "Jordan", "Morgan", "Casey", "Riley",
  "Minjun", "Seoyeon", "Jiwoo", "Haeun", "Doyoon", "Yuna", "Jihoon", "Somin",
  "Yuki", "Sora", "Haruto", "Aoi", "Ren", "Hana",
  "Liam", "Olivia", "Noah", "Emma", "Ethan", "Ava", "Mason", "Sophia",
  "Lucas", "Mia", "Oliver", "Isabella", "Elijah", "Charlotte", "James", "Amelia",
  "Priya", "Arjun", "Ananya", "Rohan",
  "Chloe", "Hugo", "Lena", "Finn",
  "Zanele", "Thabo", "Naledi", "Kwame",
  "Isabela", "Mateus", "Camila", "Diego",
  "Fatima", "Omar", "Layla", "Yusuf",
];

export const LAST_NAMES = [
  "Kim", "Park", "Lee", "Choi", "Jung", "Kang", "Yoon", "Han",
  "Tanaka", "Suzuki", "Sato", "Watanabe", "Ito",
  "Smith", "Johnson", "Brown", "Taylor", "Miller", "Davis", "Wilson", "Moore",
  "Nguyen", "Patel", "Singh", "Sharma",
  "Garcia", "Martinez", "Rodriguez", "Silva", "Santos",
  "Dubois", "Bernard", "Moreau",
  "Mokoena", "Dlamini", "Nkosi",
  "Andersson", "Berg", "Nilsson",
  "MacDonald", "Campbell", "Murphy",
  "Rossi", "Ferrari", "Romano",
  "Al-Rashid", "Hassan", "Khalil",
];

export type CityInfo = { city: string; country: string; region?: Region };

export const CITIES: CityInfo[] = [
  { city: "Toronto", country: "Canada", region: "ONTARIO" },
  { city: "Vancouver", country: "Canada", region: "BRITISH_COLUMBIA" },
  { city: "Montreal", country: "Canada", region: "QUEBEC" },
  { city: "Calgary", country: "Canada", region: "ALBERTA" },
  { city: "New York", country: "United States" },
  { city: "Chicago", country: "United States" },
  { city: "Boston", country: "United States" },
  { city: "San Francisco", country: "United States" },
  { city: "Seattle", country: "United States" },
  { city: "Austin", country: "United States" },
  { city: "London", country: "United Kingdom" },
  { city: "Manchester", country: "United Kingdom" },
  { city: "Berlin", country: "Germany" },
  { city: "Munich", country: "Germany" },
  { city: "Paris", country: "France" },
  { city: "Amsterdam", country: "Netherlands" },
  { city: "Dublin", country: "Ireland" },
  { city: "Stockholm", country: "Sweden" },
  { city: "Tokyo", country: "Japan" },
  { city: "Osaka", country: "Japan" },
  { city: "Seoul", country: "South Korea" },
  { city: "Singapore", country: "Singapore" },
  { city: "Sydney", country: "Australia" },
  { city: "Melbourne", country: "Australia" },
  { city: "Auckland", country: "New Zealand" },
  { city: "Cape Town", country: "South Africa" },
  { city: "Mumbai", country: "India" },
  { city: "Sao Paulo", country: "Brazil" },
];

export const BIOS_BY_TONE: Record<"serious" | "casual" | "new", string[]> = {
  serious: [
    "Chasing a Boston Qualifier.",
    "Marathon PB and counting the seconds to the next one.",
    "Coach-guided training block, always in a build phase.",
    "Track Tuesdays, long run Sundays.",
    "Sub-3 or bust.",
  ],
  casual: [
    "Running for the post-run coffee, mostly.",
    "Weekend long runs + weekday easy miles.",
    "Slow is smooth, smooth is far.",
    "Here for the medals and the majors.",
    "Trail on weekends, road during the week.",
  ],
  new: [
    "New to running, hooked on the process.",
    "First marathon in the books — more to come.",
    "Started running last year, haven't stopped since.",
    "Learning to love the long run.",
  ],
};

export type Caliber = "elite" | "competitive" | "strong" | "solid" | "casual" | "beginner";

// [caliber, weight, [minFinishSec, maxFinishSec]]
export const CALIBERS: { key: Caliber; weight: number; range: [number, number] }[] = [
  { key: "elite", weight: 2, range: [8100, 9300] }, // 2:15-2:35
  { key: "competitive", weight: 6, range: [9300, 10800] }, // 2:35-3:00
  { key: "strong", weight: 14, range: [10800, 12600] }, // 3:00-3:30
  { key: "solid", weight: 20, range: [12600, 14400] }, // 3:30-4:00
  { key: "casual", weight: 14, range: [14400, 17100] }, // 4:00-4:45
  { key: "beginner", weight: 6, range: [17100, 21600] }, // 4:45-6:00
];

// Real dates only, restricted to 2025-2026 — every entry here is safely in
// the past relative to the app's "now" (2026-08-24). Sydney only from 2025
// (its first year as a Major); Cape Town omitted entirely (its first
// edition is 2027, hasn't happened yet in the app's own timeline). 2026
// editions of Berlin/Chicago/New York/Sydney are excluded too since those
// fall after today's date.
export const RACE_DATES: { major: MarathonMajor; year: number; date: string }[] = [
  { major: "TOKYO", year: 2025, date: "2025-03-02" },
  { major: "TOKYO", year: 2026, date: "2026-03-01" },
  { major: "BOSTON", year: 2025, date: "2025-04-21" },
  { major: "BOSTON", year: 2026, date: "2026-04-20" },
  { major: "LONDON", year: 2025, date: "2025-04-27" },
  { major: "LONDON", year: 2026, date: "2026-04-26" },
  { major: "BERLIN", year: 2025, date: "2025-09-21" },
  { major: "CHICAGO", year: 2025, date: "2025-10-12" },
  { major: "NEW_YORK", year: 2025, date: "2025-11-02" },
  { major: "SYDNEY", year: 2025, date: "2025-08-31" },
];

export const RACE_LOCATION: Record<MarathonMajor, string> = {
  TOKYO: "Tokyo, Japan",
  BOSTON: "Boston, MA",
  LONDON: "London, UK",
  CAPE_TOWN: "Cape Town, South Africa",
  SYDNEY: "Sydney, Australia",
  BERLIN: "Berlin, Germany",
  CHICAGO: "Chicago, IL",
  NEW_YORK: "New York, NY",
};

// Weighted [brand, weight][] per catalog/brand-only gear category — biased
// toward real-world best-selling / highest-mindshare brands rather than a
// flat random pick across the whole catalog.
export const POPULAR_BRANDS: Record<string, [string, number][]> = {
  SHOE: [["Nike", 5], ["Hoka", 4], ["Adidas", 3], ["Brooks", 3], ["Asics", 3], ["On", 3], ["New Balance", 2], ["Saucony", 2], ["Altra", 1], ["Salomon", 1], ["Puma", 1], ["Mizuno", 1]],
  WATCH: [["Garmin", 6], ["Apple", 4], ["Coros", 2], ["Polar", 1], ["Suunto", 1], ["Samsung", 1]],
  HEADPHONES: [["Shokz", 4], ["Apple", 3], ["Bose", 2], ["Jabra", 1], ["JBL", 1], ["Sony", 1], ["Beats", 1]],
  RUNNING_BELT: [["FlipBelt", 3], ["SPIbelt", 2], ["Nathan", 2], ["UltrAspire", 1], ["Amphipod", 1]],
  HYDRATION_VEST: [["Salomon", 4], ["Nathan", 2], ["Ultimate Direction", 2], ["CamelBak", 2], ["UltrAspire", 1]],
  SUNGLASSES: [["Oakley", 4], ["Goodr", 3], ["District Vision", 1], ["ROKA", 1], ["Smith", 1], ["Tifosi", 1]],
  APPAREL: [["Nike", 4], ["Lululemon", 3], ["Adidas", 2], ["Under Armour", 2], ["Brooks", 1], ["Tracksmith", 1]],
  NUTRITION: [["GU Energy", 3], ["Maurten", 3], ["Skratch Labs", 2], ["Nuun", 2], ["Honey Stinger", 1], ["LMNT", 1]],
  HEADLAMP: [["Petzl", 3], ["Black Diamond", 2], ["NITECORE", 1], ["Ledlenser", 1]],
  GLOVES: [["Nike", 2], ["Under Armour", 2], ["Brooks", 1], ["Salomon", 1]],
};

// Roughly how many mock users own something in each category — shoes and
// watches are near-universal for a runner, sunglasses/headlamp/gloves are
// a minority pickup. [category, probability 0-1]
export const GEAR_OWNERSHIP_ODDS: [string, number][] = [
  ["SHOE", 0.95],
  ["WATCH", 0.6],
  ["HEADPHONES", 0.45],
  ["APPAREL", 0.35],
  ["RUNNING_BELT", 0.2],
  ["HYDRATION_VEST", 0.15],
  ["SUNGLASSES", 0.3],
  ["HEADLAMP", 0.08],
  ["GLOVES", 0.15],
  ["NUTRITION", 0.25],
];

export const GENDER_WEIGHTS: [Gender, number][] = [
  ["MALE", 46],
  ["FEMALE", 46],
  ["NON_BINARY", 4],
  ["UNSPECIFIED", 4],
];

export function weightedPick<T>(items: [T, number][], rand: () => number): T {
  const total = items.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r <= 0) return item;
  }
  return items[items.length - 1][0];
}

export function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

// Small seeded PRNG (mulberry32) so a run is reproducible if re-run with
// the same seed — not a security concern, just convenient for debugging.
export function makeRand(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

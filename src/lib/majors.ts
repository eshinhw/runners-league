import type { MarathonMajor } from "@/generated/prisma/client";

export const MAJORS_ORDER: MarathonMajor[] = ["TOKYO", "BOSTON", "LONDON", "SYDNEY", "BERLIN", "CHICAGO", "NEW_YORK"];

export type RaceDistance = "5K" | "10K" | "Half" | "Full" | "Ultra";

export const MAJOR_INFO: Record<
  MarathonMajor,
  {
    name: string;
    city: string;
    country: string;
    flag: string; // country flag emoji
    websiteUrl: string;
    distances: RaceDistance[];
    description: string;
    accent: [string, string]; // gradient pair used for the city art card
  }
> = {
  TOKYO: {
    name: "Tokyo Marathon",
    city: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    websiteUrl: "https://www.marathon.tokyo/en/",
    distances: ["10K", "Full"],
    description:
      "One of the fastest courses in the series, passing Tokyo Tower, the Imperial Palace, and Asakusa's Senso-ji Temple.",
    accent: ["#6d28d9", "#db2777"],
  },
  BOSTON: {
    name: "Boston Marathon",
    city: "Boston",
    country: "USA",
    flag: "🇺🇸",
    websiteUrl: "https://www.baa.org/races/boston-marathon",
    distances: ["5K", "Full"],
    description:
      "The world's oldest annual marathon, run point-to-point from Hopkinton and finishing past the climb over Heartbreak Hill.",
    accent: ["#1d4ed8", "#f59e0b"],
  },
  LONDON: {
    name: "London Marathon",
    city: "London",
    country: "UK",
    flag: "🇬🇧",
    websiteUrl: "https://www.tcslondonmarathon.com/",
    distances: ["5K", "Full"],
    description:
      "A flat, fast course along the Thames, drawing one of the largest fields in the series and finishing near Buckingham Palace.",
    accent: ["#0f766e", "#0ea5e9"],
  },
  SYDNEY: {
    name: "Sydney Marathon",
    city: "Sydney",
    country: "Australia",
    flag: "🇦🇺",
    websiteUrl: "https://www.tcssydneymarathon.com",
    distances: ["5K", "10K", "Half", "Full"],
    description:
      "The newest race in the series, crossing the Sydney Harbour Bridge with the Opera House as its finish-line backdrop.",
    accent: ["#0891b2", "#f97316"],
  },
  BERLIN: {
    name: "Berlin Marathon",
    city: "Berlin",
    country: "Germany",
    flag: "🇩🇪",
    websiteUrl: "https://www.bmw-berlin-marathon.com/en/",
    distances: ["5K", "Full"],
    description:
      "Famous for record-breaking speed on one of the flattest courses in the world, finishing through the Brandenburg Gate.",
    accent: ["#334155", "#dc2626"],
  },
  CHICAGO: {
    name: "Chicago Marathon",
    city: "Chicago",
    country: "USA",
    flag: "🇺🇸",
    websiteUrl: "https://www.chicagomarathon.com/",
    distances: ["5K", "Full"],
    description:
      "A fast, flat loop through Chicago's neighborhoods, ending in Grant Park along the Lake Michigan shoreline.",
    accent: ["#1e3a8a", "#64748b"],
  },
  NEW_YORK: {
    name: "New York City Marathon",
    city: "New York",
    country: "USA",
    flag: "🇺🇸",
    websiteUrl: "https://www.nyrr.org/tcsnycmarathon",
    distances: ["5K", "Full"],
    description:
      "The world's largest marathon, crossing all five boroughs of New York City and finishing in Central Park.",
    accent: ["#4c1d95", "#f97316"],
  },
};

export type MajorEdition = {
  major: MarathonMajor;
  year: number;
  date: string; // ISO date, e.g. "2026-03-01"
  confirmed: boolean; // false = estimated/TBA date
};

// World Marathon Majors calendar. 2026 dates are all officially confirmed.
// 2027 dates are mixed — Tokyo is confirmed (20th anniversary edition); the
// rest are estimates based on each race's historical scheduling pattern, or
// TBA where no announcement exists yet.
export const MAJORS_CALENDAR: MajorEdition[] = [
  { major: "TOKYO", year: 2026, date: "2026-03-01", confirmed: true },
  { major: "BOSTON", year: 2026, date: "2026-04-20", confirmed: true },
  { major: "LONDON", year: 2026, date: "2026-04-26", confirmed: true },
  { major: "SYDNEY", year: 2026, date: "2026-08-30", confirmed: true },
  { major: "BERLIN", year: 2026, date: "2026-09-27", confirmed: true },
  { major: "CHICAGO", year: 2026, date: "2026-10-11", confirmed: true },
  { major: "NEW_YORK", year: 2026, date: "2026-11-01", confirmed: true },

  { major: "TOKYO", year: 2027, date: "2027-03-07", confirmed: true },
  { major: "BOSTON", year: 2027, date: "2027-04-19", confirmed: false },
  { major: "LONDON", year: 2027, date: "2027-04-25", confirmed: false },
  { major: "SYDNEY", year: 2027, date: "2027-08-29", confirmed: false },
  { major: "BERLIN", year: 2027, date: "2027-09-26", confirmed: false },
  { major: "CHICAGO", year: 2027, date: "2027-10-10", confirmed: false },
  { major: "NEW_YORK", year: 2027, date: "2027-10-31", confirmed: false },
];

export function getMajorsForYear(year: number): MajorEdition[] {
  return MAJORS_CALENDAR.filter((e) => e.year === year).sort((a, b) => a.date.localeCompare(b.date));
}

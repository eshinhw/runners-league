import type { MarathonMajor } from "@/generated/prisma/client";

export const MAJORS_ORDER: MarathonMajor[] = [
  "TOKYO",
  "BOSTON",
  "LONDON",
  "SYDNEY",
  "BERLIN",
  "CHICAGO",
  "NEW_YORK",
];

export const MAJOR_INFO: Record<MarathonMajor, { name: string; city: string; country: string }> = {
  TOKYO: { name: "Tokyo Marathon", city: "Tokyo", country: "Japan" },
  BOSTON: { name: "Boston Marathon", city: "Boston", country: "USA" },
  LONDON: { name: "London Marathon", city: "London", country: "UK" },
  SYDNEY: { name: "Sydney Marathon", city: "Sydney", country: "Australia" },
  BERLIN: { name: "Berlin Marathon", city: "Berlin", country: "Germany" },
  CHICAGO: { name: "Chicago Marathon", city: "Chicago", country: "USA" },
  NEW_YORK: { name: "New York City Marathon", city: "New York", country: "USA" },
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
  return MAJORS_CALENDAR
    .filter((e) => e.year === year)
    .sort((a, b) => a.date.localeCompare(b.date));
}

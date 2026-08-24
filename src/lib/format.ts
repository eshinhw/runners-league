import type { UnitSystem } from "@/generated/prisma/client";

export const KM_PER_MI = 1.609344;

// Oxford-comma join, e.g. [2026, 2027] -> "2026 and 2027",
// ["Tokyo", "Boston", "London"] -> "Tokyo, Boston, and London".
export function joinWithAnd(items: (string | number)[]): string {
  const strs = items.map(String);
  if (strs.length <= 1) return strs.join("");
  if (strs.length === 2) return `${strs[0]} and ${strs[1]}`;
  return `${strs.slice(0, -1).join(", ")}, and ${strs[strs.length - 1]}`;
}

export function distanceUnitLabel(unitSystem: UnitSystem = "METRIC"): string {
  return unitSystem === "IMPERIAL" ? "mi" : "km";
}

export function formatDistance(meters: number, unitSystem: UnitSystem = "METRIC"): string {
  const km = meters / 1000;
  if (unitSystem === "IMPERIAL") return `${(km / KM_PER_MI).toFixed(1)} mi`;
  return `${km.toFixed(1)} km`;
}

// Same as formatDistance, but for values already in km (e.g. training plan targets).
export function formatDistanceKm(km: number, unitSystem: UnitSystem = "METRIC"): string {
  const value = unitSystem === "IMPERIAL" ? km / KM_PER_MI : km;
  return `${value.toFixed(1)} ${distanceUnitLabel(unitSystem)}`;
}

export function formatPace(secPerKm: number | null, unitSystem: UnitSystem = "METRIC"): string {
  if (!secPerKm) return "–";
  const secPerUnit = unitSystem === "IMPERIAL" ? secPerKm * KM_PER_MI : secPerKm;
  const min = Math.floor(secPerUnit / 60);
  const sec = Math.round(secPerUnit % 60);
  return `${min}'${sec.toString().padStart(2, "0")}"/${distanceUnitLabel(unitSystem)}`;
}

export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  return `${diffDay}d ago`;
}

export function calculateAge(birthDate: Date | null, at = new Date()): number | null {
  if (!birthDate) return null;
  let age = at.getFullYear() - birthDate.getFullYear();
  const hadBirthdayThisYear =
    at.getMonth() > birthDate.getMonth() ||
    (at.getMonth() === birthDate.getMonth() && at.getDate() >= birthDate.getDate());
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}

export function formatGearName(brand: string, model: string | null): string {
  return model ? `${brand} ${model}` : brand;
}

// No per-product URL exists (or would stay maintainable across hundreds of
// catalog entries), so "order this" resolves to a Google Shopping search for
// the brand/model instead of one exact SKU page.
export function shopSearchUrl(brand: string, model: string | null): string {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(formatGearName(brand, model))}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

"use client";

import { distanceUnitLabel, formatDistance, formatDistanceKm, formatPace } from "@/lib/format";
import { useUnitSystem } from "@/components/units/UnitSystemProvider";

export function DistanceValue({ meters }: { meters: number }) {
  const { unitSystem } = useUnitSystem();
  return <>{formatDistance(meters, unitSystem)}</>;
}

// Same as DistanceValue, but for values already in km (e.g. training plan targets).
export function DistanceKmValue({ km }: { km: number }) {
  const { unitSystem } = useUnitSystem();
  return <>{formatDistanceKm(km, unitSystem)}</>;
}

export function PaceValue({ secPerKm }: { secPerKm: number | null }) {
  const { unitSystem } = useUnitSystem();
  return <>{formatPace(secPerKm, unitSystem)}</>;
}

export function DistanceUnitLabel() {
  const { unitSystem } = useUnitSystem();
  return <>{distanceUnitLabel(unitSystem)}</>;
}

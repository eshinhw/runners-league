import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ImportedWorkout = {
  externalId: string;
  distanceM: number;
  durationSec: number;
  startedAt: string;
  deviceVerified: boolean;
  deviceName?: string;
};

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Sync target for the iOS HealthKit companion app. Authenticated by a
// per-user DeviceToken (Bearer), issued from Settings > Connections.
//
// The app is the only thing with access to HKWorkout.device, so it decides
// deviceVerified itself (non-nil device = actually recorded by Apple Watch,
// nil = typed in through the Health app). We just refuse to import anything
// that isn't marked verified — same trust boundary as the Strava sync, which
// leans on Strava's own `manual` flag instead.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const deviceToken = await prisma.deviceToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!deviceToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await prisma.deviceToken.update({
    where: { id: deviceToken.id },
    data: { lastUsedAt: new Date() },
  });

  const body = await request.json().catch(() => null);
  const workouts: ImportedWorkout[] = Array.isArray(body?.workouts) ? body.workouts : [];

  let imported = 0;
  let skipped = 0;

  for (const w of workouts) {
    if (!w?.deviceVerified || !w?.externalId || !w?.distanceM || !w?.durationSec || !w?.startedAt) {
      skipped++;
      continue;
    }

    const distanceM = Math.round(Number(w.distanceM));
    const durationSec = Math.round(Number(w.durationSec));

    await prisma.activity.upsert({
      where: { source_externalId: { source: "APPLE_HEALTH", externalId: String(w.externalId) } },
      create: {
        userId: deviceToken.userId,
        source: "APPLE_HEALTH",
        externalId: String(w.externalId),
        distanceM,
        durationSec,
        avgPaceSecPerKm: distanceM > 0 ? Math.round(durationSec / (distanceM / 1000)) : null,
        startedAt: new Date(w.startedAt),
      },
      update: {
        distanceM,
        durationSec,
        avgPaceSecPerKm: distanceM > 0 ? Math.round(durationSec / (distanceM / 1000)) : null,
      },
    });
    imported++;
  }

  return NextResponse.json({ imported, skipped });
}

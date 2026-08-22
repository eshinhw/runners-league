"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import type { MarathonMajor } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { MAJOR_INFO, MAJORS_CALENDAR, MAJORS_ORDER } from "@/lib/majors";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "runs");
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MARATHON_DISTANCE_M = 42195;

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You need to be signed in.");
  return session.user.id;
}

async function savePhotos(files: File[]): Promise<string[]> {
  const valid = files.filter((f) => f.size > 0 && ALLOWED_TYPES.has(f.type));
  if (valid.length === 0) return [];

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const urls: string[] = [];
  for (const file of valid) {
    const ext = file.type.split("/")[1] ?? "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
    urls.push(`/uploads/runs/${filename}`);
  }
  return urls;
}

// Parses "M:SS" or "MM:SS" pace input into seconds per km. Returns null for
// blank/invalid input so callers can fall back to the distance/duration-based
// average instead.
function parsePaceToSecPerKm(raw: string): number | null {
  const match = raw.trim().match(/^(\d+):([0-5]?\d)$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export async function addRun(formData: FormData) {
  const userId = await requireUserId();

  const major = String(formData.get("major") ?? "") as MarathonMajor;
  if (!MAJORS_ORDER.includes(major)) throw new Error("Please select a major marathon.");

  const yearRaw = String(formData.get("year") ?? "");
  const year = Number(yearRaw);
  if (!year) throw new Error("Please select a year.");

  const calendarEntry = MAJORS_CALENDAR.find((e) => e.major === major && e.year === year);
  const startedAt = calendarEntry ? new Date(`${calendarEntry.date}T09:00:00Z`) : new Date(Date.UTC(year, 0, 1, 9));
  const title = `${year} ${MAJOR_INFO[major].name}`;

  const hours = Number(formData.get("hours") ?? 0);
  const minutes = Number(formData.get("minutes") ?? 0);
  const seconds = Number(formData.get("seconds") ?? 0);
  const durationSec = hours * 3600 + minutes * 60 + seconds;
  if (durationSec <= 0) throw new Error("Please enter a finish time.");

  const paceRaw = String(formData.get("avgPace") ?? "");
  const avgPaceSecPerKm = parsePaceToSecPerKm(paceRaw) ?? Math.round(durationSec / (MARATHON_DISTANCE_M / 1000));

  const heartRateRaw = String(formData.get("avgHeartRate") ?? "");
  const cadenceRaw = String(formData.get("avgCadence") ?? "");
  const bibNumber = String(formData.get("bibNumber") ?? "").trim();

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File);
  const photoUrls = await savePhotos(photos);

  await prisma.activity.create({
    data: {
      userId,
      source: "MANUAL",
      title,
      runType: "RACE",
      major,
      distanceM: MARATHON_DISTANCE_M,
      durationSec,
      avgPaceSecPerKm,
      avgHeartRateBpm: heartRateRaw ? Number(heartRateRaw) : null,
      avgCadenceSpm: cadenceRaw ? Number(cadenceRaw) : null,
      bibNumber: bibNumber || null,
      startedAt,
      location: `${MAJOR_INFO[major].city}, ${MAJOR_INFO[major].country}`,
      photoUrls,
    },
  });

  revalidatePath("/settings/runs");
}

export async function updateRun(activityId: string, formData: FormData) {
  const userId = await requireUserId();

  const existing = await prisma.activity.findFirst({
    where: { id: activityId, userId, source: "MANUAL" },
  });
  if (!existing) throw new Error("Race not found.");

  const major = String(formData.get("major") ?? "") as MarathonMajor;
  if (!MAJORS_ORDER.includes(major)) throw new Error("Please select a major marathon.");

  const yearRaw = String(formData.get("year") ?? "");
  const year = Number(yearRaw);
  if (!year) throw new Error("Please select a year.");

  const calendarEntry = MAJORS_CALENDAR.find((e) => e.major === major && e.year === year);
  const startedAt = calendarEntry ? new Date(`${calendarEntry.date}T09:00:00Z`) : new Date(Date.UTC(year, 0, 1, 9));
  const title = `${year} ${MAJOR_INFO[major].name}`;

  const hours = Number(formData.get("hours") ?? 0);
  const minutes = Number(formData.get("minutes") ?? 0);
  const seconds = Number(formData.get("seconds") ?? 0);
  const durationSec = hours * 3600 + minutes * 60 + seconds;
  if (durationSec <= 0) throw new Error("Please enter a finish time.");

  const paceRaw = String(formData.get("avgPace") ?? "");
  const avgPaceSecPerKm = parsePaceToSecPerKm(paceRaw) ?? Math.round(durationSec / (MARATHON_DISTANCE_M / 1000));

  const heartRateRaw = String(formData.get("avgHeartRate") ?? "");
  const cadenceRaw = String(formData.get("avgCadence") ?? "");
  const bibNumber = String(formData.get("bibNumber") ?? "").trim();

  const keptPhotoUrls = formData.getAll("keepPhoto").map((v) => String(v));
  const newPhotos = formData.getAll("photos").filter((f): f is File => f instanceof File);
  const newPhotoUrls = await savePhotos(newPhotos);
  const photoUrls = [...keptPhotoUrls, ...newPhotoUrls];

  await prisma.activity.update({
    where: { id: activityId },
    data: {
      title,
      major,
      durationSec,
      avgPaceSecPerKm,
      avgHeartRateBpm: heartRateRaw ? Number(heartRateRaw) : null,
      avgCadenceSpm: cadenceRaw ? Number(cadenceRaw) : null,
      bibNumber: bibNumber || null,
      startedAt,
      location: `${MAJOR_INFO[major].city}, ${MAJOR_INFO[major].country}`,
      photoUrls,
    },
  });

  revalidatePath("/settings/runs");
}

export async function deleteRun(activityId: string) {
  const userId = await requireUserId();

  await prisma.activity.deleteMany({
    where: { id: activityId, userId, source: "MANUAL" },
  });

  revalidatePath("/settings/runs");
}

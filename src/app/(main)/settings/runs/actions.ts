"use server";

import { revalidatePath } from "next/cache";
import type { MarathonMajor, RaceDistance } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { sendVerificationRequestEmail } from "@/lib/email";
import { MAJOR_INFO, MAJORS_CALENDAR, MAJORS_ORDER, RACE_DISTANCE_METERS } from "@/lib/majors";
import { prisma } from "@/lib/prisma";
import { uploadImages } from "@/lib/storage";

// Fires the admin verification-request email when a runner filled in a bib
// number and their official name. Never lets an email hiccup fail the race
// save — verification is a nice-to-have on top of the write, not a
// precondition for it.
async function notifyVerificationRequest(input: {
  major: MarathonMajor;
  year: number;
  bibNumber: string;
  officialFirstName: string;
  officialLastName: string;
}) {
  if (!input.bibNumber || !input.officialFirstName || !input.officialLastName) return;
  try {
    await sendVerificationRequestEmail({
      majorName: MAJOR_INFO[input.major].name,
      year: input.year,
      bibNumber: input.bibNumber,
      officialName: `${input.officialFirstName} ${input.officialLastName}`,
    });
  } catch (err) {
    console.error("Failed to send verification request email:", err);
  }
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You need to be signed in.");
  return session.user.id;
}

function parseDistance(major: MarathonMajor, formData: FormData): RaceDistance {
  const distance = String(formData.get("distance") ?? "") as RaceDistance;
  if (!MAJOR_INFO[major].distances.includes(distance)) {
    throw new Error("Please select a distance offered by that marathon.");
  }
  return distance;
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

  const distance = parseDistance(major, formData);
  const distanceM = RACE_DISTANCE_METERS[distance];

  const hours = Number(formData.get("hours") ?? 0);
  const minutes = Number(formData.get("minutes") ?? 0);
  const seconds = Number(formData.get("seconds") ?? 0);
  const durationSec = hours * 3600 + minutes * 60 + seconds;
  if (durationSec <= 0) throw new Error("Please enter a finish time.");

  const avgPaceSecPerKm = Math.round(durationSec / (distanceM / 1000));

  const heartRateRaw = String(formData.get("avgHeartRate") ?? "");
  const cadenceRaw = String(formData.get("avgCadence") ?? "");
  const elevationGainRaw = String(formData.get("elevationGain") ?? "");
  const bibNumber = String(formData.get("bibNumber") ?? "").trim();
  const officialFirstName = String(formData.get("officialFirstName") ?? "").trim();
  const officialLastName = String(formData.get("officialLastName") ?? "").trim();

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File);
  const photoUrls = await uploadImages(photos, "runs");

  await prisma.activity.create({
    data: {
      userId,
      title,
      runType: "RACE",
      major,
      raceDistance: distance,
      distanceM,
      durationSec,
      avgPaceSecPerKm,
      avgHeartRateBpm: heartRateRaw ? Number(heartRateRaw) : null,
      avgCadenceSpm: cadenceRaw ? Number(cadenceRaw) : null,
      elevationGainM: elevationGainRaw ? Number(elevationGainRaw) : null,
      bibNumber: bibNumber || null,
      officialFirstName: officialFirstName || null,
      officialLastName: officialLastName || null,
      startedAt,
      location: `${MAJOR_INFO[major].city}, ${MAJOR_INFO[major].country}`,
      photoUrls,
    },
  });

  await notifyVerificationRequest({ major, year, bibNumber, officialFirstName, officialLastName });

  revalidatePath("/settings/runs");
}

export async function updateRun(activityId: string, formData: FormData) {
  const userId = await requireUserId();

  const existing = await prisma.activity.findFirst({
    where: { id: activityId, userId },
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

  const distance = parseDistance(major, formData);
  const distanceM = RACE_DISTANCE_METERS[distance];

  const hours = Number(formData.get("hours") ?? 0);
  const minutes = Number(formData.get("minutes") ?? 0);
  const seconds = Number(formData.get("seconds") ?? 0);
  const durationSec = hours * 3600 + minutes * 60 + seconds;
  if (durationSec <= 0) throw new Error("Please enter a finish time.");

  const avgPaceSecPerKm = Math.round(durationSec / (distanceM / 1000));

  const heartRateRaw = String(formData.get("avgHeartRate") ?? "");
  const cadenceRaw = String(formData.get("avgCadence") ?? "");
  const elevationGainRaw = String(formData.get("elevationGain") ?? "");
  const bibNumber = String(formData.get("bibNumber") ?? "").trim();
  const officialFirstName = String(formData.get("officialFirstName") ?? "").trim();
  const officialLastName = String(formData.get("officialLastName") ?? "").trim();

  const keptPhotoUrls = formData.getAll("keepPhoto").map((v) => String(v));
  const newPhotos = formData.getAll("photos").filter((f): f is File => f instanceof File);
  const newPhotoUrls = await uploadImages(newPhotos, "runs");
  const photoUrls = [...keptPhotoUrls, ...newPhotoUrls];

  await prisma.activity.update({
    where: { id: activityId },
    data: {
      title,
      major,
      raceDistance: distance,
      distanceM,
      durationSec,
      avgPaceSecPerKm,
      avgHeartRateBpm: heartRateRaw ? Number(heartRateRaw) : null,
      avgCadenceSpm: cadenceRaw ? Number(cadenceRaw) : null,
      elevationGainM: elevationGainRaw ? Number(elevationGainRaw) : null,
      bibNumber: bibNumber || null,
      officialFirstName: officialFirstName || null,
      officialLastName: officialLastName || null,
      startedAt,
      location: `${MAJOR_INFO[major].city}, ${MAJOR_INFO[major].country}`,
      photoUrls,
    },
  });

  await notifyVerificationRequest({ major, year, bibNumber, officialFirstName, officialLastName });

  revalidatePath("/settings/runs");
}

export async function deleteRun(activityId: string) {
  const userId = await requireUserId();

  await prisma.activity.deleteMany({
    where: { id: activityId, userId },
  });

  revalidatePath("/settings/runs");
}

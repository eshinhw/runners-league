"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import type { RunType } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "runs");
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("로그인이 필요합니다.");
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

export async function addRun(formData: FormData) {
  const userId = await requireUserId();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("레이스/러닝 이름을 입력해주세요.");

  const runType = String(formData.get("runType") ?? "RACE") as RunType;
  const location = String(formData.get("location") ?? "").trim();
  const startedAtRaw = String(formData.get("startedAt") ?? "");
  if (!startedAtRaw) throw new Error("날짜를 입력해주세요.");

  const distancePreset = String(formData.get("distancePreset") ?? "");
  const distanceKmRaw = String(formData.get("distanceKm") ?? "");
  const distanceM =
    distancePreset === "custom" ? Math.round(Number(distanceKmRaw || 0) * 1000) : Number(distancePreset || 0);
  if (!distanceM || distanceM <= 0) throw new Error("거리를 입력해주세요.");

  const hours = Number(formData.get("hours") ?? 0);
  const minutes = Number(formData.get("minutes") ?? 0);
  const seconds = Number(formData.get("seconds") ?? 0);
  const durationSec = hours * 3600 + minutes * 60 + seconds;
  if (durationSec <= 0) throw new Error("완주 시간을 입력해주세요.");

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File);
  const photoUrls = await savePhotos(photos);

  await prisma.activity.create({
    data: {
      userId,
      source: "MANUAL",
      title,
      runType,
      distanceM,
      durationSec,
      avgPaceSecPerKm: Math.round(durationSec / (distanceM / 1000)),
      startedAt: new Date(startedAtRaw),
      location: location || null,
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

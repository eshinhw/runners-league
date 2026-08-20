"use server";

import { revalidatePath } from "next/cache";
import type { Gender, GearCategory, Region } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("로그인이 필요합니다.");
  return session.user.id;
}

export async function updateProfile(formData: FormData) {
  const userId = await requireUserId();

  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) throw new Error("이름을 입력해주세요.");

  const bio = String(formData.get("bio") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const gender = String(formData.get("gender") ?? "UNSPECIFIED") as Gender;
  const regionRaw = String(formData.get("region") ?? "");
  const birthYearRaw = String(formData.get("birthYear") ?? "");

  await prisma.user.update({
    where: { id: userId },
    data: {
      displayName,
      bio: bio || null,
      location: location || null,
      gender,
      region: (regionRaw || null) as Region | null,
      birthYear: birthYearRaw ? Number(birthYearRaw) : null,
    },
  });

  revalidatePath("/settings");
}

export async function addGear(formData: FormData) {
  const userId = await requireUserId();

  const category = String(formData.get("category") ?? "") as GearCategory;
  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (!brand || !model) throw new Error("브랜드와 모델명을 입력해주세요.");

  await prisma.gear.create({
    data: { ownerId: userId, category, brand, model, nickname: nickname || null },
  });

  revalidatePath("/settings/gear");
}

export async function retireGear(formData: FormData) {
  const userId = await requireUserId();
  const gearId = String(formData.get("gearId") ?? "");

  await prisma.gear.updateMany({
    where: { id: gearId, ownerId: userId },
    data: { retiredAt: new Date() },
  });

  revalidatePath("/settings/gear");
}

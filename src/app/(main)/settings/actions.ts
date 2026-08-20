"use server";

import { revalidatePath } from "next/cache";
import type { GearCategory } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You need to be signed in.");
  return session.user.id;
}

export async function addGear(formData: FormData) {
  const userId = await requireUserId();

  const category = String(formData.get("category") ?? "") as GearCategory;
  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (!brand || !model) throw new Error("Please enter a brand and model.");

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

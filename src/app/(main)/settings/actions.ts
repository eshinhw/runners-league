"use server";

import { revalidatePath } from "next/cache";
import type { GearCategory } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/storage";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You need to be signed in.");
  return session.user.id;
}

export async function addGear(formData: FormData) {
  const userId = await requireUserId();

  const category = String(formData.get("category") ?? "") as GearCategory;
  const subcategory = String(formData.get("subcategory") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (!brand) throw new Error("Please enter a brand.");

  const purchaseYearRaw = String(formData.get("purchaseYear") ?? "");
  const purchaseDate = purchaseYearRaw ? new Date(Date.UTC(Number(purchaseYearRaw), 0, 1)) : null;

  const photo = formData.get("photo");
  const photoUrl = await uploadImage(photo instanceof File ? photo : null, "gear");

  await prisma.gear.create({
    data: {
      ownerId: userId,
      category,
      subcategory: subcategory || null,
      brand,
      model: model || null,
      nickname: nickname || null,
      purchaseDate,
      photoUrl,
    },
  });

  revalidatePath("/settings/gear");
}

export async function updateGear(gearId: string, formData: FormData) {
  const userId = await requireUserId();

  const existing = await prisma.gear.findFirst({ where: { id: gearId, ownerId: userId } });
  if (!existing) throw new Error("Gear not found.");

  const category = String(formData.get("category") ?? "") as GearCategory;
  const subcategory = String(formData.get("subcategory") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  if (!brand) throw new Error("Please enter a brand.");

  const purchaseYearRaw = String(formData.get("purchaseYear") ?? "");
  const purchaseDate = purchaseYearRaw ? new Date(Date.UTC(Number(purchaseYearRaw), 0, 1)) : null;

  await prisma.gear.update({
    where: { id: gearId },
    data: { category, subcategory: subcategory || null, brand, model: model || null, purchaseDate },
  });

  revalidatePath("/settings/gear");
}

// Toggles a gear item as the favorite within its category. Setting a new
// favorite clears any previous one for that owner+category — at most one
// favorite per category, enforced here rather than as a DB constraint since
// "no favorite yet" is also valid.
export async function toggleFavoriteGear(formData: FormData) {
  const userId = await requireUserId();
  const gearId = String(formData.get("gearId") ?? "");

  const gear = await prisma.gear.findFirst({ where: { id: gearId, ownerId: userId } });
  if (!gear) throw new Error("Gear not found.");

  if (gear.isFavorite) {
    await prisma.gear.update({ where: { id: gearId }, data: { isFavorite: false } });
  } else {
    await prisma.$transaction([
      prisma.gear.updateMany({
        where: { ownerId: userId, category: gear.category, isFavorite: true },
        data: { isFavorite: false },
      }),
      prisma.gear.update({ where: { id: gearId }, data: { isFavorite: true } }),
    ]);
  }

  revalidatePath("/settings/gear");
  revalidatePath("/gear");
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

export async function unretireGear(formData: FormData) {
  const userId = await requireUserId();
  const gearId = String(formData.get("gearId") ?? "");

  await prisma.gear.updateMany({
    where: { id: gearId, ownerId: userId },
    data: { retiredAt: null },
  });

  revalidatePath("/settings/gear");
}

// Only retired gear can be permanently deleted — active gear should be
// retired first, keeping deletion a deliberate two-step action.
export async function deleteGear(formData: FormData) {
  const userId = await requireUserId();
  const gearId = String(formData.get("gearId") ?? "");

  await prisma.gear.deleteMany({
    where: { id: gearId, ownerId: userId, retiredAt: { not: null } },
  });

  revalidatePath("/settings/gear");
}

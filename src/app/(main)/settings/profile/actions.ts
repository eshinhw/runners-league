"use server";

import { revalidatePath } from "next/cache";
import type { Gender } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/storage";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You need to be signed in.");

  const displayId = String(formData.get("displayId") ?? "").trim();
  if (!displayId) throw new Error("Please enter a Display ID.");

  const firstName = String(formData.get("firstName") ?? "").trim();
  if (!firstName) throw new Error("Please enter your first name.");

  const lastName = String(formData.get("lastName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const gender = String(formData.get("gender") ?? "UNSPECIFIED") as Gender;

  const birthYearRaw = String(formData.get("birthYear") ?? "");
  const birthMonthRaw = String(formData.get("birthMonth") ?? "");
  const birthDayRaw = String(formData.get("birthDay") ?? "");
  const birthDate =
    birthYearRaw && birthMonthRaw && birthDayRaw
      ? new Date(Date.UTC(Number(birthYearRaw), Number(birthMonthRaw) - 1, Number(birthDayRaw)))
      : null;

  const weightKgRaw = String(formData.get("weightKg") ?? "");
  const heightCmRaw = String(formData.get("heightCm") ?? "");

  const avatarFile = formData.get("avatar");
  const avatarUrl = await uploadImage(avatarFile instanceof File ? avatarFile : null, "avatars");

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayId,
        firstName,
        lastName: lastName || null,
        bio: bio || null,
        country: country || null,
        city: city || null,
        gender,
        birthDate,
        weightKg: weightKgRaw ? Number(weightKgRaw) : null,
        heightCm: heightCmRaw ? Number(heightCmRaw) : null,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      throw new Error("That Display ID is already taken.");
    }
    throw err;
  }

  revalidatePath("/settings/profile");
  if (session.user.username) revalidatePath(`/profile/${session.user.username}`);
}

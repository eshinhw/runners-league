"use server";

import { revalidatePath } from "next/cache";
import type { Gender, Region } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You need to be signed in.");

  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) throw new Error("Please enter your name.");

  const bio = String(formData.get("bio") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const gender = String(formData.get("gender") ?? "UNSPECIFIED") as Gender;
  const regionRaw = String(formData.get("region") ?? "");
  const birthDateRaw = String(formData.get("birthDate") ?? "");
  const weightKgRaw = String(formData.get("weightKg") ?? "");
  const heightCmRaw = String(formData.get("heightCm") ?? "");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName,
      bio: bio || null,
      city: city || null,
      country: country || null,
      gender,
      region: (regionRaw || null) as Region | null,
      birthDate: birthDateRaw ? new Date(birthDateRaw) : null,
      weightKg: weightKgRaw ? Number(weightKgRaw) : null,
      heightCm: heightCmRaw ? Number(heightCmRaw) : null,
    },
  });

  revalidatePath("/settings/profile");
}

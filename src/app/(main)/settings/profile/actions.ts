"use server";

import { revalidatePath } from "next/cache";
import type { Gender } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const birthDateRaw = String(formData.get("birthDate") ?? "");
  const weightKgRaw = String(formData.get("weightKg") ?? "");
  const heightCmRaw = String(formData.get("heightCm") ?? "");

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
        birthDate: birthDateRaw ? new Date(birthDateRaw) : null,
        weightKg: weightKgRaw ? Number(weightKgRaw) : null,
        heightCm: heightCmRaw ? Number(heightCmRaw) : null,
      },
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      throw new Error("That Display ID is already taken.");
    }
    throw err;
  }

  revalidatePath("/settings/profile");
}

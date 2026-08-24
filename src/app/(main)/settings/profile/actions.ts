"use server";

import { revalidatePath } from "next/cache";
import type { Gender } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/storage";

// Server Actions redact thrown error messages in production — the client
// only ever sees a generic digest-only error, no matter where inside the
// action the throw happens. Expected, user-facing failures (validation,
// upload problems, taken display IDs) are returned as values instead so
// the caller can show the real message; only genuinely unexpected errors
// (e.g. a DB outage) are left to throw and hit the nearest error boundary.
export async function updateProfile(formData: FormData): Promise<{ error: string } | { success: true }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You need to be signed in." };

  const displayId = String(formData.get("displayId") ?? "").trim();
  if (!displayId) return { error: "Please enter a Display ID." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  if (!firstName) return { error: "Please enter your first name." };

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

  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  if (contactEmail && !/^\S+@\S+\.\S+$/.test(contactEmail)) {
    return { error: "Please enter a valid contact email." };
  }
  const contactVisible = formData.get("contactVisible") === "on";

  const avatarFile = formData.get("avatar");
  let avatarUrl: string | null;
  try {
    avatarUrl = await uploadImage(avatarFile instanceof File ? avatarFile : null, "avatars");
  } catch (err) {
    console.error("Avatar upload failed:", err);
    return { error: err instanceof Error ? err.message : "Couldn't upload that image. Please try again." };
  }

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
        contactEmail: contactEmail || null,
        contactVisible,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { error: "That Display ID is already taken." };
    }
    throw err;
  }

  revalidatePath("/settings/profile");
  if (session.user.username) revalidatePath(`/profile/${session.user.username}`);
  return { success: true };
}

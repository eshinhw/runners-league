"use server";

import { revalidatePath } from "next/cache";
import type { Language, UnitSystem } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updatePreferences(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You need to be signed in.");

  const unitSystem = String(formData.get("unitSystem") ?? "METRIC") as UnitSystem;
  const language = String(formData.get("language") ?? "EN") as Language;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { unitSystem, language },
  });

  revalidatePath("/settings/preferences");
}

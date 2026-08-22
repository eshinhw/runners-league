"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Admins only.");
}

async function revalidateForActivity(activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { user: { select: { username: true } } },
  });

  revalidatePath("/admin/verify");
  revalidatePath("/rankings");
  revalidatePath("/settings/runs");
  if (activity) revalidatePath(`/profile/${activity.user.username}`);
}

export async function verifyRace(formData: FormData) {
  await requireAdmin();
  const activityId = String(formData.get("activityId") ?? "");

  await prisma.activity.update({
    where: { id: activityId },
    data: { verifiedAt: new Date() },
  });

  await revalidateForActivity(activityId);
}

export async function unverifyRace(formData: FormData) {
  await requireAdmin();
  const activityId = String(formData.get("activityId") ?? "");

  await prisma.activity.update({
    where: { id: activityId },
    data: { verifiedAt: null },
  });

  await revalidateForActivity(activityId);
}

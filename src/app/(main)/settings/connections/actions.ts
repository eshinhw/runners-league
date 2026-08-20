"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncStravaActivitiesForUser } from "@/lib/strava";

export async function syncStravaNow() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("로그인이 필요합니다.");

  await syncStravaActivitiesForUser(session.user.id);

  revalidatePath("/settings/connections");
  revalidatePath("/rankings");
}

export async function createDeviceToken(label: string): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("로그인이 필요합니다.");

  const token = `rl_${crypto.randomBytes(24).toString("hex")}`;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.deviceToken.create({
    data: { userId: session.user.id, tokenHash, label },
  });

  revalidatePath("/settings/connections");
  return token;
}

export async function revokeDeviceToken(tokenId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("로그인이 필요합니다.");

  await prisma.deviceToken.deleteMany({
    where: { id: tokenId, userId: session.user.id },
  });

  revalidatePath("/settings/connections");
}

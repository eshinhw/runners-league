"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("로그인이 필요합니다.");
  return session.user.id;
}

export async function joinChallenge(challengeId: string) {
  const userId = await requireUserId();

  await prisma.challengeParticipant.upsert({
    where: { challengeId_userId: { challengeId, userId } },
    create: { challengeId, userId },
    update: {},
  });

  revalidatePath("/races");
}

export async function leaveChallenge(challengeId: string) {
  const userId = await requireUserId();

  await prisma.challengeParticipant.deleteMany({
    where: { challengeId, userId },
  });

  revalidatePath("/races");
}

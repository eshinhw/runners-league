"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { syncStravaActivitiesForUser } from "@/lib/strava";

export async function syncStravaNow() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("로그인이 필요합니다.");

  await syncStravaActivitiesForUser(session.user.id);

  revalidatePath("/settings/connections");
  revalidatePath("/rankings");
}

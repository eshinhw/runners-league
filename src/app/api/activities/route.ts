import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const activities = await prisma.activity.findMany({
    orderBy: { startedAt: "desc" },
    take: 20,
    include: { user: true, gearLinks: { include: { gear: true } } },
  });
  return NextResponse.json(activities);
}

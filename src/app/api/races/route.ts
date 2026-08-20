import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const races = await prisma.race.findMany({
    orderBy: { eventDate: "asc" },
  });
  return NextResponse.json(races);
}

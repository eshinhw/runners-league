import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const gear = await prisma.gear.findMany({
    include: { reviews: true },
  });
  return NextResponse.json(gear);
}

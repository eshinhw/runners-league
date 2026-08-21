import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlaylist } from "@/lib/playlist";

export async function GET() {
  const session = await auth();
  const tracks = await getPlaylist(session?.user?.id);
  return NextResponse.json(tracks);
}

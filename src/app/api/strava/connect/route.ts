import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stravaAuthorizeUrl } from "@/lib/strava";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const redirectUri = new URL("/api/strava/callback", request.url).toString();
  const authorizeUrl = stravaAuthorizeUrl(redirectUri, session.user.id);
  return NextResponse.redirect(authorizeUrl);
}

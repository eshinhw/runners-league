import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exchangeStravaCode } from "@/lib/strava";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");

  if (error || !code || state !== session.user.id) {
    return NextResponse.redirect(new URL("/settings/connections?error=1", request.url));
  }

  const token = await exchangeStravaCode(code);
  const providerUid = String(token.athlete?.id ?? "");

  await prisma.externalAccount.upsert({
    where: { provider_providerUid: { provider: "STRAVA", providerUid } },
    create: {
      userId: session.user.id,
      provider: "STRAVA",
      providerUid,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: new Date(token.expires_at * 1000),
    },
    update: {
      userId: session.user.id,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: new Date(token.expires_at * 1000),
    },
  });

  return NextResponse.redirect(new URL("/settings/connections?connected=1", request.url));
}

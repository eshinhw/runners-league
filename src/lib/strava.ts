import { prisma } from "@/lib/prisma";

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

export function stravaAuthorizeUrl(redirectUri: string, state: string): string {
  const url = new URL("https://www.strava.com/oauth/authorize");
  url.searchParams.set("client_id", STRAVA_CLIENT_ID ?? "");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", "read,activity:read_all");
  url.searchParams.set("state", state);
  return url.toString();
}

type StravaTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: { id: number };
};

async function stravaTokenRequest(body: Record<string, string>): Promise<StravaTokenResponse> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      ...body,
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava token request failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export function exchangeStravaCode(code: string): Promise<StravaTokenResponse> {
  return stravaTokenRequest({ code, grant_type: "authorization_code" });
}

function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
  return stravaTokenRequest({ refresh_token: refreshToken, grant_type: "refresh_token" });
}

// Returns a valid access token for the user's connected Strava account,
// refreshing it first if it's expired. Returns null if not connected.
export async function getValidStravaAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.externalAccount.findFirst({
    where: { userId, provider: "STRAVA" },
  });
  if (!account) return null;

  if (account.expiresAt.getTime() > Date.now() + 60_000) {
    return account.accessToken;
  }

  const refreshed = await refreshStravaToken(account.refreshToken);
  await prisma.externalAccount.update({
    where: { id: account.id },
    data: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      expiresAt: new Date(refreshed.expires_at * 1000),
    },
  });
  return refreshed.access_token;
}

type StravaActivity = {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  distance: number; // meters
  moving_time: number; // seconds
  start_date: string; // ISO
  manual: boolean;
};

async function fetchStravaActivities(accessToken: string, perPage = 30): Promise<StravaActivity[]> {
  const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Strava activities fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function syncStravaActivitiesForUser(
  userId: string,
): Promise<{ imported: number; skippedManual: number; skippedNonRun: number }> {
  const accessToken = await getValidStravaAccessToken(userId);
  if (!accessToken) throw new Error("Strava 계정이 연결되어 있지 않습니다.");

  const activities = await fetchStravaActivities(accessToken);
  let imported = 0;
  let skippedManual = 0;
  let skippedNonRun = 0;

  for (const a of activities) {
    if (a.sport_type !== "Run" && a.type !== "Run") {
      skippedNonRun++;
      continue;
    }
    // The one signal Strava gives us for "was this actually recorded by a
    // device, or did the athlete just type in a distance": trust it.
    if (a.manual) {
      skippedManual++;
      continue;
    }

    const distanceM = Math.round(a.distance);
    const durationSec = Math.round(a.moving_time);

    await prisma.activity.upsert({
      where: { source_externalId: { source: "STRAVA", externalId: String(a.id) } },
      create: {
        userId,
        source: "STRAVA",
        externalId: String(a.id),
        title: a.name,
        distanceM,
        durationSec,
        avgPaceSecPerKm: distanceM > 0 ? Math.round(durationSec / (distanceM / 1000)) : null,
        startedAt: new Date(a.start_date),
      },
      update: {
        title: a.name,
        distanceM,
        durationSec,
        avgPaceSecPerKm: distanceM > 0 ? Math.round(durationSec / (distanceM / 1000)) : null,
      },
    });
    imported++;
  }

  return { imported, skippedManual, skippedNonRun };
}

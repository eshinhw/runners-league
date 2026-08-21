export type ItunesTrack = {
  itunesTrackId: string;
  title: string;
  artist: string;
  albumArtUrl: string | null;
  previewUrl: string | null;
  itunesUrl: string;
};

type ItunesApiResult = {
  wrapperType?: string;
  trackId?: number;
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
};

function mapResult(r: ItunesApiResult): ItunesTrack | null {
  if (!r.trackId || !r.trackName || !r.artistName || !r.trackViewUrl) return null;
  return {
    itunesTrackId: String(r.trackId),
    title: r.trackName,
    artist: r.artistName,
    albumArtUrl: r.artworkUrl100 ? r.artworkUrl100.replace("100x100", "300x300") : null,
    previewUrl: r.previewUrl ?? null,
    itunesUrl: r.trackViewUrl,
  };
}

// Verification strategy: the iTunes Search API is free and needs no API key
// or developer signup, so it works immediately. A submitted song is only
// ever accepted if it round-trips through a server-side /lookup call against
// this same catalog — see submitTrack in playlist/actions.ts.
export async function searchItunesTracks(query: string): Promise<ItunesTrack[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://itunes.apple.com/search?media=music&entity=song&limit=8&term=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Song search failed. Please try again.");

  const data = (await res.json()) as { results?: ItunesApiResult[] };
  return (data.results ?? []).map(mapResult).filter((t): t is ItunesTrack => t !== null);
}

export async function lookupItunesTrack(itunesTrackId: string): Promise<ItunesTrack | null> {
  const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(itunesTrackId)}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as { results?: ItunesApiResult[] };
  const result = (data.results ?? []).find((r) => r.wrapperType === "track");
  return result ? mapResult(result) : null;
}

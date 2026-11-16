import { makeTrackId, Track } from '../models/track';

/** Champs d'un élément renvoyé par GET /me/tracks que l'on utilise. */
export interface SpotifySavedTrack {
  added_at: string;
  track: {
    id: string | null;
    name: string;
    duration_ms: number;
    is_local?: boolean;
    artists: { name: string }[];
    album: { images: { url: string; width: number | null }[] };
    external_urls: { spotify?: string };
  } | null;
}

/** Convertit un titre liké Spotify en Track. Renvoie null pour les fichiers locaux / titres retirés. */
export function spotifyToTrack(item: SpotifySavedTrack): Track | null {
  const t = item.track;
  if (!t || !t.id || t.is_local) return null;

  // Spotify trie les pochettes de la plus grande à la plus petite : on prend ~300px si dispo
  const images = t.album.images;
  const artwork = images.find((img) => (img.width ?? 0) <= 300) ?? images[0];

  return {
    id: makeTrackId('spotify', t.id),
    source: 'spotify',
    sourceId: t.id,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    durationMs: t.duration_ms,
    artworkUrl: artwork?.url,
    url: t.external_urls.spotify ?? `https://open.spotify.com/track/${t.id}`,
    addedAt: item.added_at,
  };
}

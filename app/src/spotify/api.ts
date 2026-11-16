import { Track } from '../models/track';
import { getValidAccessToken } from './auth';
import { SpotifySavedTrack, spotifyToTrack } from './toTrack';

const API = 'https://api.spotify.com/v1';

export class SpotifyNotConnectedError extends Error {
  constructor() {
    super('Non connecté à Spotify');
  }
}

/** Appel GET à l'API Spotify, avec gestion du jeton et de la limite de requêtes (429). */
async function spotifyGet<T>(url: string, attempt = 1): Promise<T> {
  const token = await getValidAccessToken();
  if (!token) throw new SpotifyNotConnectedError();

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  if (res.status === 429 && attempt <= 3) {
    // Trop de requêtes : Spotify indique combien de secondes attendre
    const retryAfter = Number(res.headers.get('Retry-After') ?? '2');
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return spotifyGet<T>(url, attempt + 1);
  }
  if (res.status === 401) throw new SpotifyNotConnectedError();
  if (!res.ok) throw new Error(`Erreur Spotify ${res.status}`);
  return res.json() as Promise<T>;
}

interface Page<T> {
  items: T[];
  next: string | null;
  total: number;
}

/**
 * Récupère TOUS les titres likés (Spotify les renvoie par pages de 50 max).
 * onProgress permet d'afficher "120/450 titres…" pendant le chargement.
 */
export async function fetchLikedTracks(
  onProgress?: (loaded: number, total: number) => void,
): Promise<Track[]> {
  const tracks: Track[] = [];
  let url: string | null = `${API}/me/tracks?limit=50`;

  while (url) {
    const page: Page<SpotifySavedTrack> = await spotifyGet<Page<SpotifySavedTrack>>(url);
    for (const item of page.items) {
      const track = spotifyToTrack(item);
      if (track) tracks.push(track);
    }
    onProgress?.(tracks.length, page.total);
    url = page.next;
  }
  return tracks;
}

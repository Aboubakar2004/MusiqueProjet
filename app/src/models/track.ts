/**
 * Format commun d'un titre, quelle que soit sa provenance.
 * Les modules Spotify et SoundCloud convertissent leurs données vers ce format,
 * le reste de l'app (fusion, affichage, lecteur) ne manipule que des Track.
 */

export type TrackSource = 'spotify' | 'soundcloud';

export interface Track {
  /** Identifiant unique dans l'app, préfixé par la source : "spotify:abc", "soundcloud:123" */
  id: string;
  source: TrackSource;
  /** Identifiant d'origine chez Spotify / SoundCloud (sert à lancer la lecture) */
  sourceId: string;
  title: string;
  artist: string;
  durationMs: number;
  /** Pochette ; absente pour certains titres SoundCloud */
  artworkUrl?: string;
  /** Lien vers le titre sur la plateforme d'origine */
  url: string;
  /** Date d'ajout (like Spotify / ajout à la playlist SoundCloud), au format ISO, si connue */
  addedAt?: string;
}

/** Construit l'id unique d'un Track à partir de sa source et de son id d'origine. */
export function makeTrackId(source: TrackSource, sourceId: string | number): string {
  return `${source}:${sourceId}`;
}

/** 157000 → "2:37" ; 3725000 → "1:02:05" */
export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
    : `${minutes}:${seconds}`;
}

/** Durée totale lisible d'une liste : "42 min" ; "3 h 05 min" */
export function formatTotalDuration(tracks: Track[]): string {
  const totalMinutes = Math.round(tracks.reduce((sum, t) => sum + t.durationMs, 0) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} h ${String(minutes).padStart(2, '0')} min` : `${minutes} min`;
}

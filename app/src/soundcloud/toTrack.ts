import { makeTrackId, Track } from '../models/track';

/** Champs d'un "sound" renvoyé par getSounds() du widget SoundCloud que l'on utilise. */
export interface SoundCloudSound {
  id: number;
  title?: string;
  duration?: number;
  artwork_url?: string | null;
  permalink_url?: string;
  user?: { username?: string; avatar_url?: string | null };
}

/** Convertit un sound SoundCloud en Track. Renvoie null si ses infos ne sont pas chargées. */
export function soundCloudToTrack(sound: SoundCloudSound): Track | null {
  if (!sound.title || !sound.permalink_url) return null;
  return {
    id: makeTrackId('soundcloud', sound.id),
    source: 'soundcloud',
    sourceId: String(sound.id),
    title: sound.title,
    artist: sound.user?.username ?? 'Artiste inconnu',
    durationMs: sound.duration ?? 0,
    // Pochettes en meilleure qualité : SoundCloud renvoie "-large" (100px) par défaut
    artworkUrl:
      (sound.artwork_url ?? sound.user?.avatar_url ?? undefined)?.replace('-large', '-t500x500') ??
      undefined,
    url: sound.permalink_url,
  };
}

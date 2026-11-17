import { Track } from '../models/track';

/**
 * Fusion des deux sources en une seule playlist :
 *  - tri par date d'ajout, plus récents en premier
 *  - suppression des doublons (même titre présent sur Spotify ET SoundCloud)
 * Fonctions "pures" (pas d'accès réseau ni stockage) : faciles à tester.
 */

/** Date de première apparition de chaque titre SoundCloud : { "soundcloud:123": "2026-11-17T…" } */
export type FirstSeenMap = Record<string, string>;

/** Écart de durée toléré entre deux versions d'un même titre (les remix ont des durées différentes) */
const DURATION_TOLERANCE_MS = 10_000;

/** "Beyoncé" → "beyonce" ; supprime accents, ponctuation, espaces multiples */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Retire "(feat. X)", "[Official Video]", "ft. X"… qui varient d'une plateforme à l'autre */
function cleanTitle(title: string): string {
  return title
    .replace(/[([][^)\]]*[)\]]/g, ' ') // tout ce qui est entre () ou []
    .replace(/\s(feat|ft)\.?\s.*$/i, ' ') // "Titre ft. Untel"
    .trim();
}

/**
 * Clé de comparaison "artiste principal | titre".
 * Sur SoundCloud, le compte qui publie n'est pas toujours l'artiste :
 * le titre est alors souvent au format "Artiste - Titre", on s'en sert.
 */
export function matchKey(track: Track): string {
  let artist = track.artist;
  let title = track.title;

  const dash = title.indexOf(' - ');
  if (track.source === 'soundcloud' && dash > 0) {
    artist = title.slice(0, dash);
    title = title.slice(dash + 3);
  }

  // Artiste principal seulement : "Juice WRLD, Young Thug" / "Juice WRLD Ft. Young Thug" → "Juice WRLD"
  const mainArtist = artist.split(/,|\s(?:feat|ft)\.?\s|\sx\s|\s&\s/i)[0];
  return `${normalize(mainArtist)}|${normalize(cleanTitle(title))}`;
}

function isSameSong(a: Track, b: Track): boolean {
  if (matchKey(a) !== matchKey(b)) return false;
  // Si une durée manque, on se fie à la clé seule
  if (!a.durationMs || !b.durationMs) return true;
  return Math.abs(a.durationMs - b.durationMs) <= DURATION_TOLERANCE_MS;
}

/**
 * Met à jour les dates de première apparition des titres SoundCloud
 * (SoundCloud ne fournit pas la date d'ajout à une playlist).
 * Les nouveaux titres reçoivent "maintenant" ; plus ils sont loin dans la playlist,
 * plus ils sont considérés récents (SoundCloud ajoute les titres en fin de playlist).
 */
export function updateFirstSeen(
  soundcloud: Track[],
  previous: FirstSeenMap,
  now: number = Date.now(),
): FirstSeenMap {
  const next: FirstSeenMap = {};
  soundcloud.forEach((track, index) => {
    next[track.id] = previous[track.id] ?? new Date(now + index).toISOString();
  });
  return next; // les titres retirés de la playlist disparaissent aussi de la map
}

/** Construit la playlist commune. En cas de doublon, la version Spotify est gardée. */
export function mergeTracks(
  spotify: Track[],
  soundcloud: Track[],
  firstSeen: FirstSeenMap,
): Track[] {
  const datedSoundCloud = soundcloud.map((t) => ({ ...t, addedAt: t.addedAt ?? firstSeen[t.id] }));
  const uniqueSoundCloud = datedSoundCloud.filter(
    (sc) => !spotify.some((sp) => isSameSong(sp, sc)),
  );

  const time = (t: Track) => (t.addedAt ? Date.parse(t.addedAt) : 0);
  return [...spotify, ...uniqueSoundCloud].sort((a, b) => time(b) - time(a));
}

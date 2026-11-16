/**
 * Réglages de l'app.
 * Le widget SoundCloud ne sait pas lire les likes : on lit une playlist publique
 * à laquelle on ajoute les titres à synchroniser (cf. prototype/).
 */
export const SOUNDCLOUD_PLAYLIST_URL =
  'https://soundcloud.com/aboubakar-bamba-271656202/sets/synchroniser';

/**
 * Client ID de l'app créée sur developer.spotify.com.
 * Il n'est pas secret (flux PKCE, aucun "client secret" dans l'app),
 * mais on le lit depuis app/.env.local pour ne pas le figer dans le code.
 */
export const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';

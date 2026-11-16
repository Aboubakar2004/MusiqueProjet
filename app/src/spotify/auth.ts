import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';

import { SPOTIFY_CLIENT_ID } from '../config';

/** Adresses OAuth de Spotify (flux "Authorization Code + PKCE", sans secret côté app). */
export const spotifyDiscovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

/** Seule permission demandée : lire les titres likés. */
export const SPOTIFY_SCOPES = ['user-library-read'];

/** Adresse de retour après connexion. À recopier à l'identique dans le dashboard Spotify. */
export const spotifyRedirectUri = AuthSession.makeRedirectUri({ path: 'spotify-auth' });

const STORAGE_KEY = 'spotify-tokens';

interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  /** Date d'expiration, en millisecondes */
  expiresAt: number;
}

/** Enregistre les jetons dans le trousseau sécurisé de l'iPhone (Keychain). */
export async function saveTokens(token: AuthSession.TokenResponse, previousRefreshToken?: string) {
  const stored: StoredTokens = {
    accessToken: token.accessToken,
    // Spotify ne renvoie pas toujours un nouveau refresh token : on garde l'ancien
    refreshToken: token.refreshToken ?? previousRefreshToken,
    expiresAt: (token.issuedAt + (token.expiresIn ?? 3600)) * 1000,
  };
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(stored));
}

async function loadTokens(): Promise<StoredTokens | null> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as StoredTokens) : null;
}

export async function logout() {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

/**
 * Renvoie un jeton d'accès valide, en le renouvelant si besoin (il expire au bout d'1 h).
 * Renvoie null si l'utilisateur n'est pas connecté ou si le renouvellement échoue.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await loadTokens();
  if (!tokens) return null;

  // Marge d'1 minute pour ne pas utiliser un jeton qui expire pendant la requête
  if (Date.now() < tokens.expiresAt - 60_000) return tokens.accessToken;
  if (!tokens.refreshToken) return null;

  try {
    const refreshed = await AuthSession.refreshAsync(
      { clientId: SPOTIFY_CLIENT_ID, refreshToken: tokens.refreshToken },
      spotifyDiscovery,
    );
    await saveTokens(refreshed, tokens.refreshToken);
    return refreshed.accessToken;
  } catch {
    // Refresh token révoqué ou expiré : il faudra se reconnecter
    await logout();
    return null;
  }
}

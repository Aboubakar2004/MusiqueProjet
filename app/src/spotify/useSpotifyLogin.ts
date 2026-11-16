import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';

import { SPOTIFY_CLIENT_ID } from '../config';
import { saveTokens, SPOTIFY_SCOPES, spotifyDiscovery, spotifyRedirectUri } from './auth';

// Ferme proprement la fenêtre de connexion quand Spotify redirige vers l'app
WebBrowser.maybeCompleteAuthSession();

/**
 * Gère le bouton "Se connecter à Spotify" :
 * ouvre la page de connexion Spotify, récupère le code, l'échange contre des jetons.
 */
export function useSpotifyLogin(onLoggedIn: () => void) {
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      redirectUri: spotifyRedirectUri,
      usePKCE: true,
    },
    spotifyDiscovery,
  );

  useEffect(() => {
    if (!response) return;
    if (response.type === 'error') {
      setError(response.params.error_description ?? response.params.error ?? 'Connexion refusée');
      return;
    }
    if (response.type !== 'success' || !request?.codeVerifier) return;

    // Échange du code contre les jetons ; le code_verifier prouve que c'est bien nous (PKCE)
    AuthSession.exchangeCodeAsync(
      {
        clientId: SPOTIFY_CLIENT_ID,
        code: response.params.code,
        redirectUri: spotifyRedirectUri,
        extraParams: { code_verifier: request.codeVerifier },
      },
      spotifyDiscovery,
    )
      .then((token) => saveTokens(token))
      .then(() => {
        setError(null);
        onLoggedIn();
      })
      .catch((e: Error) => setError(e.message));
    // onLoggedIn volontairement absent : on ne traite chaque réponse qu'une fois
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, request]);

  return {
    /** false tant que la requête de connexion n'est pas prête */
    ready: !!request && !!SPOTIFY_CLIENT_ID,
    login: () => {
      setError(null);
      return promptAsync();
    },
    error,
  };
}

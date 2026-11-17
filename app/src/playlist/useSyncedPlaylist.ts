import { useCallback, useEffect, useState } from 'react';

import { fetchLikedTracks, SpotifyNotConnectedError } from '../spotify/api';
import { logout } from '../spotify/auth';
import { useSpotifyLogin } from '../spotify/useSpotifyLogin';
import { Track } from '../models/track';
import { usePlaylist } from './usePlaylist';

export type SourceState =
  | { kind: 'loading'; detail?: string }
  | { kind: 'ok'; count: number }
  | { kind: 'disconnected' }
  | { kind: 'error'; message: string };

/**
 * Toute la logique de synchronisation, séparée de l'affichage :
 * cache + fusion (usePlaylist), chargement Spotify, état du chargement SoundCloud.
 * L'écran n'a plus qu'à afficher ce que ce hook renvoie.
 */
export function useSyncedPlaylist() {
  const playlist = usePlaylist();
  const { setSpotify, setSoundCloud } = playlist;

  const [spotify, setSpotifyState] = useState<SourceState>({ kind: 'loading' });
  const [soundcloud, setSoundCloudState] = useState<SourceState>({ kind: 'loading' });
  // Changer cette clé relance le chargeur SoundCloud (WebView invisible)
  const [soundCloudKey, setSoundCloudKey] = useState(0);

  const loadSpotify = useCallback(async () => {
    setSpotifyState({ kind: 'loading' });
    try {
      const list = await fetchLikedTracks((loaded, total) =>
        setSpotifyState({ kind: 'loading', detail: `${loaded}/${total}` }),
      );
      setSpotify(list);
      setSpotifyState({ kind: 'ok', count: list.length });
    } catch (e) {
      setSpotifyState(
        e instanceof SpotifyNotConnectedError
          ? { kind: 'disconnected' }
          : { kind: 'error', message: (e as Error).message },
      );
    }
  }, [setSpotify]);

  const spotifyLogin = useSpotifyLogin(loadSpotify);

  useEffect(() => {
    loadSpotify();
  }, [loadSpotify]);

  const refresh = useCallback(() => {
    setSoundCloudState({ kind: 'loading' });
    setSoundCloudKey((k) => k + 1);
    if (spotify.kind !== 'disconnected') loadSpotify();
  }, [loadSpotify, spotify.kind]);

  const disconnectSpotify = useCallback(async () => {
    await logout();
    setSpotify([]);
    setSpotifyState({ kind: 'disconnected' });
  }, [setSpotify]);

  /** Props à passer au <SoundCloudLoader /> tant que soundcloudLoading est vrai */
  const soundCloudHandlers = {
    onProgress: (loaded: number, total: number) =>
      setSoundCloudState({ kind: 'loading', detail: `${loaded}/${total}` }),
    onTracks: (list: Track[]) => {
      setSoundCloud(list);
      setSoundCloudState({ kind: 'ok', count: list.length });
    },
    onError: (message: string) => setSoundCloudState({ kind: 'error', message }),
  };

  return {
    tracks: playlist.tracks,
    updatedAt: playlist.updatedAt,
    spotify,
    soundcloud,
    refreshing: spotify.kind === 'loading' || soundcloud.kind === 'loading',
    refresh,
    spotifyLogin,
    disconnectSpotify,
    soundCloudKey,
    soundcloudLoading: soundcloud.kind === 'loading',
    soundCloudHandlers,
  };
}

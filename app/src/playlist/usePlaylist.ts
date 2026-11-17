import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Track } from '../models/track';
import { EMPTY_CACHE, loadCache, PlaylistCache, saveCache } from './cache';
import { mergeTracks, updateFirstSeen } from './merge';

/**
 * État de la playlist commune :
 *  1. au lancement, affiche immédiatement le cache
 *  2. chaque source met ensuite à jour sa partie (setSpotify / setSoundCloud)
 *  3. la playlist fusionnée est recalculée et le cache réenregistré
 */
export function usePlaylist() {
  const [cache, setCache] = useState<PlaylistCache>(EMPTY_CACHE);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  // Évite qu'un cache lu en retard écrase des données fraîches déjà reçues
  const freshDataReceived = useRef(false);

  useEffect(() => {
    loadCache().then((stored) => {
      if (!freshDataReceived.current) setCache(stored);
      setCacheLoaded(true);
    });
  }, []);

  const update = useCallback((change: (prev: PlaylistCache) => PlaylistCache) => {
    freshDataReceived.current = true;
    setCache((prev) => {
      const next = { ...change(prev), updatedAt: new Date().toISOString() };
      saveCache(next);
      return next;
    });
  }, []);

  const setSpotify = useCallback(
    (spotify: Track[]) => update((prev) => ({ ...prev, spotify })),
    [update],
  );

  const setSoundCloud = useCallback(
    (soundcloud: Track[]) =>
      update((prev) => ({
        ...prev,
        soundcloud,
        firstSeen: updateFirstSeen(soundcloud, prev.firstSeen),
      })),
    [update],
  );

  const tracks = useMemo(
    () => mergeTracks(cache.spotify, cache.soundcloud, cache.firstSeen),
    [cache],
  );

  return {
    tracks,
    cacheLoaded,
    updatedAt: cache.updatedAt,
    spotifyCount: cache.spotify.length,
    soundcloudCount: cache.soundcloud.length,
    setSpotify,
    setSoundCloud,
  };
}

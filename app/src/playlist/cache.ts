import AsyncStorage from '@react-native-async-storage/async-storage';

import { Track } from '../models/track';
import { FirstSeenMap } from './merge';

/**
 * Cache local de la playlist (AsyncStorage = petit stockage clé/valeur du téléphone).
 * On garde chaque source séparément : si Spotify échoue, on garde quand même
 * la dernière liste Spotify connue et la nouvelle liste SoundCloud.
 */
export interface PlaylistCache {
  spotify: Track[];
  soundcloud: Track[];
  firstSeen: FirstSeenMap;
  /** Date de la dernière mise à jour réussie (ISO) */
  updatedAt?: string;
}

/** Incrémenter la version si le format du cache change : l'ancien sera ignoré. */
const CACHE_KEY = 'playlist-cache-v1';

export const EMPTY_CACHE: PlaylistCache = { spotify: [], soundcloud: [], firstSeen: {} };

export async function loadCache(): Promise<PlaylistCache> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? { ...EMPTY_CACHE, ...(JSON.parse(raw) as PlaylistCache) } : EMPTY_CACHE;
  } catch {
    // Cache illisible : on repart de zéro plutôt que de planter
    return EMPTY_CACHE;
  }
}

export async function saveCache(cache: PlaylistCache): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Échec d'écriture non bloquant : l'app fonctionne, sans cache
  }
}

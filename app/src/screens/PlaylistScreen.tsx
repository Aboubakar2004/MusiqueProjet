import { useCallback, useMemo, useState } from 'react';
import { FlatList, Linking, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaylistHeader } from '../components/PlaylistHeader';
import { FilterValue } from '../components/SourceFilter';
import { SpotifyConnectCard } from '../components/SpotifyConnectCard';
import { TrackRow } from '../components/TrackRow';
import { SOUNDCLOUD_PLAYLIST_URL } from '../config';
import { Track } from '../models/track';
import { useSyncedPlaylist } from '../playlist/useSyncedPlaylist';
import { SoundCloudLoader } from '../soundcloud/SoundCloudLoader';
import { colors, fontSize, spacing } from '../theme';

/** Écran principal : la playlist commune Spotify + SoundCloud. */
export function PlaylistScreen() {
  const sync = useSyncedPlaylist();
  const [filter, setFilter] = useState<FilterValue>('all');

  const visibleTracks = useMemo(
    () => (filter === 'all' ? sync.tracks : sync.tracks.filter((t) => t.source === filter)),
    [sync.tracks, filter],
  );

  // Temporaire : ouvre le titre dans Spotify / SoundCloud. Remplacé par le lecteur à l'étape 7.
  const handlePress = useCallback((track: Track) => {
    Linking.openURL(track.url);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Track }) => <TrackRow track={item} onPress={handlePress} />,
    [handlePress],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={visibleTracks}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <PlaylistHeader
              tracks={visibleTracks}
              updatedAt={sync.updatedAt}
              spotify={sync.spotify}
              soundcloud={sync.soundcloud}
              filter={filter}
              onFilterChange={setFilter}
              onDisconnectSpotify={sync.disconnectSpotify}
            />
            {sync.spotify.kind === 'disconnected' && (
              <SpotifyConnectCard
                onLogin={sync.spotifyLogin.login}
                ready={sync.spotifyLogin.ready}
                error={sync.spotifyLogin.error}
              />
            )}
          </>
        }
        ListEmptyComponent={
          sync.refreshing ? undefined : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Aucun titre pour l'instant</Text>
              <Text style={styles.emptyText}>
                Like un titre sur Spotify ou ajoute-le à ta playlist SoundCloud « Synchroniser »,
                puis tire vers le bas pour actualiser.
              </Text>
            </View>
          )
        }
        // Tirer vers le bas pour actualiser (remplace l'ancien bouton "Recharger")
        refreshControl={
          <RefreshControl
            refreshing={sync.refreshing}
            onRefresh={sync.refresh}
            tintColor={colors.textMuted}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      {sync.soundcloudLoading && (
        <SoundCloudLoader
          key={sync.soundCloudKey}
          playlistUrl={SOUNDCLOUD_PLAYLIST_URL}
          {...sync.soundCloudHandlers}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xl * 2 },
  empty: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyTitle: { color: colors.text, fontSize: fontSize.title, fontWeight: '700' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.small, textAlign: 'center' },
});

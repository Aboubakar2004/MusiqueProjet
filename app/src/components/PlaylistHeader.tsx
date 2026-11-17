import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatTotalDuration, Track } from '../models/track';
import { SourceState } from '../playlist/useSyncedPlaylist';
import { APP_NAME, colors, fontSize, spacing } from '../theme';
import { FilterValue, SourceFilter } from './SourceFilter';

interface Props {
  tracks: Track[];
  updatedAt?: string;
  spotify: SourceState;
  soundcloud: SourceState;
  filter: FilterValue;
  onFilterChange: (value: FilterValue) => void;
  onDisconnectSpotify: () => void;
}

/** Texte d'état d'une source : "chargement 120/450", "erreur : …" */
function describe(name: string, state: SourceState): string | null {
  switch (state.kind) {
    case 'loading':
      return `${name} : chargement${state.detail ? ` ${state.detail}` : '…'}`;
    case 'error':
      return `${name} : ${state.message} (liste en cache)`;
    default:
      return null;
  }
}

/** En-tête : nom de l'app, résumé, état des sources, filtres. */
export function PlaylistHeader({
  tracks,
  updatedAt,
  spotify,
  soundcloud,
  filter,
  onFilterChange,
  onDisconnectSpotify,
}: Props) {
  const lastUpdate = updatedAt
    ? new Date(updatedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
    : null;
  const statuses = [describe('Spotify', spotify), describe('SoundCloud', soundcloud)].filter(
    Boolean,
  );
  const hasError = spotify.kind === 'error' || soundcloud.kind === 'error';

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{APP_NAME}</Text>
      <Text style={styles.summary}>
        {tracks.length} titres · {formatTotalDuration(tracks)}
        {lastUpdate ? ` · mis à jour ${lastUpdate}` : ''}
      </Text>

      {statuses.length > 0 && (
        <Text style={[styles.status, hasError && styles.statusError]}>{statuses.join('\n')}</Text>
      )}

      <View style={styles.filterRow}>
        <SourceFilter value={filter} onChange={onFilterChange} />
      </View>

      {spotify.kind === 'ok' && (
        <Pressable onPress={onDisconnectSpotify} hitSlop={8} accessibilityRole="button">
          <Text style={styles.link}>Déconnecter Spotify</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  heading: { color: colors.text, fontSize: fontSize.heading, fontWeight: '800' },
  summary: { color: colors.textMuted, fontSize: fontSize.small, marginTop: spacing.xs },
  status: { color: colors.textFaint, fontSize: fontSize.caption, marginTop: spacing.sm },
  statusError: { color: colors.danger },
  filterRow: { marginTop: spacing.lg },
  link: {
    color: colors.textFaint,
    fontSize: fontSize.caption,
    marginTop: spacing.md,
    textDecorationLine: 'underline',
  },
});

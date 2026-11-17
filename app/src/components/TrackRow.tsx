import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDuration, Track } from '../models/track';
import { artworkSize, colors, fontSize, radius, spacing } from '../theme';
import { SourceBadge } from './SourceBadge';

interface Props {
  track: Track;
  onPress?: (track: Track) => void;
}

/** Une ligne de la playlist : pochette, titre, source + artiste, durée. */
function TrackRowComponent({ track, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress?.(track)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${track.title}, ${track.artist}, sur ${track.source}`}
    >
      <Image
        source={track.artworkUrl}
        style={styles.artwork}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <View style={styles.subtitle}>
          <SourceBadge source={track.source} />
          <Text style={styles.artist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>
      </View>
      <Text style={styles.duration}>{formatDuration(track.durationMs)}</Text>
    </Pressable>
  );
}

// memo : une ligne n'est redessinée que si son titre change (fluide avec des centaines de titres)
export const TrackRow = memo(TrackRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: colors.surfaceActive },
  artwork: {
    width: artworkSize,
    height: artworkSize,
    borderRadius: radius.sm,
    backgroundColor: colors.artworkPlaceholder,
  },
  info: { flex: 1, marginHorizontal: spacing.md },
  title: { color: colors.text, fontSize: fontSize.title },
  subtitle: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: spacing.xs + 2 },
  artist: { flex: 1, color: colors.textMuted, fontSize: fontSize.small },
  duration: { color: colors.textMuted, fontSize: fontSize.small, fontVariant: ['tabular-nums'] },
});

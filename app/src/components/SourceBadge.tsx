import { StyleSheet, View } from 'react-native';

import { TrackSource } from '../models/track';
import { colors } from '../theme';

/** Pastille de couleur indiquant la provenance d'un titre (vert Spotify / orange SoundCloud). */
export function SourceBadge({ source, size = 8 }: { source: TrackSource; size?: number }) {
  return (
    <View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors[source] },
      ]}
      accessibilityLabel={source === 'spotify' ? 'Spotify' : 'SoundCloud'}
    />
  );
}

const styles = StyleSheet.create({
  dot: { flexShrink: 0 },
});

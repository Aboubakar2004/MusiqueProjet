import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TrackSource } from '../models/track';
import { colors, fontSize, radius, spacing } from '../theme';
import { SourceBadge } from './SourceBadge';

export type FilterValue = 'all' | TrackSource;

const OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'soundcloud', label: 'SoundCloud' },
];

interface Props {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

/** Boutons "Tout / Spotify / SoundCloud" pour filtrer la playlist. */
export function SourceFilter({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected && styles.chipSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            {option.value !== 'all' && <SourceBadge source={option.value} />}
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { color: colors.text, fontSize: fontSize.small, fontWeight: '600' },
  labelSelected: { color: colors.onAccent },
});

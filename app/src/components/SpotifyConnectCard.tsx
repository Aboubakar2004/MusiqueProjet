import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SPOTIFY_CLIENT_ID } from '../config';
import { spotifyRedirectUri } from '../spotify/auth';
import { colors, fontSize, radius, spacing } from '../theme';

interface Props {
  onLogin: () => void;
  ready: boolean;
  error: string | null;
}

/** Carte affichée quand Spotify n'est pas connecté. */
export function SpotifyConnectCard({ onLogin, ready, error }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ajoute tes likes Spotify</Text>
      {!SPOTIFY_CLIENT_ID ? (
        <Text style={styles.error}>
          Client ID manquant : ajoute EXPO_PUBLIC_SPOTIFY_CLIENT_ID dans app/.env.local
        </Text>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onLogin}
          disabled={!ready}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Se connecter à Spotify</Text>
        </Pressable>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      {/* Visible uniquement en développement : à recopier dans le dashboard Spotify */}
      {__DEV__ && (
        <Text style={styles.hint} selectable>
          Redirect URI : {spotifyRedirectUri}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.sm,
    // Ombre légère pour détacher la carte du fond clair
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { color: colors.text, fontSize: fontSize.title, fontWeight: '700' },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.spotify,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: colors.onSpotify, fontWeight: '700', fontSize: fontSize.body },
  error: { color: colors.danger, fontSize: fontSize.small },
  hint: { color: colors.textFaint, fontSize: fontSize.caption - 1 },
});

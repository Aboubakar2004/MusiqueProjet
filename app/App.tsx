import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SOUNDCLOUD_PLAYLIST_URL, SPOTIFY_CLIENT_ID } from './src/config';
import { formatDuration } from './src/models/track';
import { usePlaylist } from './src/playlist/usePlaylist';
import { SoundCloudLoader } from './src/soundcloud/SoundCloudLoader';
import { fetchLikedTracks, SpotifyNotConnectedError } from './src/spotify/api';
import { logout, spotifyRedirectUri } from './src/spotify/auth';
import { useSpotifyLogin } from './src/spotify/useSpotifyLogin';

// Écran temporaire pour vérifier les étapes 3 à 5 ; remplacé par le vrai écran playlist (étape 6)
export default function App() {
  // --- Playlist commune + cache (étape 5) ---
  const playlist = usePlaylist();
  const { setSpotify, setSoundCloud } = playlist;

  // --- SoundCloud (étape 3) ---
  const [scStatus, setScStatus] = useState('Chargement…');
  const [scReloadKey, setScReloadKey] = useState(0);
  const [scLoading, setScLoading] = useState(true);

  // --- Spotify (étape 4) ---
  const [spStatus, setSpStatus] = useState('Vérification de la connexion…');
  const [spConnected, setSpConnected] = useState(false);

  const loadSpotify = useCallback(async () => {
    try {
      setSpStatus('Chargement des likes…');
      const list = await fetchLikedTracks((loaded, total) =>
        setSpStatus(`Chargement : ${loaded}/${total} titres…`),
      );
      setSpotify(list);
      setSpConnected(true);
      setSpStatus(`${list.length} titres likés`);
    } catch (e) {
      if (e instanceof SpotifyNotConnectedError) {
        setSpConnected(false);
        setSpStatus('Non connecté');
      } else {
        // Erreur réseau : la dernière liste Spotify en cache reste affichée
        setSpStatus(`Erreur : ${(e as Error).message} (liste en cache affichée)`);
      }
    }
  }, [setSpotify]);

  const spotifyLogin = useSpotifyLogin(loadSpotify);

  // Au lancement : si des jetons sont déjà enregistrés, on charge directement les likes
  useEffect(() => {
    loadSpotify();
  }, [loadSpotify]);

  async function handleLogout() {
    await logout();
    setSpotify([]);
    setSpConnected(false);
    setSpStatus('Non connecté');
  }

  function reloadAll() {
    setScLoading(true);
    setScStatus('Chargement…');
    setScReloadKey((k) => k + 1);
    if (spConnected) loadSpotify();
  }

  const lastUpdate = playlist.updatedAt
    ? new Date(playlist.updatedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
    : 'jamais';

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>MusiqueProjet</Text>
      <Text style={styles.status}>
        {playlist.tracks.length} titres · mis à jour : {lastUpdate}
      </Text>

      <Text style={styles.status}>🟢 Spotify : {spStatus}</Text>
      {!spConnected && (
        <View>
          {!SPOTIFY_CLIENT_ID ? (
            <Text style={styles.warning}>
              Client ID manquant : ajoute EXPO_PUBLIC_SPOTIFY_CLIENT_ID dans app/.env.local
            </Text>
          ) : (
            <Pressable
              style={[styles.button, styles.spotifyButton]}
              onPress={spotifyLogin.login}
              disabled={!spotifyLogin.ready}
            >
              <Text style={styles.buttonText}>Se connecter à Spotify</Text>
            </Pressable>
          )}
          {spotifyLogin.error && <Text style={styles.warning}>{spotifyLogin.error}</Text>}
          {/* Affiché pour pouvoir le recopier dans le dashboard Spotify */}
          <Text style={styles.hint} selectable>
            Redirect URI : {spotifyRedirectUri}
          </Text>
        </View>
      )}

      <Text style={styles.status}>🟠 SoundCloud : {scStatus}</Text>

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={reloadAll} disabled={scLoading}>
          <Text style={styles.buttonText}>{scLoading ? 'Chargement…' : 'Recharger'}</Text>
        </Pressable>
        {spConnected && (
          <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Déconnecter Spotify</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={playlist.tracks}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.artworkUrl }} style={styles.artwork} />
            <View style={styles.info}>
              <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.artist} numberOfLines={1}>
                {item.source === 'spotify' ? '🟢' : '🟠'} {item.artist} ·{' '}
                {formatDuration(item.durationMs)}
              </Text>
            </View>
          </View>
        )}
      />

      {scLoading && (
        <SoundCloudLoader
          key={scReloadKey}
          playlistUrl={SOUNDCLOUD_PLAYLIST_URL}
          onProgress={(loaded, total) => setScStatus(`${loaded}/${total} titres chargés…`)}
          onTracks={(list) => {
            setSoundCloud(list);
            setScStatus(`${list.length} titres`);
            setScLoading(false);
          }}
          onError={(message) => {
            setScStatus(`Erreur : ${message} (liste en cache affichée)`);
            setScLoading(false);
          }}
        />
      )}
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  status: { color: '#b3b3b3', marginVertical: 6 },
  warning: { color: '#ff6b6b', marginVertical: 4 },
  hint: { color: '#777', fontSize: 11, marginBottom: 6 },
  actions: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#ff5500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 4,
  },
  spotifyButton: { backgroundColor: '#1db954' },
  secondaryButton: { backgroundColor: '#333' },
  buttonText: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  artwork: { width: 48, height: 48, borderRadius: 4, backgroundColor: '#333' },
  info: { flex: 1, marginLeft: 12 },
  trackTitle: { color: '#fff', fontSize: 16 },
  artist: { color: '#b3b3b3', fontSize: 13, marginTop: 2 },
});

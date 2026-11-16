import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SOUNDCLOUD_PLAYLIST_URL } from './src/config';
import { formatDuration, Track } from './src/models/track';
import { SoundCloudLoader } from './src/soundcloud/SoundCloudLoader';

// Écran temporaire pour vérifier l'étape 3 ; il sera remplacé par la playlist commune (étape 6)
export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [status, setStatus] = useState('Chargement de SoundCloud…');
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);

  function reload() {
    setLoading(true);
    setStatus('Chargement de SoundCloud…');
    setReloadKey((k) => k + 1);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>MusiqueProjet</Text>
      <Text style={styles.status}>{status}</Text>

      <Pressable style={styles.button} onPress={reload} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Chargement…' : 'Recharger'}</Text>
      </Pressable>

      <FlatList
        data={tracks}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.artworkUrl }} style={styles.artwork} />
            <View style={styles.info}>
              <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.artist} numberOfLines={1}>
                🟠 {item.artist} · {formatDuration(item.durationMs)}
              </Text>
            </View>
          </View>
        )}
      />

      {loading && (
        <SoundCloudLoader
          key={reloadKey}
          playlistUrl={SOUNDCLOUD_PLAYLIST_URL}
          onProgress={(loaded, total) => setStatus(`SoundCloud : ${loaded}/${total} titres chargés…`)}
          onTracks={(list) => {
            setTracks(list);
            setStatus(`${list.length} titres SoundCloud`);
            setLoading(false);
          }}
          onError={(message) => {
            setStatus(`Erreur : ${message}`);
            setLoading(false);
          }}
        />
      )}
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 16 },
  status: { color: '#b3b3b3', marginVertical: 8 },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#ff5500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  artwork: { width: 48, height: 48, borderRadius: 4, backgroundColor: '#333' },
  info: { flex: 1, marginLeft: 12 },
  trackTitle: { color: '#fff', fontSize: 16 },
  artist: { color: '#b3b3b3', fontSize: 13, marginTop: 2 },
});

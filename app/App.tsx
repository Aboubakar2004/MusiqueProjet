import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Écran temporaire : il sera remplacé par la playlist commune (étape 6)
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MusiqueProjet</Text>
      <Text style={styles.subtitle}>Likes Spotify + SoundCloud, réunis dans une seule playlist.</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
  },
});

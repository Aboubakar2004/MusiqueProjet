import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PlaylistScreen } from './src/screens/PlaylistScreen';
import { statusBarStyle } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <PlaylistScreen />
      <StatusBar style={statusBarStyle} />
    </SafeAreaProvider>
  );
}

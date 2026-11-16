import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import { Track } from '../models/track';
import { SoundCloudSound, soundCloudToTrack } from './toTrack';
import { buildWidgetHtml } from './widgetHtml';

interface Props {
  playlistUrl: string;
  onTracks: (tracks: Track[]) => void;
  onProgress?: (loaded: number, total: number) => void;
  onError?: (message: string) => void;
}

/**
 * Composant invisible : charge le widget SoundCloud dans une WebView cachée
 * et remonte les titres de la playlist au format Track.
 * Pour relancer le chargement, changer sa `key` côté parent.
 */
export function SoundCloudLoader({ playlistUrl, onTracks, onProgress, onError }: Props) {
  const html = useMemo(() => buildWidgetHtml(playlistUrl), [playlistUrl]);

  function handleMessage(event: WebViewMessageEvent) {
    let msg: { type: string; [key: string]: unknown };
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.type === 'sounds') {
      const tracks = (msg.sounds as SoundCloudSound[])
        .map(soundCloudToTrack)
        .filter((t): t is Track => t !== null);
      onTracks(tracks);
    } else if (msg.type === 'progress') {
      onProgress?.(msg.loaded as number, msg.total as number);
    } else if (msg.type === 'error') {
      onError?.(msg.message as string);
    }
  }

  return (
    <WebView
      style={styles.hidden}
      // Une origine https est nécessaire pour que le widget communique avec la page
      source={{ html, baseUrl: 'https://localhost' }}
      originWhitelist={['*']}
      onMessage={handleMessage}
      onError={(e) => onError?.(e.nativeEvent.description)}
      // Le "skip" utilisé pour charger les paquets suivants lance brièvement la lecture
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback
    />
  );
}

const styles = StyleSheet.create({
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Sign3DModelScreen({ route }) {
  const { sign } = route.params;
  const modelUrl = sign.model; // Should be a raw .glb URL

const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
      <style>
        body { margin: 0; background: #E53935; }
        model-viewer { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <model-viewer 
        src="${modelUrl}" 
        camera-controls 
        auto-rotate 
        autoplay
        orientation="0deg 0deg 0deg"
        camera-orbit="0deg 90deg 0.8m"
        camera-target="0m 7m 0m"
        field-of-view="20deg"
        background-color="#fff">
      </model-viewer>
    </body>
  </html>
`;



  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        startInLoadingState
        renderLoading={() => <ActivityIndicator size="large" color="#ffff" style={{ flex: 1 }} />}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
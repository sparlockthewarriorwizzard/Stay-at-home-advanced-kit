import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import RevenueCatService from './services/RevenueCat';
import { Audio } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      console.log('[App] Starting initialization...');
      try {
        // Force Landscape
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        
        RevenueCatService.configure();
        
        // Configure Audio with expo-av
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('[App] Audio mode configured');
      } catch (e) {
        console.error('[App] Initialization error', e);
      } finally {
        setIsReady(true);
        console.log('[App] Ready');
      }
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

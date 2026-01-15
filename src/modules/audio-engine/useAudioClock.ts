import { useEffect } from 'react';
import { useSharedValue, useFrameCallback } from 'react-native-reanimated';
import { AudioEngine } from './AudioEngine';

export const useAudioClock = (isPlaying: boolean) => {
  const audioTime = useSharedValue(0);

  useFrameCallback(() => {
    if (isPlaying) {
      audioTime.value = AudioEngine.getInstance().currentTime;
    }
  });

  return audioTime;
};

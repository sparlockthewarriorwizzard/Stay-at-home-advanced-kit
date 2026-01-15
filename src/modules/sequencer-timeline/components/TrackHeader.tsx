import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Instrument } from '../../../types/MusicTypes';

interface Props {
  track: Instrument;
  height?: number;
}

export const TrackHeader: React.FC<Props> = ({ track, height = 60 }) => {
  // Helper to map track type to icon name (MaterialCommunityIcons)
  const getIconName = (type: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (type) {
      case 'kick': return 'album'; // Placeholder for kick
      case 'clap': return 'hand-right'; // Placeholder for clap
      case 'tops': return 'weather-sunny'; // Sparkle/Top
      case 'bass': return 'waveform';
      case 'chords': return 'piano';
      case 'vocal': return 'microphone';
      case 'adds': return 'plus-circle-outline';
      case 'fx': return 'auto-fix'; // Magic wand
      default: return 'music-note';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: track.color, height }]}>
      <MaterialCommunityIcons 
        name={getIconName(track.type)} 
        size={24} 
        color="#FFFFFF" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
});

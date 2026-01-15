import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';
import { SEQUENCER_CONFIG } from '../constants/SequencerConfig';
import { BORDER_RADIUS } from '../../../constants/Theme';

interface Props {
  color: string;
  label: string;
  width: number;
  height?: number;
  isMuted?: boolean;
}

export const ArrangementClip: React.FC<Props> = ({ 
  color, 
  label, 
  width, 
  height = SEQUENCER_CONFIG.TRACK_HEIGHT - 4, // Slightly smaller than track height
  isMuted = false 
}) => {
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: color, 
        width, 
        height,
        opacity: isMuted ? 0.8 : 1
      }
    ]}>
      {isMuted && (
        <View style={StyleSheet.absoluteFill}>
          <Svg height="100%" width="100%">
            <Defs>
              <Pattern
                id="diagonalHatch"
                patternUnits="userSpaceOnUse"
                width="10"
                height="10"
                patternTransform="rotate(45)"
              >
                <Path d="M0,10 l10,-10" stroke="black" strokeWidth="2" strokeOpacity="0.3" />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#diagonalHatch)" />
          </Svg>
        </View>
      )}
      
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginVertical: 2,
    overflow: 'hidden',
  },
  label: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

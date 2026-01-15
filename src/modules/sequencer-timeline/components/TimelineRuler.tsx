import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SEQUENCER_CONFIG } from '../constants/SequencerConfig';

interface Props {
  bars?: number;
}

export const TimelineRuler: React.FC<Props> = ({ bars = SEQUENCER_CONFIG.BAR_COUNT }) => {
  const width = bars * SEQUENCER_CONFIG.BAR_WIDTH;

  return (
    <View style={[styles.container, { width }]}>
      {Array.from({ length: bars }).map((_, index) => (
        <View key={index} style={styles.barMarker}>
          <Text style={styles.barNumber}>{index + 1}</Text>
          <View style={styles.tick} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SEQUENCER_CONFIG.RULER_HEIGHT,
    backgroundColor: '#2C2C2C',
    flexDirection: 'row',
  },
  barMarker: {
    width: SEQUENCER_CONFIG.BAR_WIDTH,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.3)',
    paddingLeft: 4,
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  barNumber: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tick: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    width: 1,
    backgroundColor: '#FFF',
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/Theme';
import { TrackHeader } from './components/TrackHeader';
import { TRACK_DEFINITIONS } from '../../types/MusicTypes';

export const SequencerTimelineView: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.row}>
        {/* Left Sidebar: Track Headers */}
        <View style={styles.sidebar}>
          {TRACK_DEFINITIONS.map(track => (
            <TrackHeader key={track.id} track={track} />
          ))}
        </View>

        {/* Right Pane: Timeline */}
        <ScrollView 
          horizontal 
          style={styles.timelineContainer}
          contentContainerStyle={styles.timelineContent}
        >
          <Text style={styles.placeholderText}>Timeline (Scrollable) ----------------------------------------------------></Text>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    width: 60,
    backgroundColor: '#111', 
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  timelineContainer: {
    flex: 1,
  },
  timelineContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 1000, 
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
  },
});


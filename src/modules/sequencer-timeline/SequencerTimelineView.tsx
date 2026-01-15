import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/Theme';

export const SequencerTimelineView: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Left Sidebar: Track Headers */}
      <View style={styles.sidebar}>
        <Text style={styles.placeholderText}>Tracks</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
  },
  sidebar: {
    width: 60,
    backgroundColor: '#111', // Slightly different from background
    borderRightWidth: 1,
    borderRightColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContainer: {
    flex: 1,
  },
  timelineContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 1000, // Placeholder width for scrolling
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
  },
});


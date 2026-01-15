import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { COLORS } from '../../constants/Theme';
import { TrackHeader } from './components/TrackHeader';
import { TimelineRuler } from './components/TimelineRuler';
import { TRACK_DEFINITIONS } from '../../types/MusicTypes';
import { SEQUENCER_CONFIG } from './constants/SequencerConfig';

export const SequencerTimelineView: React.FC = () => {
  const rulerScrollRef = useRef<ScrollView>(null);
  const contentScrollRef = useRef<ScrollView>(null);

  const handleContentScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    rulerScrollRef.current?.scrollTo({ x, animated: false });
  };

  return (
    <View style={styles.container}>
      {/* Top Fixed Area: Spacer + Ruler */}
      <View style={styles.headerRow}>
        {/* Spacer for Sidebar */}
        <View style={styles.sidebarSpacer} />
        
        {/* Ruler (Synced Scroll) */}
        <View style={styles.rulerContainer}>
          <ScrollView 
            ref={rulerScrollRef}
            horizontal
            scrollEnabled={false} // Controlled by content scroll
            showsHorizontalScrollIndicator={false}
          >
            <TimelineRuler />
          </ScrollView>
        </View>
      </View>

      {/* Main Scrollable Area */}
      <ScrollView style={styles.verticalScroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.row}>
          {/* Left Sidebar: Track Headers */}
          <View style={styles.sidebar}>
            {TRACK_DEFINITIONS.map(track => (
              <TrackHeader key={track.id} track={track} />
            ))}
          </View>

          {/* Right Pane: Timeline Grid */}
          <ScrollView 
            ref={contentScrollRef}
            horizontal 
            style={styles.timelineContainer}
            contentContainerStyle={styles.timelineContent}
            onScroll={handleContentScroll}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={true}
          >
            {/* Grid Lines / Background */}
            <View style={styles.gridBackground}>
               {/* Temporary placeholder for grid content */}
               <Text style={styles.placeholderText}>Grid Content Area</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: 'row',
    height: SEQUENCER_CONFIG.RULER_HEIGHT,
    backgroundColor: '#2C2C2C',
    zIndex: 10,
  },
  sidebarSpacer: {
    width: 60,
    backgroundColor: '#111', // Match sidebar color
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  rulerContainer: {
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
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
    minWidth: SEQUENCER_CONFIG.BAR_COUNT * SEQUENCER_CONFIG.BAR_WIDTH, // Ensure full width
  },
  gridBackground: {
    flex: 1,
    width: SEQUENCER_CONFIG.BAR_COUNT * SEQUENCER_CONFIG.BAR_WIDTH,
    // Add grid lines here later
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
    margin: 20,
  },
});


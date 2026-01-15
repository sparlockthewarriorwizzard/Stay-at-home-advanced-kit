import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { COLORS } from '../../constants/Theme';
import { TrackHeader } from './components/TrackHeader';
import { TimelineRuler } from './components/TimelineRuler';
import { ArrangementClip } from './components/ArrangementClip';
import { TRACK_DEFINITIONS } from '../../types/MusicTypes';
import { SEQUENCER_CONFIG } from './constants/SequencerConfig';
import { useLoopStore } from '../loop-board/LoopStore';
import { useSequencerClock } from '../sequencer/useSequencerClock';
import { SequencerToolbar } from './components/SequencerToolbar';

const VARIATIONS = ['Fallen', 'Eventual', 'Hunted', 'Glittering'];
const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = 60;

const getLabel = (trackName: string, patternId: string) => {
  const match = patternId.match(/(\d+)$/);
  if (!match) return patternId;
  const index = parseInt(match[1], 10) - 1;
  const variation = VARIATIONS[index] || '';
  return `${trackName} ${variation}`;
};

export const SequencerTimelineView: React.FC = () => {
  const { arrangement, isPlaying, bpm } = useLoopStore(useShallow((state) => ({
    arrangement: state.arrangement,
    isPlaying: state.isPlaying,
    bpm: state.bpm,
  })));

  const rulerScrollRef = useRef<ScrollView>(null);
  const contentScrollRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);

  // Clock for Playhead
  const { currentStep, start, stop, reset } = useSequencerClock({
    bpm,
    steps: SEQUENCER_CONFIG.BAR_COUNT * 16, // Total 16th notes
  });

  // Sync Clock with Store
  useEffect(() => {
    if (isPlaying) {
        start();
    } else {
        stop();
        // Optional: reset() if we want to go back to start on stop, 
        // or keep position for pause. For now, let's pause.
    }
  }, [isPlaying, start, stop]);

  // Auto-Scroll Logic
  useEffect(() => {
    if (!isPlaying) return;

    // Calculate Playhead X position
    const stepWidth = SEQUENCER_CONFIG.BAR_WIDTH / 16;
    const playheadX = currentStep * stepWidth;

    // Visible Area Calculation
    const visibleStart = scrollX;
    const visibleEnd = scrollX + (SCREEN_WIDTH - SIDEBAR_WIDTH);

    // Page Turn: If playhead reaches the end of the visible area
    if (playheadX > visibleEnd - 50) { // 50px buffer
       const newScrollX = playheadX - 50;
       contentScrollRef.current?.scrollTo({ x: newScrollX, animated: true });
    }
  }, [currentStep, isPlaying, scrollX]);

  const handleContentScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    setScrollX(x);
    rulerScrollRef.current?.scrollTo({ x, animated: false });
  };

  const stepWidth = SEQUENCER_CONFIG.BAR_WIDTH / 16;
  const playheadLeft = currentStep * stepWidth;

  return (
    <View style={styles.container}>
      {/* Secondary Toolbar */}
      <SequencerToolbar 
        onUndo={() => console.log('Undo')} 
        onRedo={() => console.log('Redo')} 
        onToggleAutomation={() => console.log('Automation')} 
      />

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
             {/* Playhead in Ruler (Optional, adds nice visual) */}
             <View style={[styles.playheadRulerMarker, { left: playheadLeft }]} />
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
            {/* Grid Content */}
            <View style={styles.gridBackground}>
               {/* Render Clips from Store */}
               {arrangement.map(clip => {
                 const trackIndex = TRACK_DEFINITIONS.findIndex(t => t.id === clip.trackId);
                 if (trackIndex === -1) return null;

                 const trackDef = TRACK_DEFINITIONS[trackIndex];
                 const trackColor = trackDef.color || '#CCC';
                 const top = trackIndex * SEQUENCER_CONFIG.TRACK_HEIGHT;
                 const left = clip.startBar * SEQUENCER_CONFIG.BAR_WIDTH;
                 const width = clip.duration * SEQUENCER_CONFIG.BAR_WIDTH;
                 const label = getLabel(trackDef.name, clip.patternId);

                 return (
                   <View key={clip.id} style={{ position: 'absolute', top, left }}>
                     <ArrangementClip 
                        color={trackColor} 
                        label={label} 
                        width={width} 
                        isMuted={clip.isMuted}
                     />
                   </View>
                 );
               })}

               {/* Playhead Line */}
               {/* We render it here so it scrolls with content */}
               <View style={[styles.playheadLine, { left: playheadLeft }]} />

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
  playheadLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFF',
    zIndex: 999,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  playheadRulerMarker: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFF', // Arrow pointing up
    marginLeft: -5, // Center it
  },
});


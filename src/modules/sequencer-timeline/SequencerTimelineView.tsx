import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import Animated, { useAnimatedStyle, useSharedValue, useFrameCallback } from 'react-native-reanimated';
import { COLORS } from '../../constants/Theme';
import { TrackHeader } from './components/TrackHeader';
import { TimelineRuler } from './components/TimelineRuler';
import { ArrangementClip } from './components/ArrangementClip';
import { TRACK_DEFINITIONS } from '../../types/MusicTypes';
import { SEQUENCER_CONFIG } from './constants/SequencerConfig';
import { useLoopStore } from '../loop-board/LoopStore';
import { SequencerToolbar } from './components/SequencerToolbar';
import { useLookaheadScheduler, ScheduledNote } from '../audio-engine/useLookaheadScheduler';
import { AudioEngine } from '../audio-engine/AudioEngine';

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
  const { arrangement, isPlaying, bpm, buffers } = useLoopStore(useShallow((state) => ({
    arrangement: state.arrangement,
    isPlaying: state.isPlaying,
    bpm: state.bpm,
    buffers: state.buffers,
  })));

  const rulerScrollRef = useRef<ScrollView>(null);
  const contentScrollRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);

  // Map arrangement to scheduled notes for the audio engine
  const scheduledNotes = useMemo<ScheduledNote[]>(() => {
    const barDuration = (60 / bpm) * 4;
    return arrangement
      .filter(clip => !clip.isMuted && buffers[clip.patternId])
      .map(clip => ({
        time: clip.startBar * barDuration,
        buffer: buffers[clip.patternId],
      }));
  }, [arrangement, bpm, buffers]);

  // High-performance scheduler
  useLookaheadScheduler(isPlaying, scheduledNotes);

  // High-performance Visual Playhead (Hardware Synced)
  const playheadProgress = useSharedValue(0);
  useFrameCallback(() => {
    if (isPlaying) {
        playheadProgress.value = AudioEngine.getInstance().currentTime;
    } else {
        // playheadProgress.value = 0; // optional: keep position on pause
    }
  });

  // Auto-Scroll Logic (driven by React state for simplicity, or shared value for perf)
  // For now, let's stick to a useEffect that tracks playheadProgress
  // Note: we can't directly useEffect on shared values efficiently without useAnimatedReaction
  // But for scrolling, a low-freq check is fine.
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
        const barDuration = (60 / bpm) * 4;
        const playheadX = (playheadProgress.value / barDuration) * SEQUENCER_CONFIG.BAR_WIDTH;
        
        const visibleEnd = scrollX + (SCREEN_WIDTH - SIDEBAR_WIDTH);
        if (playheadX > visibleEnd - 50) {
            const newScrollX = playheadX - 50;
            contentScrollRef.current?.scrollTo({ x: newScrollX, animated: true });
        }
    }, 100); // Check every 100ms for auto-scroll

    return () => clearInterval(interval);
  }, [isPlaying, scrollX, bpm]);

  const handleContentScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    setScrollX(x);
    rulerScrollRef.current?.scrollTo({ x, animated: false });
  };

  // Logic for rendering playhead position in JSX (using Animated.View)
  const barDuration = (60 / bpm) * 4;
  const pixelsPerSecond = SEQUENCER_CONFIG.BAR_WIDTH / barDuration;

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
             {/* Playhead in Ruler */}
             <PlayheadMarker progress={playheadProgress} pixelsPerSecond={pixelsPerSecond} />
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
               <PlayheadLine progress={playheadProgress} pixelsPerSecond={pixelsPerSecond} />

            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const PlayheadMarker: React.FC<{ progress: any, pixelsPerSecond: number }> = ({ progress, pixelsPerSecond }) => {
    const animatedStyle = useAnimatedStyle(() => ({
        left: progress.value * pixelsPerSecond,
    }));
    return <Animated.View style={[styles.playheadRulerMarker, animatedStyle]} />;
};

const PlayheadLine: React.FC<{ progress: any, pixelsPerSecond: number }> = ({ progress, pixelsPerSecond }) => {
    const animatedStyle = useAnimatedStyle(() => ({
        left: progress.value * pixelsPerSecond,
    }));
    return <Animated.View style={[styles.playheadLine, animatedStyle]} />;
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


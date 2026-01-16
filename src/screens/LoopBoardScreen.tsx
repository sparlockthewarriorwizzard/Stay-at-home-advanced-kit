import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useFrameCallback } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useShallow } from 'zustand/react/shallow';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { COLORS, SPACING } from '../constants/Theme';
import { LoopPad } from '../modules/loop-board/components/LoopPad';
import { useLoopStore } from '../modules/loop-board/LoopStore';
import NativeLoopEngine from '../modules/loop-board/NativeLoopEngine';
import { SequencerTimelineView } from '../modules/sequencer-timeline/SequencerTimelineView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TRACK_DEFINITIONS } from '../types/MusicTypes';
import { AudioEngine } from '../modules/audio-engine/AudioEngine';

type Props = NativeStackScreenProps<RootStackParamList, 'LoopBoard'>;

const VARIATIONS = ['Fallen', 'Eventual', 'Hunted'];

const LoopBoardScreen: React.FC<Props> = ({ navigation, route: _route }) => {
  const { toggleLoop, isPlaying, setPlaying, tickQuantization, bpm, setBuffers } = useLoopStore(
    useShallow((state) => ({
      toggleLoop: state.toggleLoop,
      isPlaying: state.isPlaying,
      setPlaying: state.setPlaying,
      tickQuantization: state.tickQuantization,
      bpm: state.bpm,
      setBuffers: state.setBuffers,
    }))
  );
  const [_isReady, setIsReady] = useState(false);
  const [activeView, setActiveView] = useState<'LOOP' | 'SEQ' | 'DRUM' | 'SONG'>('LOOP');

  useEffect(() => {
    const init = async () => {
      await NativeLoopEngine.getInstance().loadAll();
      setBuffers(NativeLoopEngine.getInstance().getLoadedBuffers());
      setIsReady(true);
    };
    init();

    return () => {
        NativeLoopEngine.getInstance().stopAll();
    };
  }, [setBuffers]);

  // Precise Quantization Clock driven by hardware
  const lastBarRef = useRef(-1);
  useFrameCallback(() => {
    if (!isPlaying) {
        lastBarRef.current = -1;
        return;
    }

    const engine = AudioEngine.getInstance();
    const barDuration = (60 / bpm) * 4;
    const currentBar = Math.floor(engine.currentTime / barDuration);

    if (currentBar > lastBarRef.current) {
        lastBarRef.current = currentBar;
        // Trigger quantization at the exact bar boundary crossing
        tickQuantization();
    }
  });

  const handlePadPress = (trackId: string, loopId: string) => {
    toggleLoop(trackId, loopId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Transport Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>ON THE FLOOR</Text>
          <View style={styles.keyBadge}>
            <Text style={styles.keyText}>Cm</Text>
          </View>
        </View>

        <View style={styles.transport}>
          <TouchableOpacity onPress={() => setPlaying(!isPlaying)}>
            <MaterialCommunityIcons 
              name={isPlaying ? "stop" : "play"} 
              size={24} 
              color={COLORS.text} 
            />
          </TouchableOpacity>
          <View style={styles.tempoContainer}>
            <Text style={styles.tempoText}>120</Text>
            <Text style={styles.bpmLabel}>BPM</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.arrangeButton}
          onPress={() => navigation.navigate('VocalOverdub', { affirmationText: 'test' } as any)}
        >
           <Text style={styles.arrangeButtonText}>ARRANGE</Text>
           <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      {/* View Switcher Tabs */}
      <View style={styles.tabs}>
        {['LOOP', 'SEQ', 'DRUM', 'SONG'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={styles.tab}
            onPress={() => setActiveView(tab as any)}
          >
            <Text style={[styles.tabText, activeView === tab && styles.tabTextActive]}>{tab}</Text>
            {activeView === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content Area */}
      <View style={styles.contentArea}>
      {/* Live Loop Matrix */}
      <View style={styles.matrixContainer}>
        {activeView === 'LOOP' ? (
          <View style={styles.matrix}>
            {TRACK_DEFINITIONS.map((track) => (
              <View key={track.id} style={styles.column}>
                <Text style={[styles.columnHeader, { color: track.color }]}>{track.name}</Text>
                {VARIATIONS.map((variation) => {
                    const loopId = `${track.type}${VARIATIONS.indexOf(variation) + 1}`;

                    return (
                      <LoopPad
                        key={loopId}
                        trackId={track.id}
                        loopId={loopId}
                        label={variation}
                        instrumentType={track.type as any}
                        color={track.color}
                        onPress={() => handlePadPress(track.id, loopId)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
        ) : activeView === 'SEQ' ? (
          <SequencerTimelineView />
        ) : (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
             <Text style={{color: '#666'}}>Coming Soon</Text>
          </View>
        )}
      </View>
      </View>

      {/* Footer Nav - Removed */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  appTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  keyBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginTop: 0,
  },
  keyText: {
    color: COLORS.text,
    fontSize: 8,
    fontWeight: 'bold',
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tempoContainer: {
    alignItems: 'center',
  },
  tempoText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bpmLabel: {
    color: COLORS.textMuted,
    fontSize: 7,
  },
  tabs: {
    flexDirection: 'row',
    height: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: COLORS.text,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.bass, // Using Emerald Green as active indicator
  },
  contentArea: {
    flex: 1,
  },
  matrixContainer: {
    flex: 1,
    padding: 4,
  },
  matrix: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  column: {
    flex: 1,
    gap: 4,
  },
  columnHeader: {
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 0,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  arrangeButton: {
    backgroundColor: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrangeButtonText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default LoopBoardScreen;
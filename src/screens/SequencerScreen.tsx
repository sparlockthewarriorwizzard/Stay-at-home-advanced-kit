import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SequencerGrid } from '../modules/sequencer/SequencerGrid';
import { InstrumentSelector } from '../modules/sequencer/InstrumentSelector';
import { useSequencerClock } from '../modules/sequencer/useSequencerClock';
import { AudioEngine } from '../modules/sequencer/AudioEngine';
import { SoundKitService } from '../services/SoundKitService';
import { Ionicons } from '@expo/vector-icons';

type SequencerScreenRouteProp = RouteProp<RootStackParamList, 'Sequencer'>;

const SequencerScreen: React.FC = () => {
  const route = useRoute<SequencerScreenRouteProp>();
  const navigation = useNavigation();
  const { audioUri } = route.params;

  const [bpm, setBpm] = useState(120);
  // State: Record<instrumentId, boolean[]>
  const [steps, setSteps] = useState<Record<string, boolean[]>>({});
  const [activeInstrumentId, setActiveInstrumentId] = useState<string>(audioUri);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [activeKit] = useState(SoundKitService.getDefaultKit());

  // Initialize Audio Engine & Kit
  useEffect(() => {
    const setupEngine = async () => {
      try {
        const engine = AudioEngine.getInstance();

        // 1. Load User Affirmation (Voice)
        await engine.loadSound(audioUri);

        // 2. Load Drum Kit
        await engine.loadKit(activeKit);

        // 3. Initialize Steps for all instruments
        const initialSteps: Record<string, boolean[]> = {};
        // Voice
        initialSteps[audioUri] = new Array(16).fill(false);
        // Kit Instruments
        activeKit.instruments.forEach(inst => {
            initialSteps[inst.id] = new Array(16).fill(false);
        });

        setSteps(initialSteps);
        setIsEngineReady(true);
      } catch (error) {
        console.error('Failed to load audio in sequencer:', error);
      }
    };

    setupEngine();

    return () => {
        AudioEngine.getInstance().unloadAll();
    };
  }, [audioUri, activeKit]);

  // Handle step trigger (Audio Engine side)
  const onStepTrigger = useCallback((stepIndex: number) => {
    const engine = AudioEngine.getInstance();

    // Check every instrument to see if it should play on this step
    Object.keys(steps).forEach(instrumentId => {
        if (steps[instrumentId] && steps[instrumentId][stepIndex]) {
            engine.playInstrument(instrumentId);
        }
    });
  }, [steps]);

  const { currentStep, isPlaying, start, stop, reset } = useSequencerClock({
    bpm,
    onStep: onStepTrigger,
  });

  const toggleStep = (index: number) => {
    if (!activeInstrumentId) {return;}

    setSteps(prev => ({
        ...prev,
        [activeInstrumentId]: prev[activeInstrumentId].map((val, i) => i === index ? !val : val),
    }));
  };

  if (!isEngineReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading Kit...</Text>
      </View>
    );
  }

  // Helper to get active track name
  const getActiveTrackName = () => {
      if (activeInstrumentId === audioUri) {return 'My Voice';}
      const inst = activeKit.instruments.find(i => i.id === activeInstrumentId);
      return inst ? inst.name : 'Unknown';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Sequencer</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.bpmContainer}>
            <Text style={styles.bpmLabel}>BPM: {bpm}</Text>
            <View style={styles.bpmControls}>
                <TouchableOpacity onPress={() => setBpm(prev => Math.max(60, prev - 5))} style={styles.bpmButton}>
                    <Ionicons name="remove" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setBpm(prev => Math.min(200, prev + 5))} style={styles.bpmButton}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.trackInfo}>
            <Text style={styles.trackLabel}>Editing: <Text style={styles.activeTrackName}>{getActiveTrackName()}</Text></Text>
        </View>

        <SequencerGrid
          steps={steps[activeInstrumentId] || []}
          currentStep={currentStep}
          onToggleStep={toggleStep}
        />

        <InstrumentSelector
            instruments={activeKit.instruments}
            activeInstrumentId={activeInstrumentId}
            onSelectInstrument={setActiveInstrumentId}
            voiceUri={audioUri}
        />

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.stopButton]}
            onPress={isPlaying ? stop : start}
          >
            <Ionicons name={isPlaying ? 'stop' : 'play'} size={42} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFD700',
    marginTop: 16,
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },
  bpmContainer: {
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 20,
  },
  bpmLabel: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 12,
  },
  bpmControls: {
      flexDirection: 'row',
      gap: 20,
  },
  bpmButton: {
      backgroundColor: '#222',
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#333',
  },
  trackInfo: {
      marginBottom: 16,
  },
  trackLabel: {
      color: '#888',
      fontSize: 16,
  },
  activeTrackName: {
      color: '#FFD700',
      fontWeight: 'bold',
  },
  controls: {
    marginTop: 32,
    alignItems: 'center',
    gap: 24,
  },
  playButton: {
    backgroundColor: '#FFD700',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  stopButton: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SequencerScreen;

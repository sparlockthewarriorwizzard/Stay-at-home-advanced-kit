import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SequencerGrid } from '../modules/sequencer/SequencerGrid';
import { InstrumentSelector } from '../modules/sequencer/InstrumentSelector';
import { KitSelector } from '../modules/sequencer/KitSelector';
import { NeonButton } from '../components/NeonButton';
import { useSequencerClock } from '../modules/sequencer/useSequencerClock';
import { AudioEngine } from '../modules/sequencer/AudioEngine';
import { SoundKitService } from '../services/SoundKitService';
import { Ionicons } from '@expo/vector-icons';
import { SoundKit } from '../types/MusicTypes';

type SequencerScreenRouteProp = RouteProp<RootStackParamList, 'Sequencer'>;

const SequencerScreen: React.FC = () => {
  const route = useRoute<SequencerScreenRouteProp>();
  const navigation = useNavigation();
  const { audioUri } = route.params;

  const [bpm, setBpm] = useState(120);
  const [steps, setSteps] = useState<Record<string, boolean[]>>({});
  const [activeInstrumentId, setActiveInstrumentId] = useState<string>(audioUri);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [activeKit, setActiveKit] = useState<SoundKit>(SoundKitService.getDefaultKit());

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
        setSteps(prev => {
            const newSteps = { ...prev };
            if (!newSteps[audioUri]) {
                newSteps[audioUri] = new Array(16).fill(false);
            }
            activeKit.instruments.forEach(inst => {
                if (!newSteps[inst.id]) {
                    newSteps[inst.id] = new Array(16).fill(false);
                }
            });
            return newSteps;
        });

        setIsEngineReady(true);
      } catch (error) {
        console.error('Failed to load audio in sequencer:', error);
      }
    };

    setupEngine();
  }, [audioUri, activeKit]);

  // Handle Kit Change
  const handleKitChange = (kit: SoundKit) => {
      setActiveKit(kit);
      if (activeInstrumentId !== audioUri) {
          if (kit.instruments.length > 0) {
              setActiveInstrumentId(kit.instruments[0].id);
          } else {
              setActiveInstrumentId(audioUri);
          }
      }
  };

  // Handle step trigger
  const onStepTrigger = useCallback((stepIndex: number) => {
    const engine = AudioEngine.getInstance();
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

  const getActiveTrackName = () => {
      if (activeInstrumentId === audioUri) {return 'My Voice';}
      const inst = activeKit.instruments.find(i => i.id === activeInstrumentId);
      return inst ? inst.name : 'Unknown';
  };

  if (!isEngineReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading Kit...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <KitSelector
            currentKit={activeKit}
            kits={SoundKitService.getKits()}
            onSelectKit={handleKitChange}
        />
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
          <NeonButton
            onPress={isPlaying ? stop : start}
            title={isPlaying ? 'Stop' : 'Play'}
            color={isPlaying ? '#e74c3c' : '#FFD700'}
            style={styles.mainButton}
          />

          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <Text style={styles.resetButtonText}>Reset Pattern</Text>
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
    width: '100%',
    paddingHorizontal: 40,
  },
  mainButton: {
    width: '100%',
    height: 60,
  },
  resetButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default SequencerScreen;
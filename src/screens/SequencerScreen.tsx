import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SequencerGrid } from '../modules/sequencer/SequencerGrid';
import { KitSelector } from '../modules/sequencer/KitSelector';
import { NeonButton } from '../components/NeonButton';
import { SoundKitService } from '../services/SoundKitService';
import { Ionicons } from '@expo/vector-icons';
import { SoundKit } from '../types/MusicTypes';
import { WebAudioEngine, WebAudioEngineRef } from '../modules/sequencer/WebAudioEngine';

type SequencerScreenRouteProp = RouteProp<RootStackParamList, 'Sequencer'>;

const SequencerScreen: React.FC = () => {
  const route = useRoute<SequencerScreenRouteProp>();
  const navigation = useNavigation<any>(); 
  const { affirmationText } = route.params;

  const [bpm, setBpm] = useState(120);
  const [steps, setSteps] = useState<Record<string, boolean[]>>({});
  const [activeKit, setActiveKit] = useState<SoundKit>(SoundKitService.getDefaultKit());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const engineRef = useRef<WebAudioEngineRef>(null);

  // Initialize Steps
  useEffect(() => {
    // 1. Initialize Steps for all instruments if empty
    setSteps(prev => {
        const newSteps = { ...prev };
        activeKit.instruments.forEach(inst => {
            if (!newSteps[inst.id]) {
                newSteps[inst.id] = new Array(16).fill(false);
            }
        });
        return newSteps;
    });
  }, [activeKit]);

  // Handle Kit Change
  const handleKitChange = (kit: SoundKit) => {
      setActiveKit(kit);
  };

  const handleStartStop = () => {
      if (isPlaying) {
          engineRef.current?.sendCommand({ type: 'STOP' });
          setIsPlaying(false);
      } else {
          // Send latest pattern before starting
          engineRef.current?.sendCommand({ type: 'UPDATE_PATTERN', pattern: steps });
          engineRef.current?.sendCommand({ type: 'SET_BPM', bpm });
          engineRef.current?.sendCommand({ type: 'START' });
          setIsPlaying(true);
      }
  };

  const handleReset = () => {
    engineRef.current?.sendCommand({ type: 'STOP' });
    setIsPlaying(false);
    setCurrentStep(0);
    setSteps({}); // Clear pattern locally
    engineRef.current?.sendCommand({ type: 'UPDATE_PATTERN', pattern: {} }); // Clear in engine
  };

  const toggleStep = (instrumentId: string, index: number) => {
    setSteps(prev => {
        const currentSteps = prev[instrumentId] || new Array(16).fill(false);
        const newStepValue = !currentSteps[index];
        
        const nextSteps = {
            ...prev,
            [instrumentId]: currentSteps.map((val, i) => i === index ? newStepValue : val)
        };

        // Live Update the Engine
        engineRef.current?.sendCommand({ type: 'UPDATE_PATTERN', pattern: nextSteps });
        
        // Preview sound if added
        if (newStepValue) {
            engineRef.current?.sendCommand({ type: 'PREVIEW', instrumentId });
        }

        return nextSteps;
    });
  };

  // Handle BPM changes
  useEffect(() => {
      engineRef.current?.sendCommand({ type: 'SET_BPM', bpm });
  }, [bpm]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Hidden Web Audio Engine */}
      <WebAudioEngine ref={engineRef} onTick={setCurrentStep} />

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
            <Text style={styles.trackLabel}>Pattern Editor</Text>
        </View>

        <SequencerGrid
          tracks={[
              ...activeKit.instruments.map(inst => ({ id: inst.id, name: inst.name, color: '#FFD700' }))
          ]}
          steps={steps}
          currentStep={currentStep}
          onToggleStep={(instrumentId, index) => toggleStep(instrumentId, index)}
        />

        <View style={styles.controls}>
          <NeonButton
            onPress={handleStartStop}
            title={isPlaying ? 'Stop' : 'Play'}
            color={isPlaying ? '#e74c3c' : '#FFD700'}
            style={styles.mainButton}
          />

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset Pattern</Text>
          </TouchableOpacity>

          <NeonButton
            title="Next: Record Vocal"
            onPress={() => navigation.navigate('VocalOverdub', { 
                affirmationText, 
                steps, 
                bpm, 
                kitId: activeKit.id 
            })}
            color="#00E676" // Green color
            style={{ marginTop: 20, width: '100%' }}
          />
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
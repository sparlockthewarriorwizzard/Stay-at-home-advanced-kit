import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SequencerGrid } from '../modules/sequencer/SequencerGrid';
import { useSequencerClock } from '../modules/sequencer/useSequencerClock';
import { AudioEngine } from '../modules/sequencer/AudioEngine';
import { Ionicons } from '@expo/vector-icons';

type SequencerScreenRouteProp = RouteProp<RootStackParamList, 'Sequencer'>;

const SequencerScreen: React.FC = () => {
  const route = useRoute<SequencerScreenRouteProp>();
  const navigation = useNavigation();
  const { audioUri } = route.params;

  const [bpm, setBpm] = useState(120);
  const [steps, setSteps] = useState<boolean[]>(new Array(16).fill(false));
  const [isEngineReady, setIsEngineReady] = useState(false);

  // Initialize Audio Engine
  useEffect(() => {
    const setupEngine = async () => {
      try {
        const engine = AudioEngine.getInstance();
        await engine.loadSound(audioUri);
        setIsEngineReady(true);
      } catch (error) {
        console.error('Failed to load audio in sequencer:', error);
      }
    };

    setupEngine();
    
    return () => {
        // Cleanup sounds on unmount
        AudioEngine.getInstance().unloadAllSounds();
    };
  }, [audioUri]);

  // Handle step trigger
  const onStepTrigger = useCallback((stepIndex: number) => {
    if (steps[stepIndex]) {
      AudioEngine.getInstance().playSound(audioUri);
    }
  }, [steps, audioUri]);

  const { currentStep, isPlaying, start, stop, reset } = useSequencerClock({
    bpm,
    onStep: onStepTrigger,
  });

  const toggleStep = (index: number) => {
    const newSteps = [...steps];
    newSteps[index] = !newSteps[index];
    setSteps(newSteps);
  };

  if (!isEngineReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Preparing your sound...</Text>
      </View>
    );
  }

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

        <SequencerGrid
          steps={steps}
          currentStep={currentStep}
          onToggleStep={toggleStep}
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
    justifyContent: 'center',
    paddingBottom: 40,
  },
  bpmContainer: {
      alignItems: 'center',
      marginBottom: 32,
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
  controls: {
    marginTop: 48,
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

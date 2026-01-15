import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AffirmationService } from '../modules/affirmation-flow/AffirmationService';
import { useAffirmation } from '../modules/affirmation-flow/useAffirmation';
import { AudioEngine } from '../modules/sequencer/AudioEngine';
import { useSequencerClock } from '../modules/sequencer/useSequencerClock';
import { NeonButton } from '../components/NeonButton';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'VocalOverdub'>;

// Service instance (would typically be injected)
const affirmationService = new AffirmationService('https://your-api-url.com');

const VocalOverdubScreen: React.FC<Props> = ({ route, navigation }) => {
  const { affirmationText, steps: patternSteps, kitId, bpm } = route.params;

  // Recording State
  const {
    startRecording,
    stopRecording,
    recordedUri,
    isRecording,
    playRecording,
    stopPlaying: stopPreview,
    reset: resetRecording,
  } = useAffirmation({ service: affirmationService });

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPlayingBacking, setIsPlayingBacking] = useState(false);

  // Sequencer Logic for Backing Track
  // We re-use the clock hook to drive the sequencer
  const onStepTrigger = (stepIndex: number) => {
    const engine = AudioEngine.getInstance();
    Object.keys(patternSteps).forEach(instrumentId => {
        if (patternSteps[instrumentId] && patternSteps[instrumentId][stepIndex]) {
            engine.playInstrument(instrumentId);
        }
    });
  };

  const { start: startClock, stop: stopClock, reset: resetClock } = useSequencerClock({
    bpm,
    onStep: onStepTrigger,
  });

  // Handle Recording Start (with Countdown)
  const handleRecordPress = () => {
    if (isRecording) {
      // STOP EVERYTHING
      stopRecording();
      stopClock();
      setIsPlayingBacking(false);
    } else {
      // START COUNTDOWN
      setCountdown(3);
    }
  };

  // Countdown Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      
      // Start Backing Track
      startClock();
      setIsPlayingBacking(true);

      // Start Recording
      startRecording();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Cleanup on Unmount
  useEffect(() => {
      return () => {
          stopClock();
      };
  }, []);

  const handleFinish = () => {
      // Here we would mix the tracks or save the project
      // For now, navigate Home or to a "Result" screen
      navigation.navigate('MainTabs'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Record Vocal</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <View style={styles.content}>
        
        {/* Affirmation Display */}
        <View style={styles.card}>
            <Text style={styles.affirmationLabel}>Read Aloud:</Text>
            <Text style={styles.affirmationText}>"{affirmationText}"</Text>
        </View>

        {/* Visualizer / Status */}
        <View style={styles.statusContainer}>
             {isRecording && (
                 <Text style={styles.recordingText}>Recording...</Text>
             )}
             {countdown !== null && (
                 <Text style={styles.countdownText}>{countdown}</Text>
             )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
             {!recordedUri ? (
                <TouchableOpacity
                    onPress={handleRecordPress}
                    disabled={countdown !== null}
                    style={[
                        styles.recordButton,
                        isRecording && styles.recordButtonActive,
                        countdown !== null && styles.recordButtonDisabled
                    ]}
                >
                    <Ionicons 
                        name={isRecording ? "stop" : "mic"} 
                        size={40} 
                        color={isRecording ? "#fff" : "#000"} 
                    />
                </TouchableOpacity>
             ) : (
                 <View style={styles.reviewContainer}>
                     <Text style={styles.reviewTitle}>Great Take!</Text>
                     
                     <NeonButton 
                        title="Listen to Vocal" 
                        onPress={playRecording} 
                        style={styles.reviewButton}
                    />

                     <View style={styles.row}>
                        <TouchableOpacity onPress={resetRecording} style={styles.secondaryButton}>
                             <Text style={styles.secondaryButtonText}>Redo</Text>
                        </TouchableOpacity>

                        <NeonButton 
                            title="Finish Track" 
                            onPress={handleFinish} 
                            color="#2ecc71" 
                            style={{flex: 1, marginLeft: 16}} 
                        />
                     </View>
                 </View>
             )}
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
  backButton: { padding: 4 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: {
      flex: 1,
      padding: 16,
      justifyContent: 'space-between',
  },
  card: {
      backgroundColor: '#1a1a1a',
      padding: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#333',
      alignItems: 'center',
      marginTop: 20,
  },
  affirmationLabel: {
      color: '#666',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontSize: 12,
  },
  affirmationText: {
      color: '#FFD700',
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: 32,
      fontStyle: 'italic',
  },
  statusContainer: {
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
  },
  countdownText: {
      fontSize: 80,
      fontWeight: '900',
      color: '#fff',
  },
  recordingText: {
      color: '#e74c3c',
      fontSize: 18,
      fontWeight: '600',
      letterSpacing: 2,
  },
  controls: {
      alignItems: 'center',
      marginBottom: 40,
  },
  recordButton: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: '#FFD700',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
  },
  recordButtonActive: {
      backgroundColor: '#e74c3c',
      borderWidth: 4,
      borderColor: '#fff',
  },
  recordButtonDisabled: {
      opacity: 0.5,
  },
  reviewContainer: {
      width: '100%',
  },
  reviewTitle: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 24,
  },
  reviewButton: {
      marginBottom: 16,
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  secondaryButton: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      backgroundColor: '#333',
      borderRadius: 30,
  },
  secondaryButtonText: {
      color: '#fff',
      fontWeight: '600',
  }
});

export default VocalOverdubScreen;

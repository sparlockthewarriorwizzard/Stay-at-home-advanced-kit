import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  useAudioPlayer,
} from 'expo-audio';
import { AffirmationService, AIResponse } from './AffirmationService';

interface UseAffirmationProps {
  service: AffirmationService;
  onSuccess?: (audioUri: string) => void;
}

export const useAffirmation = ({ service, onSuccess }: UseAffirmationProps) => {
  // Goal & AI State
  const [goalText, setGoalText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  // Audio Recording State & Hook
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Audio Playback Hook
  const player = useAudioPlayer(audioUri);

  // Initial Setup
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission required', 'Please grant microphone access to record.');
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const handleGenerate = async () => {
    if (!goalText.trim()) {
      Alert.alert('Please enter a goal');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await service.generateAffirmation(goalText);
      setAiResponse(response);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate affirmation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startRecording = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setAudioUri(audioRecorder.uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const playSound = async () => {
    if (!audioUri || !player) {return;}

    if (player.playing) {
      player.pause();
    }

    player.seekTo(0);
    player.play();
  };

  const handleSave = async () => {
    if (!aiResponse || !audioUri) {return;}

    setIsSaving(true);
    try {
      const objectPath = await service.uploadAudioRecording(audioUri);
      await service.saveAudioToGoal(aiResponse.goalId, objectPath);

      if (onSuccess) {
        onSuccess(audioUri);
      } else {
        Alert.alert('Success', 'Goal and affirmation saved!');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save audio recording.');
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setAiResponse(null);
    setAudioUri(null);
    setGoalText('');
  };

  return {
    // State
    goalText,
    setGoalText,
    isGenerating,
    aiResponse,
    isRecording: recorderState.isRecording,
    isPlaying: player.playing,
    audioUri,
    isSaving,

    // Actions
    handleGenerate,
    startRecording,
    stopRecording,
    playSound,
    handleSave,
    reset,
  };
};

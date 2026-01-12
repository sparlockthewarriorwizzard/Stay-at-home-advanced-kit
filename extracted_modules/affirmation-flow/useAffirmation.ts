import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';
import { AffirmationService, AIResponse } from './AffirmationService';

interface UseAffirmationProps {
    service: AffirmationService;
    onSuccess?: () => void;
}

export const useAffirmation = ({ service, onSuccess }: UseAffirmationProps) => {
    // Goal & AI State
    const [goalText, setGoalText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

    // Audio State
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [isRecording, setIsRecording] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Cleanup audio resources on unmount
    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [recording, sound]);

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
            if (permissionResponse?.status !== 'granted') {
                const permission = await requestPermission();
                if (permission.status !== 'granted') {
                    Alert.alert('Permission required', 'Please grant microphone access to record.');
                    return;
                }
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(newRecording);
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setRecording(null);
    };

    const playSound = async () => {
        if (!audioUri) return;

        // If a sound is already loaded, unload it first
        if (sound) {
            await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
        setSound(newSound);
        setIsPlaying(true);
        
        await newSound.playAsync();

        newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                setIsPlaying(false);
            }
        });
    };

    const handleSave = async () => {
        if (!aiResponse || !audioUri) return;

        setIsSaving(true);
        try {
            const objectPath = await service.uploadAudioRecording(audioUri);
            await service.saveAudioToGoal(aiResponse.goalId, objectPath);
            
            if (onSuccess) {
                onSuccess();
            } else {
                Alert.alert("Success", "Goal and affirmation saved!");
            }
        } catch (error) {
            console.error("Save error:", error);
            Alert.alert("Error", "Failed to save audio recording.");
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
        isRecording,
        isPlaying,
        audioUri,
        isSaving,
        
        // Actions
        handleGenerate,
        startRecording,
        stopRecording,
        playSound,
        handleSave,
        reset
    };
};

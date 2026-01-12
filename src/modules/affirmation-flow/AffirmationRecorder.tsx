import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAffirmation } from './useAffirmation';
import { AffirmationService } from './AffirmationService';

interface AffirmationRecorderProps {
    service: AffirmationService;
    onSuccess?: (audioUri: string) => void;
    // Optional style overrides
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
}

export const AffirmationRecorder: React.FC<AffirmationRecorderProps> = ({
    service,
    onSuccess,
    primaryColor = '#007AFF',
    secondaryColor = '#666',
    accentColor = '#FFD700', // Gold neon
}) => {
    const {
        goalText,
        setGoalText,
        isGenerating,
        aiResponse,
        isRecording,
        isPlaying,
        audioUri,
        isSaving,
        handleGenerate,
        startRecording,
        stopRecording,
        playSound,
        handleSave,
        reset,
    } = useAffirmation({ service, onSuccess });

    // Dynamic Styles based on props
    const dynamicStyles = {
        button: { backgroundColor: primaryColor },
        affirmationText: { color: accentColor },
        recordButton: { backgroundColor: '#e74c3c' },
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.headerTitle}>New Goal</Text>

            {!aiResponse ? (
                <View>
                    <Text style={styles.label}>What is your goal today?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="I want to..."
                        placeholderTextColor="#666"
                        multiline
                        value={goalText}
                        onChangeText={setGoalText}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.button, dynamicStyles.button, isGenerating && styles.disabledButton]}
                        onPress={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Generate Affirmation</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.resultContainer}>
                    <Text style={styles.sectionTitle}>Your Affirmation</Text>
                    <View style={styles.card}>
                        <Text style={[styles.affirmationText, dynamicStyles.affirmationText]}>
                            "{aiResponse.affirmation}"
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Action Steps</Text>
                    {aiResponse.steps.map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                            <Ionicons name="checkmark-circle-outline" size={24} color={accentColor} />
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}

                    <Text style={styles.sectionTitle}>Record It</Text>
                    <Text style={styles.instructionText}>
                        Read the affirmation aloud to reinforce it.
                    </Text>

                    <View style={styles.recordingControls}>
                        {isRecording ? (
                            <TouchableOpacity style={styles.recordButtonActive} onPress={stopRecording}>
                                <Ionicons name="stop" size={32} color="#fff" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.recordButton, dynamicStyles.recordButton]} onPress={startRecording}>
                                <Ionicons name="mic" size={32} color="#fff" />
                            </TouchableOpacity>
                        )}

                        {audioUri && !isRecording && (
                            <TouchableOpacity style={styles.playButton} onPress={playSound}>
                                <Ionicons name={isPlaying ? 'volume-high' : 'play'} size={32} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {audioUri && (
                        <TouchableOpacity
                            style={[styles.button, dynamicStyles.button, isSaving && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Save & Finish</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
                        <Text style={[styles.secondaryButtonText, { color: secondaryColor }]}>Start Over</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Dark background
    },
    content: {
        padding: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#fff',
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 120,
        backgroundColor: '#111',
        marginBottom: 24,
        color: '#fff',
    },
    button: {
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
    resultContainer: {
        marginTop: 0,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 24,
        color: '#fff',
    },
    card: {
        backgroundColor: '#1a1a1a',
        padding: 24,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    affirmationText: {
        fontSize: 20,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 28,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#111',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#222',
    },
    stepText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#ccc',
        flex: 1,
        lineHeight: 22,
    },
    instructionText: {
        fontSize: 16,
        color: '#888',
        marginBottom: 24,
        lineHeight: 22,
    },
    recordingControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        gap: 24,
    },
    recordButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#e74c3c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    recordButtonActive: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#c0392b',
        borderWidth: 4,
        borderColor: '#fab1a0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
    },
});

import React, { useState, useEffect } from 'react';
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
        handleGenerate,
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
                    {/* Affirmation Card */}
                    <Text style={styles.sectionTitle}>Your Affirmation</Text>
                    <View style={styles.card}>
                        <Text style={[styles.affirmationText, dynamicStyles.affirmationText]}>
                            "{aiResponse.affirmation}"
                        </Text>
                    </View>

                    {/* Action Steps */}
                    <Text style={styles.sectionTitle}>Action Steps</Text>
                    {aiResponse.steps.map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                            <Ionicons name="checkmark-circle-outline" size={24} color={accentColor} />
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}

                    <Text style={styles.instructionText}>
                        Now, let's create a soundtrack for your success.
                    </Text>

                    <TouchableOpacity
                        style={[styles.button, dynamicStyles.button]}
                        onPress={() => onSuccess && onSuccess(aiResponse.affirmation)} // Pass affirmation text instead of audio URI
                    >
                        <Text style={styles.buttonText}>Create Music Track</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" style={{marginLeft: 8}} />
                    </TouchableOpacity>

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
        padding: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
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
        marginBottom: 24, // Increased spacing
        borderWidth: 1,
        borderColor: '#333',
    },
    affirmationText: {
        fontSize: 24, // Larger text
        fontWeight: 'bold',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 32,
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
        marginBottom: 12,
        lineHeight: 22,
    },
    recordingControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        gap: 24,
        position: 'relative',
    },
    countdownOverlay: {
        position: 'absolute',
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        height: 100,
    },
    countdownText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    recordButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#e74c3c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    recordButtonActive: {
        width: 80,
        height: 80,
        borderRadius: 40,
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
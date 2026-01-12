import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface SequencerGridProps {
  steps: boolean[];
  currentStep: number;
  onToggleStep: (index: number) => void;
  accentColor?: string;
}

export const SequencerGrid: React.FC<SequencerGridProps> = ({
  steps,
  currentStep,
  onToggleStep,
  accentColor = '#FFD700', // Gold neon
}) => {
  return (
    <View style={styles.gridContainer}>
      {steps.map((isActive, index) => {
        const isCurrent = index === currentStep;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.step,
              isActive && { backgroundColor: accentColor, borderColor: accentColor },
              isCurrent && styles.currentStep,
              isActive && isCurrent && styles.activeCurrentStep,
            ]}
            onPress={() => onToggleStep(index)}
            activeOpacity={0.7}
          >
            <Text style={[
                styles.stepText,
                isActive && { color: '#000' },
                isCurrent && !isActive && { color: accentColor },
            ]}>
              {index + 1}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 12,
  },
  step: {
    width: 65,
    height: 65,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentStep: {
    borderColor: '#FFD700',
    borderWidth: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  activeCurrentStep: {
    transform: [{ scale: 1.1 }],
  },
  stepText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

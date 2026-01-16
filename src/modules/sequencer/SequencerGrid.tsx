import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const AnimatedView = Animated.View as any;

interface StepProps {
  stepIndex: number;
  isActive: boolean;
  isCurrent: boolean;
  onToggle: () => void;
  accentColor: string;
}

const SequencerStep = memo(({ stepIndex, isActive, isCurrent, onToggle, accentColor }: StepProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        isActive ? accentColor : isCurrent ? '#333' : '#1a1a1a',
        { duration: 100 }
      ),
      borderColor: withTiming(
        isCurrent ? '#fff' : isActive ? accentColor : '#333',
        { duration: 100 }
      ),
      transform: [{ scale: withSpring(isActive || isCurrent ? 1.05 : 1) }],
    };
  });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <AnimatedView style={[styles.step, animatedStyle]} />
    </TouchableOpacity>
  );
});

interface TrackProps {
  id: string;
  name: string;
  steps: boolean[];
  currentStep: number;
  onToggleStep: (instrumentId: string, stepIndex: number) => void;
  color: string;
}

const SequencerTrack = memo(({ id, name, steps, currentStep, onToggleStep, color }: TrackProps) => {
  return (
    <View style={styles.trackRow}>
      <View style={styles.trackHeader}>
        <Text style={styles.trackName} numberOfLines={1}>{name}</Text>
      </View>
      <View style={styles.stepsRow}>
        {steps.map((isActive, index) => (
          <SequencerStep
            key={`${id}-${index}`}
            stepIndex={index}
            isActive={isActive}
            isCurrent={index === currentStep}
            onToggle={() => onToggleStep(id, index)}
            accentColor={color}
          />
        ))}
      </View>
    </View>
  );
});

interface SequencerGridProps {
  tracks: Array<{ id: string; name: string; color?: string }>;
  steps: Record<string, boolean[]>;
  currentStep: number;
  onToggleStep: (instrumentId: string, stepIndex: number) => void;
}

export const SequencerGrid: React.FC<SequencerGridProps> = ({
  tracks,
  steps,
  currentStep,
  onToggleStep,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.gridColumn}>
           {/* Steps Header (1-16) */}
           <View style={styles.headerRow}>
              <View style={styles.trackHeaderPlaceholder} />
              <View style={[styles.stepsRow, { gap: 6 }]}>
                  {Array.from({ length: 16 }).map((_, i) => (
                      <Text key={i} style={[styles.stepLabel, i === currentStep && styles.activeStepLabel]}>
                          {i + 1}
                      </Text>
                  ))}
              </View>
           </View>

           {/* Tracks */}
           {tracks.map((track) => (
            <SequencerTrack
              key={track.id}
              id={track.id}
              name={track.name}
              steps={steps[track.id] || new Array(16).fill(false)}
              currentStep={currentStep}
              onToggleStep={onToggleStep}
              color={track.color || '#FFD700'}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingRight: 40, // Extra space at the end
  },
  gridColumn: {
    flexDirection: 'column',
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trackHeaderPlaceholder: {
    width: 80, // Matches trackHeader width
  },
  stepLabel: {
    width: 36,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  activeStepLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackHeader: {
    width: 80,
    marginRight: 8,
  },
  trackName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 6, // Increased gap for better touch targets
  },
  step: {
    width: 36,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
  },
});
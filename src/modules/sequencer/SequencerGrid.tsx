import React, { useEffect, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';

const AnimatedView = Animated.View as any;

interface StepProps {
  index: number;
  isActive: boolean;
  isCurrent: boolean;
  onToggle: (index: number) => void;
  accentColor: string;
}

const SequencerStep = memo(({ index, isActive, isCurrent, onToggle, accentColor }: StepProps) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // Animate when current step changes (Playhead)
  useEffect(() => {
    if (isCurrent) {
      scale.value = withTiming(1.15, { duration: 100 });
      glowOpacity.value = withTiming(1, { duration: 100 });
    } else {
      scale.value = withTiming(1, { duration: 200 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isCurrent, scale, glowOpacity]);

  // Animate when triggered (Visual feedback for hits)
  useEffect(() => {
    if (isCurrent && isActive) {
        scale.value = withSpring(1.3);
    }
  }, [isCurrent, isActive, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      borderColor: withTiming(
        isCurrent ? accentColor : isActive ? accentColor : '#333',
        { duration: 150 }
      ),
      borderWidth: isCurrent ? 3 : 2,
      shadowOpacity: glowOpacity.value * 0.8,
    };
  });

  const innerStyle = useAnimatedStyle(() => {
      return {
          backgroundColor: withTiming(
              isActive ? accentColor : '#111',
              { duration: 150 }
          ),
      };
  });

  return (
    <TouchableOpacity
      onPress={() => onToggle(index)}
      activeOpacity={0.7}
    >
      <AnimatedView
        style={[
          styles.step,
          { shadowColor: accentColor },
          animatedStyle,
          innerStyle,
        ]}
      >
        <Text style={[
            styles.stepText,
            isActive ? { color: '#000' } : isCurrent ? { color: accentColor } : { color: '#666' }
        ]}>
          {index + 1}
        </Text>
      </AnimatedView>
    </TouchableOpacity>
  );
});

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
  accentColor = '#FFD700',
}) => {
  return (
    <View style={styles.gridContainer}>
      {steps.map((isActive, index) => (
        <SequencerStep
          key={index}
          index={index}
          isActive={isActive}
          isCurrent={index === currentStep}
          onToggle={onToggleStep}
          accentColor={accentColor}
        />
      ))}
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
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  stepText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
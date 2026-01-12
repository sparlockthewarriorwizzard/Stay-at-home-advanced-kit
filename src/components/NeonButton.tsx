import React, { useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

interface NeonButtonProps {
  onPress: () => void;
  title: string;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  pulse?: boolean;
  disabled?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const NeonButton: React.FC<NeonButtonProps> = ({
  onPress,
  title,
  color = '#FFD700',
  style,
  textStyle,
  pulse = true,
  disabled = false,
}) => {
  const pulseValue = useSharedValue(0);

  useEffect(() => {
    if (pulse && !disabled) {
      pulseValue.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    } else {
      pulseValue.value = 0;
    }
  }, [pulse, disabled, pulseValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      pulseValue.value,
      [0, 1],
      [0.3, 0.8],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      pulseValue.value,
      [0, 1],
      [1, 1.05],
      Extrapolation.CLAMP
    );

    return {
      shadowOpacity: opacity,
      transform: [{ scale }],
    };
  });

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { borderColor: color, shadowColor: color },
        style,
        animatedStyle,
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color }, textStyle]}>{title}</Text>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

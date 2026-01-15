import React, { useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useAnimatedProps,
  withRepeat,
  useSharedValue,
  Easing,
  cancelAnimation,
  withSequence,
  useFrameCallback,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../../../constants/Theme';
import { useLoopStore } from '../LoopStore';
import { useShallow } from 'zustand/react/shallow';
import { AudioEngine } from '../../audio-engine/AudioEngine';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface LoopPadProps {
  trackId: string;
  loopId: string;
  label: string;
  instrumentType: 'kick' | 'clap' | 'tops' | 'bass' | 'chords' | 'vocal' | 'adds' | 'fx';
  onPress: () => void;
  color: string;
}

const ICON_MAP: Record<string, string> = {
  kick: 'album', // specific for drum/kick
  clap: 'hand-back-right', // closest to clap
  tops: 'chart-bubble', // abstract for tops
  bass: 'speaker',
  chords: 'piano', // valid
  vocal: 'microphone',
  adds: 'music-clef-treble',
  fx: 'creation', // valid replacement for sparkles/wand
};

// --- Worklet Helpers ---

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  "worklet";
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  "worklet";
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", x, y,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", x, y,
    "Z"
  ].join(" ");
};

export const LoopPad: React.FC<LoopPadProps> = ({
  trackId,
  loopId,
  label,
  instrumentType,
  onPress,
  color,
}) => {
  const { isActive, isQueued, bpm } = useLoopStore(
    useShallow((state) => {
        const track = state.tracks[trackId];
        return {
            isActive: track?.activeLoopId === loopId,
            isQueued: track?.queuedLoopId === loopId,
            bpm: state.bpm,
        };
    })
  );

  const animatedProgress = useSharedValue(0);

  useFrameCallback(() => {
    if (isActive) {
        const engine = AudioEngine.getInstance();
        const barDuration = (60 / bpm) * 4;
        // Drive progress from the hardware audio clock
        animatedProgress.value = (engine.currentTime % barDuration) / barDuration;
    } else {
        animatedProgress.value = 0;
    }
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    // Pulse effect if queued
    if (isQueued) {
        return {
            backgroundColor: withRepeat(
                withSequence(
                    withTiming(`${color}66`, { duration: 400 }),
                    withTiming('transparent', { duration: 400 })
                ),
                -1,
                true
            ),
            borderColor: color,
        };
    }

    return {
      // Use a very dim version of the color for the background so the wipe stands out
      backgroundColor: withTiming(isActive ? `${color}22` : 'transparent', { duration: 200 }),
      borderColor: color,
    };
  }, [isQueued, isActive, color]);

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: color,
    };
  }, [color]);

  const animatedProps = useAnimatedProps(() => {
    const endAngle = animatedProgress.value * 360;
    const path = describeArc(50, 50, 70, 0, endAngle);
    return { d: path };
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <Animated.View style={[styles.pad, animatedContainerStyle]}>
        {isActive && (
           <View style={[StyleSheet.absoluteFill, styles.progressOverlay]}>
             <Svg viewBox="0 0 100 100" style={styles.svg}>
               <AnimatedPath
                 animatedProps={animatedProps}
                 fill={color}
                 fillOpacity={0.6}
               />
             </Svg>
           </View>
        )}

        <View style={styles.content}>
          <MaterialCommunityIcons 
            name={ICON_MAP[instrumentType] as any} 
            size={12} 
            color={color} 
          />
          <View style={styles.textContainer}>
            <Animated.Text style={[styles.instrumentText, animatedTextStyle]}>
              {instrumentType.toUpperCase()}
            </Animated.Text>
            <Animated.Text style={[styles.labelText, animatedTextStyle]}>
              {label}
            </Animated.Text>
          </View>
        </View>

        {isQueued && (
          <View style={[styles.queueIndicator, { backgroundColor: color }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 44,
    marginBottom: 4,
  },
  pad: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  instrumentText: {
    display: 'none',
  },
  labelText: {
    fontSize: 7,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressOverlay: {
    zIndex: 1,
  },
  svg: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 4.0 }], 
  },
  queueIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    borderWidth: 0.5,
    borderColor: COLORS.background,
  }
});
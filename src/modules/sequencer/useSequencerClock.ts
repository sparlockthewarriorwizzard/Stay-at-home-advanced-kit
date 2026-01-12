import { useState, useEffect, useRef, useCallback } from 'react';

// Pure helper for testing
export const bpmToSecondsPerStep = (bpm: number): number => {
    // 16th notes
    return (60.0 / bpm) / 4;
};

interface UseSequencerClockProps {
  bpm: number;
  steps?: number;
  onStep?: (step: number) => void;
}

interface SequencerClock {
  currentStep: number;
  isPlaying: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export const useSequencerClock = ({
  bpm,
  steps = 16,
  onStep,
}: UseSequencerClockProps): SequencerClock => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs for timing to avoid re-renders causing drift
  const nextNoteTimeRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

  const nextNote = useCallback(() => {
    const secondsPerStep = bpmToSecondsPerStep(bpm);
    nextNoteTimeRef.current += secondsPerStep;

    // Advance step
    currentStepRef.current = (currentStepRef.current + 1) % steps;

    setCurrentStep(currentStepRef.current);
    if (onStep) {
        onStep(currentStepRef.current);
    }
  }, [bpm, steps, onStep]);

  const scheduler = useCallback(() => {
    // while there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    const currentTime = Date.now() / 1000;

    // If we're too far behind, reset
    if (nextNoteTimeRef.current < currentTime - 0.2) {
        nextNoteTimeRef.current = currentTime;
    }

    while (nextNoteTimeRef.current < currentTime + scheduleAheadTime) {
      nextNote();
    }

    if (isPlaying) {
        timerIdRef.current = setTimeout(scheduler, lookahead);
    }
  }, [isPlaying, nextNote, scheduleAheadTime]);

  const start = useCallback(() => {
    if (isPlaying) {return;}

    // Initialize timing
    currentStepRef.current = -1; // Start before 0 so first step is 0
    nextNoteTimeRef.current = Date.now() / 1000;

    setIsPlaying(true);
    timerIdRef.current = setTimeout(() => {
        scheduler();
    }, 0);
  }, [isPlaying, scheduler]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setCurrentStep(0);
    currentStepRef.current = 0;
  }, [stop]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
    };
  }, []);

  return {
    currentStep,
    isPlaying,
    start,
    stop,
    reset,
  };
};

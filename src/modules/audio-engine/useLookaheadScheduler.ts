import { useEffect, useRef } from 'react';
import { AudioBuffer } from 'react-native-audio-api';
import { AudioEngine } from './AudioEngine';

export interface ScheduledNote {
  time: number; // in seconds relative to sequence start
  buffer: AudioBuffer;
}

const LOOKAHEAD_WINDOW = 0.1; // 100ms
const SCHEDULER_INTERVAL = 25; // 25ms

export const useLookaheadScheduler = (isPlaying: boolean, notes: ScheduledNote[]) => {
  const scheduledNotesRef = useRef<Set<number>>(new Set());
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      scheduledNotesRef.current.clear();
      return;
    }

    const scheduler = () => {
      const engine = AudioEngine.getInstance();
      const currentTime = engine.currentTime;

      // Find notes within lookahead window
      notes.forEach((note, index) => {
        if (
          note.time >= currentTime &&
          note.time < currentTime + LOOKAHEAD_WINDOW &&
          !scheduledNotesRef.current.has(index)
        ) {
          // Schedule it!
          engine.playBuffer(note.buffer, note.time);
          scheduledNotesRef.current.add(index);
        }
      });
    };

    // Run immediately and then on interval
    scheduler();
    timerIdRef.current = setInterval(scheduler, SCHEDULER_INTERVAL);

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    };
  }, [isPlaying, notes]);
};

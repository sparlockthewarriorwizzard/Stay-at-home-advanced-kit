import { create } from 'zustand';
import { AudioBuffer } from 'react-native-audio-api';
import { COLORS } from '../../constants/Theme';
import NativeLoopEngine from './NativeLoopEngine';

export interface TrackState {
  id: string;
  name: string;
  color: string;
  activeLoopId: string | null;
  queuedLoopId: string | null;
}

export interface ArrangementEvent {
  id: string;
  trackId: string;
  patternId: string; 
  startBar: number;
  duration: number;
  isMuted?: boolean;
}

interface LoopStore {
  tracks: Record<string, TrackState>;
  arrangement: ArrangementEvent[];
  buffers: Record<string, AudioBuffer>;
  isPlaying: boolean;
  bpm: number;
  
  // Actions
  toggleLoop: (trackId: string, loopId: string) => void;
  setPlaying: (playing: boolean) => void;
  tickQuantization: () => void;
  addClip: (clip: ArrangementEvent) => void;
  removeClip: (id: string) => void;
  setBuffers: (buffers: Record<string, AudioBuffer>) => void;
}

export const useLoopStore = create<LoopStore>((set, get) => ({
  tracks: {
    'track1': { id: 'track1', name: 'KICK', color: COLORS.kick, activeLoopId: null, queuedLoopId: null },
    'track2': { id: 'track2', name: 'CLAP', color: COLORS.clap, activeLoopId: null, queuedLoopId: null },
    'track3': { id: 'track3', name: 'TOPS', color: COLORS.tops, activeLoopId: null, queuedLoopId: null },
    'track4': { id: 'track4', name: 'BASS', color: COLORS.bass, activeLoopId: null, queuedLoopId: null },
    'track5': { id: 'track5', name: 'CHORDS', color: COLORS.chords, activeLoopId: null, queuedLoopId: null },
    'track6': { id: 'track6', name: 'VOCAL', color: COLORS.vocal, activeLoopId: null, queuedLoopId: null },
    'track7': { id: 'track7', name: 'ADDS', color: COLORS.adds, activeLoopId: null, queuedLoopId: null },
    'track8': { id: 'track8', name: 'FX', color: COLORS.fx, activeLoopId: null, queuedLoopId: null },
  },
  arrangement: [
    { id: '1', trackId: 'track1', patternId: 'kick1', startBar: 0, duration: 4 },
    { id: '2', trackId: 'track2', patternId: 'clap1', startBar: 0, duration: 4 },
    { id: '3', trackId: 'track3', patternId: 'tops2', startBar: 4, duration: 4 },
    { id: '4', trackId: 'track1', patternId: 'kick2', startBar: 4, duration: 4, isMuted: true },
    { id: '5', trackId: 'track5', patternId: 'chords1', startBar: 2, duration: 8 },
  ],
  buffers: {},
  isPlaying: false,
  bpm: 86,

  setBuffers: (buffers) => set({ buffers }),
  // ... rest of actions remain similar for now

  toggleLoop: (trackId, loopId) => {
    const state = get();
    const track = state.tracks[trackId];
    if (!track) return;

    // 1. If global transport is stopped, Start Everything Immediately (First Press)
    if (!state.isPlaying) {
        // Stop old loop if any (shouldn't be, but safety first)
        if (track.activeLoopId) NativeLoopEngine.getInstance().stopLoop(track.activeLoopId);
        
        NativeLoopEngine.getInstance().playLoop(trackId, loopId);
        set({ 
            isPlaying: true,
            tracks: { ...state.tracks, [trackId]: { ...track, activeLoopId: loopId, queuedLoopId: null } } 
        });
        return;
    }

    // 2. Strict Quantization Mode
    // All actions (Start, Stop, Switch) are queued for the next bar
    if (track.activeLoopId === loopId) {
      // Toggle Off -> Queue Stop
      set({ tracks: { ...state.tracks, [trackId]: { ...track, queuedLoopId: 'STOP' } } });
    } else {
      // Switch / Start -> Queue Loop
      set({ tracks: { ...state.tracks, [trackId]: { ...track, queuedLoopId: loopId } } });
    }
  },

  setPlaying: (playing) => {
    if (!playing) {
        NativeLoopEngine.getInstance().stopAll();
        set((state) => {
            const newTracks = { ...state.tracks };
            Object.keys(newTracks).forEach(id => {
                newTracks[id] = { ...newTracks[id], activeLoopId: null, queuedLoopId: null };
            });
            return { isPlaying: false, tracks: newTracks };
        });
    } else {
        set({ isPlaying: true });
    }
  },

  tickQuantization: () => {
    const state = get();
    const newTracks = { ...state.tracks };
    let changed = false;

    Object.keys(newTracks).forEach((trackId) => {
      const track = newTracks[trackId];
      if (track.queuedLoopId) {
        changed = true;
        if (track.queuedLoopId === 'STOP') {
          if (track.activeLoopId) NativeLoopEngine.getInstance().stopLoop(track.activeLoopId);
          newTracks[trackId] = { ...track, activeLoopId: null, queuedLoopId: null };
        } else {
          if (track.activeLoopId) NativeLoopEngine.getInstance().stopLoop(track.activeLoopId);
          NativeLoopEngine.getInstance().playLoop(trackId, track.queuedLoopId);
          newTracks[trackId] = { ...track, activeLoopId: track.queuedLoopId, queuedLoopId: null };
        }
      }
    });

    if (changed) set({ tracks: newTracks });
  },
  addClip: (clip) => set((state) => ({ arrangement: [...state.arrangement, clip] })),
  removeClip: (id) => set((state) => ({ arrangement: state.arrangement.filter((c) => c.id !== id) })),
}));


import { COLORS } from '../constants/Theme';

export interface Instrument {
  id: string;
  name: string;
  type: 'kick' | 'clap' | 'tops' | 'bass' | 'chords' | 'vocal' | 'adds' | 'fx';
  uri?: string;
  asset?: any; // For require() assets
  color?: string;
  icon?: string;
}

export interface SoundKit {
  id: string;
  name: string;
  description?: string;
  instruments: Instrument[];
}

export interface SequencerState {
  steps: Record<string, boolean[]>; // instrumentId -> 16 steps
  bpm: number;
  activeKitId: string;
}

export const TRACK_DEFINITIONS = [
  { id: 'track1', name: 'Kick', type: 'kick', color: COLORS.kick },
  { id: 'track2', name: 'Clap', type: 'clap', color: COLORS.clap },
  { id: 'track3', name: 'Tops', type: 'tops', color: COLORS.tops },
  { id: 'track4', name: 'Bass', type: 'bass', color: COLORS.bass },
  { id: 'track5', name: 'Chords', type: 'chords', color: COLORS.chords },
  { id: 'track6', name: 'Vocal', type: 'vocal', color: COLORS.vocal },
  { id: 'track7', name: 'Adds', type: 'adds', color: COLORS.adds },
  { id: 'track8', name: 'FX', type: 'fx', color: COLORS.fx },
];

export interface Instrument {
  id: string;
  name: string;
  uri?: string;
  asset?: any; // For require() assets
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

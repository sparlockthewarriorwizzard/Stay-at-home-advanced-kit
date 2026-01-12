import { AudioPlayer } from 'expo-audio';
import { Instrument } from '../../types/MusicTypes';

export class AudioEngine {
  private static instance: AudioEngine;
  private players: Map<string, AudioPlayer> = new Map();

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Loads an instrument into the engine.
   * A unique key is generated based on the instrument ID to allow polyphony.
   */
  public async loadInstrument(instrument: Instrument): Promise<void> {
    const key = instrument.id;
    if (this.players.has(key)) {
      return;
    }

    try {
      const source = instrument.asset || instrument.uri;
      if (!source) {
        throw new Error(`No asset or URI provided for instrument: ${instrument.name}`);
      }

      // Instantiate player. updateInterval 100ms is standard for status updates.
      const player = new AudioPlayer(source, 100);
      this.players.set(key, player);
    } catch (error) {
      console.error(`Error loading instrument ${instrument.name}:`, error);
      throw error;
    }
  }

  /**
   * Triggers a sound by its instrument ID.
   */
  public async playInstrument(instrumentId: string): Promise<void> {
    const player = this.players.get(instrumentId);
    if (player) {
      try {
        // For rapid triggering in a sequencer, we seek to 0 and play.
        if (player.playing) {
          player.seekTo(0);
        }
        player.play();
      } catch (error) {
        console.error(`Error playing instrument ${instrumentId}:`, error);
      }
    } else {
      console.warn(`Instrument not loaded: ${instrumentId}`);
    }
  }

  /**
   * Legacy method for playing by URI (used by User Affirmation)
   */
  public async loadSound(uri: string): Promise<void> {
      // Treat the URI itself as the ID for backward compatibility
      await this.loadInstrument({ id: uri, name: 'User Recording', uri });
  }

  public async playSound(uri: string): Promise<void> {
      await this.playInstrument(uri);
  }

  public stopAll(): void {
    for (const player of this.players.values()) {
      player.pause();
      player.seekTo(0);
    }
  }

  public unloadAll(): void {
    for (const [id, player] of this.players.entries()) {
      try {
        player.remove();
      } catch (e) {
        console.error(`Failed to remove player ${id}`, e);
      }
    }
    this.players.clear();
  }
}
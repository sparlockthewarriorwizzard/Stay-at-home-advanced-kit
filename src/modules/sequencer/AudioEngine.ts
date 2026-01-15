import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { Instrument, SoundKit } from '../../types/MusicTypes';

export class AudioEngine {
  private static instance: AudioEngine;
  // Map of instrument ID to a pool of players
  private playerPools: Map<string, AudioPlayer[]> = new Map();
  private readonly POOL_SIZE = 4; // Allow up to 4 overlapping sounds per instrument

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Preloads all instruments in a sound kit.
   */
  public async loadKit(kit: SoundKit): Promise<void> {
    const promises = kit.instruments.map(inst => this.loadInstrument(inst));
    await Promise.all(promises);
  }

  /**
   * Loads an instrument into the engine.
   * Creates a pool of players for the instrument to allow polyphony.
   */
  public async loadInstrument(instrument: Instrument): Promise<void> {
    const key = instrument.id;
    if (this.playerPools.has(key)) {
      return;
    }

    try {
      const source = instrument.asset || instrument.uri;
      
      if (!source) {
        throw new Error(`No asset or URI provided for instrument: ${instrument.name}`);
      }

      // Create a pool of players
      const pool: AudioPlayer[] = [];
      console.log(`[AudioEngine] Loading instrument: ${instrument.name}, Source: ${source}`);
      
      for (let i = 0; i < this.POOL_SIZE; i++) {
        const player = createAudioPlayer(source, { updateInterval: 100 });
        player.volume = 1.0; 
        player.muted = false;
        player.loop = false;
        pool.push(player);
      }
      this.playerPools.set(key, pool);
    } catch (error) {
      console.error(`Error loading instrument ${instrument.name}:`, error);
      throw error;
    }
  }

  /**
   * Triggers a sound by its instrument ID.
   * Finds the first available player in the pool or steals the oldest one.
   */
  public async playInstrument(instrumentId: string): Promise<void> {
    const pool = this.playerPools.get(instrumentId);
    if (pool && pool.length > 0) {
      try {
        const availablePlayer = pool.find(p => !p.playing);
        const playerToUse = availablePlayer || pool[0]; 

        console.log(`[AudioEngine] Triggering ${instrumentId}. Pool size: ${pool.length}, Reuse: ${!availablePlayer}`);

        if (playerToUse.playing) {
            try {
                playerToUse.seekTo(0);
            } catch (e) {
                console.warn(`[AudioEngine] seekTo(0) failed`, e);
            }
        }
        
        playerToUse.play();
        
        // Optimization: Rotate the used player to the end of the list so we don't pick it again immediately
        const index = pool.indexOf(playerToUse);
        if (index > -1) {
            pool.splice(index, 1);
            pool.push(playerToUse);
        }

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
    for (const pool of this.playerPools.values()) {
        pool.forEach(player => {
            if (player.playing) {
                player.pause();
                player.seekTo(0);
            }
        });
    }
  }

  public unloadAll(): void {
    for (const pool of this.playerPools.values()) {
        pool.forEach(player => {
            try {
                player.remove();
            } catch (e) {
                 console.error(`Failed to remove player`, e);
            }
        });
    }
    this.playerPools.clear();
  }
}
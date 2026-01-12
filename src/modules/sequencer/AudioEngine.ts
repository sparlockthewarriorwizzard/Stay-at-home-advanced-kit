import { AudioPlayer } from 'expo-audio';

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

  public async loadSound(uri: string): Promise<void> {
    if (this.players.has(uri)) {
      return;
    }

    try {
      // In expo-audio, we create a player with the source.
      // updateInterval is set to 100ms by default in the hook, we'll match that.
      const player = new AudioPlayer(uri, 100);

      // Wait for it to load? expo-audio players might auto-load or have a loading state.
      // We'll store it immediately.
      this.players.set(uri, player);
    } catch (error) {
      console.error('Error loading sound:', error);
      throw error;
    }
  }

  public async playSound(uri: string): Promise<void> {
    const player = this.players.get(uri);
    if (player) {
      try {
        // Reset to start if needed, or just play.
        // For a sequencer, we usually want re-triggering.
        // If it's already playing, we might need to seek to 0.
        if (player.playing) {
            player.seekTo(0);
        }
        player.play();
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    } else {
      // Auto-load if not found? Or warn.
      console.warn(`Sound not loaded for URI: ${uri}`);
    }
  }

  public stopSound(uri: string): void {
      const player = this.players.get(uri);
      if (player) {
          player.pause();
          player.seekTo(0);
      }
  }

  public unloadSound(uri: string): void {
    const player = this.players.get(uri);
    if (player) {
      try {
        player.remove(); // Release resources
        this.players.delete(uri);
      } catch (error) {
        console.error('Error unloading sound:', error);
      }
    }
  }

  public unloadAllSounds(): void {
    for (const uri of this.players.keys()) {
      this.unloadSound(uri);
    }
  }
}

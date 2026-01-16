import { AudioContext, AudioBuffer, AudioBufferSourceNode } from 'react-native-audio-api';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

export class AudioEngine {
  private static instance: AudioEngine;
  public context: AudioContext;

  private constructor() {
    this.context = new AudioContext();
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Loads an audio file from a URI into a native AudioBuffer.
   * @param uri Local file URI (e.g., file://...)
   */
  public async loadBuffer(uri: string): Promise<AudioBuffer> {
    try {
      // Read file as Base64 string
      const encoding = FileSystem.EncodingType?.Base64 || 'base64';
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding,
      });

      // Convert to ArrayBuffer
      const buffer = Buffer.from(base64, 'base64');
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset, 
        buffer.byteOffset + buffer.byteLength
      );

      // Decode into Native AudioBuffer
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`[AudioEngine] Failed to load buffer: ${uri}`, error);
      throw error;
    }
  }

  /**
   * Schedules a buffer to play at a specific time.
   * @param buffer The AudioBuffer to play
   * @param time The time (in seconds) on the AudioContext clock to start playback
   */
  public playBuffer(buffer: AudioBuffer, time: number = 0): AudioBufferSourceNode {
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.start(time);
    return source;
  }

  /**
   * Returns current audio time
   */
  public get currentTime(): number {
      return this.context.currentTime;
  }

  /**
   * Closes the AudioContext and releases native resources.
   */
  public async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
    AudioEngine.instance = null as any;
  }
}

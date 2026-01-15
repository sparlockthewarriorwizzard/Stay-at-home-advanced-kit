import { AudioEngine } from '../AudioEngine';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='), // minimal valid wav base64
  EncodingType: { Base64: 'base64' },
}));

// Mock react-native-audio-api
jest.mock('react-native-audio-api', () => {
  return {
    AudioContext: jest.fn().mockImplementation(() => ({
      decodeAudioData: jest.fn().mockResolvedValue({ 
        duration: 2.0, 
        numberOfChannels: 2, 
        sampleRate: 44100, 
        length: 88200 
      }),
      createBufferSource: jest.fn().mockReturnValue({
        buffer: null,
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      }),
      destination: {},
      currentTime: 0,
      state: 'running',
    })),
  };
});

describe('AudioEngine', () => {
  let engine: AudioEngine;

  beforeEach(() => {
    // Reset singleton if possible or just get instance
    engine = AudioEngine.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = AudioEngine.getInstance();
    const instance2 = AudioEngine.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize AudioContext', () => {
    expect(engine.context).toBeDefined();
  });

  it('should load a buffer', async () => {
    // Mock fetch or file system if used. 
    // For now assuming loadBuffer takes a URI/Path
    const buffer = await engine.loadBuffer('test-uri');
    expect(buffer).toBeDefined();
    expect(buffer.duration).toBe(2.0);
  });
});

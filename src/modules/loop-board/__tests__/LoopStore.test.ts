import { useLoopStore } from '../LoopStore';

// Mock dependencies
jest.mock('../NativeLoopEngine', () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn().mockReturnValue({
        loadAll: jest.fn(),
        playLoop: jest.fn(),
        stopLoop: jest.fn(),
        stopAll: jest.fn(),
        getLoadedBuffers: jest.fn().mockReturnValue({ 'test-loop': {} }),
      }),
    },
  };
});

jest.mock('react-native-audio-api', () => ({
  AudioContext: jest.fn(),
}));

describe('LoopStore', () => {
  it('should initialize with default tracks and empty buffers', () => {
    const state = useLoopStore.getState();
    expect(Object.keys(state.tracks).length).toBe(8);
    expect(state.buffers).toEqual({});
  });

  it('should update buffers via setBuffers', () => {
    const mockBuffers = { 'loop1': { duration: 1 } as any };
    useLoopStore.getState().setBuffers(mockBuffers);
    expect(useLoopStore.getState().buffers).toEqual(mockBuffers);
  });
});

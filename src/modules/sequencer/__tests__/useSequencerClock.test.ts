import { bpmToSecondsPerStep } from '../useSequencerClock';

describe('useSequencerClock Logic', () => {
  test('bpmToSecondsPerStep calculates correctly for 120 BPM', () => {
    // 120 BPM = 2 beats per second
    // 1 beat (quarter note) = 0.5 seconds
    // 16th note = 0.5 / 4 = 0.125 seconds
    expect(bpmToSecondsPerStep(120)).toBeCloseTo(0.125);
  });

  test('bpmToSecondsPerStep calculates correctly for 60 BPM', () => {
    // 60 BPM = 1 beat per second
    // 1 beat = 1.0 seconds
    // 16th note = 0.25 seconds
    expect(bpmToSecondsPerStep(60)).toBeCloseTo(0.25);
  });
});

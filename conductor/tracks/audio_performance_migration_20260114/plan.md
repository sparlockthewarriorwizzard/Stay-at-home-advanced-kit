# Track: High-Performance Audio Migration

**Goal:** Migrate core audio architecture to `react-native-audio-api` to resolve sync drift and OOM issues, implementing a lookahead scheduler for sample-accurate playback.

**Status:** PENDING

## Phase 1: Environment & Engine Setup
- [x] **Task 1: Install and Configure `react-native-audio-api`**
    - Install `react-native-audio-api` and dependencies.
    - Configure `app.json` for New Architecture and permissions.
    - Create a development build via EAS to verify native module integration.
    - *Test:* Verify `AudioContext` can be initialized in a development build.
- [x] **Task 2: Implement Core `AudioEngine` Wrapper**
    - Create `src/modules/audio-engine/AudioEngine.ts` as a singleton wrapper around `AudioContext`.
    - Implement `loadBuffer(uri)` for decoding audio into native memory.
    - Implement `playBuffer(buffer, time)` for scheduled playback.
    - *Test:* Unit tests for buffer loading and basic scheduling logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Environment & Engine Setup' (Protocol in workflow.md)

## Phase 2: Loop Board Migration
- [ ] **Task 3: Refactor `LoopStore` for Native Buffers**
    - Update `LoopStore` to hold references to `AudioBuffer`s instead of URIs/IDs.
    - Implement preloading logic for the "Default" kit on app startup.
    - *Test:* Verify all buffers for the default kit are loaded and held in native memory.
- [ ] **Task 4: High-Performance `LoopPad` Implementation**
    - Update `LoopPad` to use the new `AudioEngine` for triggering.
    - Sync the "radial wipe" animation to `audioContext.currentTime` for sub-millisecond visual alignment.
    - *Test:* Verify touch-to-sound latency is perceptibly lower than `expo-av`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Loop Board Migration' (Protocol in workflow.md)

## Phase 3: Sequencer & Lookahead Scheduler
- [ ] **Task 5: Implement Lookahead Scheduler**
    - Create `useLookaheadScheduler` hook.
    - Implement the "Tale of Two Clocks" pattern: JS interval (25ms) feeding the Native Audio Clock (100ms window).
    - *Test:* Verify sequencer events are scheduled ahead of time and play at exact sample offsets.
- [ ] **Task 6: Refactor `SequencerTimelineView`**
    - Connect the timeline playhead to `audioContext.currentTime`.
    - Ensure clip playback is driven by the lookahead scheduler.
    - *Test:* Long-running sync test (3+ minutes) to ensure zero drift between visual playhead and audio.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Sequencer & Lookahead Scheduler' (Protocol in workflow.md)

## Phase 4: Vocal Overdub & Alignment
- [ ] **Task 7: Refactor `VocalOverdubScreen`**
    - Implement sample-accurate recording start triggered by the audio clock.
    - Ensure backing loops and metronome are perfectly aligned with the recorded vocal buffer.
    - *Test:* Verify recorded audio aligns exactly with the backing track grid.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Vocal Overdub & Alignment' (Protocol in workflow.md)

## Phase 5: Final Optimization & EAS Build
- [ ] **Task 8: Global Memory & Performance Audit**
    - Enable `largeHeap` in Android Manifest.
    - Verify buffer disposal logic when switching kits or closing the app.
    - Perform final EAS builds for both iOS and Android.
    - *Test:* Stress test with 8+ simultaneous high-quality loops to confirm no OOM crashes.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Final Optimization & EAS Build' (Protocol in workflow.md)

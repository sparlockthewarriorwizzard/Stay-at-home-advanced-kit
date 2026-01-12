# Track Plan: Implement Step Sequencer Core & Audio Engine

## Phase 1: Audio Engine ## Phase 1: Audio Engine & Clock Logic Clock Logic [checkpoint: 9317329]
- [~] Task: Create `src/modules/sequencer/AudioEngine.ts` to manage `Sound` loading and playback.
- [~] Task: Implement a precision timer/scheduler hook (`useSequencerClock`) to handle BPM and step progression (aiming for <20ms drift).
- [x] Task: Write unit tests for the clock logic (verifying BPM to MS conversion and step cycling). (f5385a7)
- [x] Task: Conductor - User Manual Verification 'Audio Engine & Clock Logic' (Protocol in workflow.md)

## Phase 2: Grid UI Component [checkpoint: a812765]
- [x] Task: Create `src/modules/sequencer/SequencerGrid.tsx` - a visual component rendering 16 steps. (ea377ad)
- [x] Task: Implement "toggle" logic for steps (active/inactive state). (merged)
- [x] Task: Add "Playhead" visual state (highlighting the current step as the clock ticks). (b9f4909)
- [x] Task: Style the grid with the "Dark Futuristic Neon" aesthetic. (merged)
- [x] Task: Conductor - User Manual Verification 'Grid UI Component' (Protocol in workflow.md)

## Phase 3: Integration ## Phase 3: Integration & Sample Triggering Sample Triggering [checkpoint: 6e5280e]
- [~] Task: Create `src/screens/SequencerScreen.tsx` and register it in `RootNavigator`.
- [ ] Task: Update `AffirmationRecordScreen` to navigate to `SequencerScreen` (passing the audio URI).
- [x] Task: Integrate `AudioEngine` with `SequencerGrid` - triggering the sample when the playhead hits an active step. (merged)
- [x] Task: Add Play/Stop and BPM controls to the screen. (28e2c53)
- [x] Task: Conductor - User Manual Verification 'Integration & Sample Triggering' (Protocol in workflow.md)

## Phase 4: Polish & Performance Tuning
- [x] Task: Test rhythm stability on device (or best effort). (b4cf1d9)
- [ ] Task: Optimize audio loading (ensure `prepareToPlayAsync` is called).
- [ ] Task: Conductor - User Manual Verification 'Polish & Performance Tuning' (Protocol in workflow.md)

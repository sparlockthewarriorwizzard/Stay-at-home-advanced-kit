# Track Plan: Implement Step Sequencer Core & Audio Engine

## Phase 1: Audio Engine & Clock Logic
- [~] Task: Create `src/modules/sequencer/AudioEngine.ts` to manage `Sound` loading and playback.
- [~] Task: Implement a precision timer/scheduler hook (`useSequencerClock`) to handle BPM and step progression (aiming for <20ms drift).
- [x] Task: Write unit tests for the clock logic (verifying BPM to MS conversion and step cycling). (f5385a7)
- [ ] Task: Conductor - User Manual Verification 'Audio Engine & Clock Logic' (Protocol in workflow.md)

## Phase 2: Grid UI Component
- [ ] Task: Create `src/modules/sequencer/SequencerGrid.tsx` - a visual component rendering 16 steps.
- [ ] Task: Implement "toggle" logic for steps (active/inactive state).
- [ ] Task: Add "Playhead" visual state (highlighting the current step as the clock ticks).
- [ ] Task: Style the grid with the "Dark Futuristic Neon" aesthetic.
- [ ] Task: Conductor - User Manual Verification 'Grid UI Component' (Protocol in workflow.md)

## Phase 3: Integration & Sample Triggering
- [ ] Task: Create `src/screens/SequencerScreen.tsx` and register it in `RootNavigator`.
- [ ] Task: Update `AffirmationRecordScreen` to navigate to `SequencerScreen` (passing the audio URI).
- [ ] Task: Integrate `AudioEngine` with `SequencerGrid` - triggering the sample when the playhead hits an active step.
- [ ] Task: Add Play/Stop and BPM controls to the screen.
- [ ] Task: Conductor - User Manual Verification 'Integration & Sample Triggering' (Protocol in workflow.md)

## Phase 4: Polish & Performance Tuning
- [ ] Task: Test rhythm stability on device (or best effort).
- [ ] Task: Optimize audio loading (ensure `prepareToPlayAsync` is called).
- [ ] Task: Conductor - User Manual Verification 'Polish & Performance Tuning' (Protocol in workflow.md)

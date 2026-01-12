# Track Plan: Integrate Professional Sound Kits & Sample Library

## Phase 1: Asset Preparation & Data Structure
- [x] Task: Create `src/assets/sounds` and populate with placeholder drum samples (Kick, Snare, HiHat). (5802834)
- [x] Task: Define `SoundKit` and `Instrument` interfaces in `src/types/MusicTypes.ts`. (merged)
- [x] Task: Create a `SoundKitService` to manage available kits and their asset paths. (merged)
- [ ] Task: Conductor - User Manual Verification 'Asset Preparation & Data Structure' (Protocol in workflow.md)

## Phase 2: Audio Engine Polyphony [checkpoint: 98048e4]
- [x] Task: Refactor `AudioEngine` to support multiple simultaneous players (one per instrument). (429880c)
- [x] Task: Add `loadKit(kit: SoundKit)` method to `AudioEngine` to preload all sounds in a kit. (44a9a86)
- [x] Task: Update `playSound` to accept an `instrumentId` in addition to (or instead of) a URI. (merged)
- [x] Task: Conductor - User Manual Verification 'Audio Engine Polyphony' (Protocol in workflow.md)

## Phase 3: Multi-Track State & UI
- [ ] Task: Refactor `SequencerScreen` state to hold a 2D array (or map) of steps: `steps[instrumentId][stepIndex]`.
- [ ] Task: Create `InstrumentSelector` component to switch the active "Lane" being edited on the grid.
- [ ] Task: Update `onStepTrigger` to trigger the correct sound for the current step's active instruments.
- [ ] Task: Conductor - User Manual Verification 'Multi-Track State & UI' (Protocol in workflow.md)

## Phase 4: Polish & Integration
- [ ] Task: Add "Kit Selector" UI to `SequencerScreen`.
- [ ] Task: Verify timing and performance with multiple sounds triggering on the same step.
- [ ] Task: Conductor - User Manual Verification 'Polish & Integration' (Protocol in workflow.md)

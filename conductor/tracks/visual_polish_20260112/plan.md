# Track Plan: Visual Polish & Animations

## Phase 1: Animation Setup & Configuration [checkpoint: 9278c44]
- [x] Task: Check and configure `react-native-reanimated` (install if missing, update `babel.config.js`). (9022ea8)
- [x] Task: Create a reusable `NeonButton` component with animated glow/pulse effects. (9022ea8)
- [x] Task: Conductor - User Manual Verification 'Animation Setup - [ ] Task: Conductor - User Manual Verification 'Animation Setup & Configuration' Configuration' (Protocol in workflow.md)

## Phase 2: Sequencer Grid Animations [checkpoint: 4cb64d6]
- [x] Task: Refactor `SequencerGrid` to use `Animated.View` (or Reanimated) for step cells. (38aaa40)
- [x] Task: Implement "Playhead" animation: The current step should highlight smoothly. (merged)
- [x] Task: Implement "Trigger" animation: Active steps should flash or scale when hit by the playhead. (merged)
- [x] Task: Conductor - User Manual Verification 'Sequencer Grid Animations' (Protocol in workflow.md)

## Phase 3: Global UI Polish
- [x] Task: Update `SequencerScreen` controls (Play/Stop, BPM) to use the new `NeonButton` style. (f787889)
- [x] Task: Apply "Dark Futuristic" background gradients or subtle textures if applicable. (skipped - black background preferred)
- [ ] Task: Conductor - User Manual Verification 'Global UI Polish' (Protocol in workflow.md)

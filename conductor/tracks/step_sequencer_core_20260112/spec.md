# Track Specification: Implement Step Sequencer Core & Audio Engine

## 1. Objective
To implement the core "music creation" capability of Able Music: a 16-step sequencer that allows users to rhythmically trigger their recorded affirmation samples. This track focuses on the frontend Grid UI and the underlying audio engine logic to handle timing, looping, and sample playback.

## 2. Core Requirements
*   **Audio Engine:** Implement a robust playback engine using `expo-audio` (or native bridge if necessary) that can handle low-latency triggering of samples.
*   **Grid UI:** Build a 4x4 or linear 16-step grid interface. Users must be able to toggle steps on/off.
*   **Sample Integration:** The sequencer must be able to load the user's recorded affirmation (from the previous track) as the primary "Instrument".
*   **Clock & Timing:** Implement a BPM-based clock that cycles through the 16 steps and triggers the sample if a step is active.
*   **Visual Feedback:** The UI must show a "playhead" indicating the current step in the loop.

## 3. User Stories
*   **As a user**, I want to see a grid of buttons representing musical steps.
*   **As a user**, I want to tap a button to "activate" it, so my recorded voice plays at that specific moment in the loop.
*   **As a user**, I want to hit "Play" and hear my voice looping rhythmically according to the pattern I created.
*   **As a user**, I want to adjust the speed (BPM) of the loop.

## 4. Technical Considerations
*   **Performance:** React Native's JS thread may drift. We need to ensure the "Clock" is accurate enough for a basic MVP. If `setInterval` drifts too much, we may need a native module or `requestAnimationFrame` based scheduler.
*   **State:** The sequencer state (active steps, BPM, playing status) should be managed globally (Zustand) or locally within the sequencer component if self-contained.
*   **Audio Handling:** The user's recording (m4a/wav) needs to be loaded into memory (`Sound` object) to ensure instant triggering.

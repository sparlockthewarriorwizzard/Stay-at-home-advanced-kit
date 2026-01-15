# Track Specification: Visual Polish & Animations

## 1. Objective
To refine the user interface of Able Music by injecting the "Dark Futuristic Neon" aesthetic defined in the product guidelines. This track focuses on adding motion, responsiveness, and visual depth to the sequencer grid and controls, moving the app from a functional prototype to a polished experience.

## 2. Core Requirements
*   **Animation Library:** Integrate `react-native-reanimated` (if not already present/usable) or use standard React Native `Animated` API for performant UI updates.
*   **Sequencer Grid Polish:**
    *   **Pulsing Steps:** Active steps should pulse or glow in time with the BPM.
    *   **Playhead Motion:** The movement of the playhead (current step indicator) should be visually distinct (e.g., a moving highlight border).
    *   **Trigger Feedback:** When a step triggers a sound, it should "flash" or scale up briefly.
*   **Neon Styling:** Implement "glow" effects using shadows (iOS) or elevation/borders (Android) to simulate neon lights.
*   **Transitions:** Smooth out the navigation transitions or specific UI element state changes (e.g., switching kits).

## 3. User Stories
*   **As a user**, I want the app to feel "alive" and responsive to the music I'm making.
*   **As a user**, I want clear visual feedback when a drum hit occurs so I can "see" the beat.
*   **As a user**, I want the interface to look like high-end music hardware with glowing lights.

## 4. Technical Considerations
*   **Performance:** Animations must run at 60fps (or native refresh rate) and not block the JS thread, which is critical for audio timing. We should prefer `useNativeDriver: true` or Reanimated worklets.
*   **Dependencies:** Check if `react-native-reanimated` needs to be installed or configured in `babel.config.js`.

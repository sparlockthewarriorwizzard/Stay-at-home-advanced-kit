# Track Specification: Initialize Project Core & Affirmation Recording Flow

## 1. Objective
To establish the foundational codebase for "Able Music" by merging the existing `Stay-at-home-advanced-kit` skeleton into the project root and integrating the `affirmation-flow` module. Crucially, this track involves migrating the audio recording logic from the deprecated `expo-av` to the modern `expo-audio` library to prepare for the low-latency step sequencer.

## 2. Core Requirements
*   **Project Consolidation:** Move `Stay-at-home-advanced-kit` contents to the project root and ensure the app builds and runs.
*   **Module Integration:** Integrate the `affirmation-flow` components (Recorder, Service) into the main source tree.
*   **Audio Migration:** Refactor `useAffirmation.ts` and `AffirmationRecorder.tsx` to use `expo-audio` instead of `expo-av`.
*   **Navigation Setup:** Add the Affirmation/Recording screen to the `RootNavigator`.
*   **Verification:** Ensure audio recording, playback, and uploading work correctly with the new library.

## 3. User Stories
*   **As a developer**, I want a clean, unified project structure so I can build features efficiently.
*   **As a user**, I want to be able to record my voice affirmation using the app's new recorder interface.
*   **As a user**, I want to play back my recording to confirm it sounds good before saving.

## 4. Technical Considerations
*   **Library:** `expo-audio` is the target; `expo-av` is deprecated.
*   **Permissions:** Microphone permissions must be configured in `app.json`/`Info.plist`.
*   **State:** Use Zustand or local state to manage the recording status (idle, recording, stopped).

# Able Music - Technology Stack & Project Brief

## Project Title: Cross-Platform Mobile Step Sequencer & Affirmation Sampler

## 1. Executive Summary
Able Music is a cross-platform mobile application (iOS & Android) that combines voice recording (user affirmations) with a beginner-friendly 16-step sequencer. Users record a short vocal phrase, which is treated as a "sample" triggered rhythmically alongside pre-made drum loops and melodies on a grid interface.

## 2. User Flow (The "Happy Path")
This defines the core journey for a user opening the app:

1.  **Goal Input:**
    *   User enters a personal goal (e.g., "I want to feel more confident").
2.  **AI Generation:**
    *   The app uses AI to generate a specific affirmation text based on that goal.
    *   *Note:* The code for this exists in `extracted_modules/affirmation-flow/AffirmationService.ts` (`generateAffirmation`).
3.  **Voice Recording:**
    *   User records themselves speaking the affirmation.
    *   *Tech Check:* Uses `affirmation-flow` module (needs migration to `expo-audio`).
    *   *Result:* This recording becomes the primary "Sample" for the music track.
4.  **Creation (Step Sequencer):**
    *   User enters the "Grid Controller" / Step Sequencer interface.
    *   The user's recorded affirmation is available as a rhythmic sample.
    *   User builds a track around their voice using:
        *   **Pre-made Kits:** Standard drum sounds (e.g., 909 Kit).
        *   **Artist Library:** Pre-made musical sequences provided by the collaborating creator.
5.  **Export & Share:**
    *   User exports the final audio track (Voice + Beat) to save or share.

## 3. Core Functional Requirements
### A. The Recorder
*   Input metering (visual feedback when talking).
*   Auto-normalization (making the volume consistent).
*   Silence detection (auto-trimming start/end of recording).
*   **Existing Module Reference:** `extracted_modules/affirmation-flow` contains recorder logic and API connections.

### B. The Sequencer (Grid)
*   Standard 16-step grid UI.
*   Polyphony: Ability to play the drum beat and the user's voice simultaneously.
*   Sync: Visual playhead must remain perfectly synced with the audio clock.

### C. Content Library
*   Local database of pre-made "Kits" (drum sounds and loops).
*   Integration of Creator's pre-made sequences.

## 4. Recommended Tech Stack & Architecture
### Application Framework
*   **Base Skeleton:** React Native (based on `Stay-at-home-advanced-kit`).
*   **Frontend:** React (TypeScript), React Navigation, Zustand for state management.
*   **Backend/Services:** Supabase (Auth, Database, Storage), RevenueCat (Subscriptions).

### Audio Engine (Critical)
*   **Requirement:** High-performance native bridges or C++ engine to ensure low latency (< 20ms on Android).
*   **Recommended Frameworks:**
    *   **JUCE:** Industry standard for cross-platform audio DSP.
    *   **AudioKit (v5+):** Excellent for iOS, growing cross-platform support.
    *   **Google Oboe:** Specific for Android low-latency.
*   **Digital Signal Processing (DSP):**
    *   **Time-Stretching:** Library to fit spoken voice to musical beat without changing pitch (e.g., Rubber Band Library).
    *   **Pitch-Shifting:** Optional ability to re-pitch the user's voice.

## 5. Known Challenges
*   **Android Audio Latency:** Primary risk. Must use Oboe or optimized C++ callback buffers.
*   **Rhythmic "Snapping":** Logic system to quantize or time-stretch recording to fit a 4-bar loop.

## 6. Current Project Structure
*   `Stay-at-home-advanced-kit/`: The base React Native skeleton.
*   `extracted_modules/affirmation-flow/`: Existing affirmation recording flow logic.
    *   *Note:* Uses `expo-av` (deprecated). Migration to `expo-audio` or a low-latency native solution is required.

---
*Generated for use with Conductor extension.*
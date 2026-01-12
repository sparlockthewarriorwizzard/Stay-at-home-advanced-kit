# Technology Stack

## Core Application
*   **Language:** TypeScript
*   **Framework:** React Native (Expo) - Based on the `Stay-at-home-advanced-kit` skeleton.
*   **Navigation:** React Navigation (Stack and Tab navigators).
*   **State Management:** Zustand.

## Backend & Services
*   **Database & Auth:** Supabase.
*   **Storage:** Supabase Storage (for audio samples and recordings).
*   **Monetization:** RevenueCat (for subscriptions and paywall management).
*   **AI Integration:** Custom API (as seen in `AffirmationService.ts`) for generating affirmations.

## Audio Infrastructure (High Performance)
*   **Recording & Playback:** `expo-audio` (implemented for core affirmation flow) with future plans for low-latency native bridges (premium) if needed.
*   **Low-Latency Engine:** Requirement for JUCE or Google Oboe to achieve < 20ms latency on Android for the step sequencer.
*   **Digital Signal Processing (DSP):**
    *   **Rubber Band Library:** For high-quality time-stretching and pitch-shifting without changing pitch.
    *   **Custom C++ Callbacks:** For precise 16-step grid synchronization.

## Development Tools
*   **Conductor Extension:** For project management and track implementation.
*   **ESLint/Prettier:** For code quality and consistency.

# Track Specification: Integrate Professional Sound Kits & Sample Library

## 1. Objective
To expand the musical capabilities of Able Music by integrating professional quality drum kits (e.g., Kick, Snare, HiHat) into the sequencer. This involves updating the audio engine to handle polyphony (playing multiple sounds at once), creating a "Kit" management system, and updating the UI to allow users to sequence these new sounds alongside their recorded affirmation.

## 2. Core Requirements
*   **Asset Management:** Import a set of standard drum samples (Kick, Snare, Hat, etc.) into the project assets.
*   **Polyphonic Audio Engine:** Update `AudioEngine` to load multiple sounds simultaneously and trigger them independently without cutting each other off.
*   **Multi-Track Sequencer:** Update the internal state management to handle multiple "tracks" (e.g., Track 1 = Voice, Track 2 = Kick, Track 3 = Snare).
*   **UI Update:**
    *   Add a "Track Selector" or "Instrument Switcher" to the Sequencer screen.
    *   Allow the user to toggle steps for the selected instrument.
*   **Kit System:** Define a data structure for a "Kit" (collection of sounds) and implement a simple selector to switch kits.

## 3. User Stories
*   **As a user**, I want to add a drum beat to my affirmation loop.
*   **As a user**, I want to switch between editing the "Voice" pattern and the "Drums" pattern.
*   **As a user**, I want to choose between different drum kits (e.g., "Classic 909", "Trap", "Lofi").

## 4. Technical Considerations
*   **Performance:** Loading multiple `AudioPlayer` instances might be heavy. We need to manage resources carefully, unloading unused kits.
*   **State Structure:** The `steps` state in `SequencerScreen` needs to migrate from `boolean[]` (16 steps) to `Record<InstrumentId, boolean[]>` or similar.
*   **Assets:** We will use placeholder assets (generated or simple noise bursts) if actual WAV files aren't provided, or source open-license 909 samples.

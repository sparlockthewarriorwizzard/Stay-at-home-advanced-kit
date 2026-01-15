# Track Plan: Loop Board & Live Matrix Engine

**Status:** COMPLETE



## Phase 1: Prototype & Core Engine (Completed)

- [x] Task: Archive old sequencer code.

- [x] Task: Implement `NativeLoopEngine` using `expo-av` (Pivoted from WebView).

- [x] Task: Implement `LoopBoardScreen` with 4 pad layout.

- [x] Task: Integrate with Affirmation flow (navigation update).

- [x] Task: Add "Knobs and Sliders" (Volume & Rate control per pad).



## Phase 2: UI Overhaul - Live Loop Matrix

- [x] Task: Define Color Palette & Theme (Deep Dark Mode + Channel Colors) in `src/types/MusicTypes.ts` or `src/constants/Theme.ts`.

- [x] Task: Create `LoopPad` component with:

    - Rounded corners & Stroke Border (Inactive) vs Solid Fill (Active).

    - Radial Wipe Animation (SVG/Canvas or Reanimated) synced to loop progress.

    - Left-aligned Instrument Icon + Bold/Light Text styling.

- [x] Task: Refactor `LoopBoardScreen` to `LiveLoopMatrix` (Scrollable Grid).

    - Columns: Instruments (Kick, Clap, Bass, etc.).

    - Rows: Variations (Fallen, Eventual, Hunted).

- [x] Task: Implement "Mutually Exclusive Columns" logic (1 pad per track active).

- [x] Task: Implement "Queue" logic (Flash/Pulse pad until next quantization point).



## Phase 3: Navigation & Transport

- [x] Task: Create Top Navigation Bar (App Title, Key Selector, Record Button).

- [x] Task: Implement Transport Controls (Play, Stop, Metronome, Tempo).

- [x] Task: Implement View Switcher (Tabs: Loop, Seq, Drum, Song).

- [x] Task: Wire up `NativeLoopEngine` to Global Transport (Play/Stop/BPM).



## Phase 4: Sequencer Timeline (View 'Seq')

- [x] Task: Create `SequencerTimeline` view.

    - Left Sidebar (Fixed Instrument Headers).

    - Scrollable Main Area (Time Grid).

- [x] Task: Implement `TimelineBlock` component.

    - Solid color matching Track Color.

    - Optional "Hatched" texture for specific states.

- [x] Task: Implement Synchronized Scrolling & Playhead Cursor.

- [x] Task: Connect Timeline to Engine (Visualizing active loops over time).



## Phase 5: Vocal Integration & Polish

- [x] Task: Update `VocalOverdubScreen` to receive `activeLoops` state.

- [x] Task: Implement background playback of loops during recording.

- [x] Task: Loop Syncing: Add "Global Sync" or "Restart All" button.

- [x] Task: Ensure audio mixing allows mic input + loop playback simultaneously.





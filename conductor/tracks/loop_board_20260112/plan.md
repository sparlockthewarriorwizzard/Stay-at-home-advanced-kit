# Track Plan: Loop Board & Live Matrix Engine

## Phase 1: Prototype & Core Engine (Completed)
- [x] Task: Archive old sequencer code.
- [x] Task: Implement `NativeLoopEngine` using `expo-av` (Pivoted from WebView).
- [x] Task: Implement `LoopBoardScreen` with 4 pad layout.
- [x] Task: Integrate with Affirmation flow (navigation update).
- [x] Task: Add "Knobs and Sliders" (Volume & Rate control per pad).

## Phase 2: UI Overhaul - Live Loop Matrix
- [ ] Task: Define Color Palette & Theme (Deep Dark Mode + Channel Colors) in `src/types/MusicTypes.ts` or `src/constants/Theme.ts`.
- [ ] Task: Create `LoopPad` component with:
    - Rounded corners & Stroke Border (Inactive) vs Solid Fill (Active).
    - Radial Wipe Animation (SVG/Canvas or Reanimated) synced to loop progress.
    - Left-aligned Instrument Icon + Bold/Light Text styling.
- [ ] Task: Refactor `LoopBoardScreen` to `LiveLoopMatrix` (Scrollable Grid).
    - Columns: Instruments (Kick, Clap, Bass, etc.).
    - Rows: Variations (Fallen, Eventual, Hunted).
- [ ] Task: Implement "Mutually Exclusive Columns" logic (1 pad per track active).
- [ ] Task: Implement "Queue" logic (Flash/Pulse pad until next quantization point).

## Phase 3: Navigation & Transport
- [ ] Task: Create Top Navigation Bar (App Title, Key Selector, Record Button).
- [ ] Task: Implement Transport Controls (Play, Stop, Metronome, Tempo).
- [ ] Task: Implement View Switcher (Tabs: Loop, Seq, Drum, Song).
- [ ] Task: Wire up `NativeLoopEngine` to Global Transport (Play/Stop/BPM).

## Phase 4: Sequencer Timeline (View 'Seq')
- [ ] Task: Create `SequencerTimeline` view.
    - Left Sidebar (Fixed Instrument Headers).
    - Scrollable Main Area (Time Grid).
- [ ] Task: Implement `TimelineBlock` component.
    - Solid color matching Track Color.
    - Optional "Hatched" texture for specific states.
- [ ] Task: Implement Synchronized Scrolling & Playhead Cursor.
- [ ] Task: Connect Timeline to Engine (Visualizing active loops over time).

## Phase 5: Vocal Integration & Polish
- [ ] Task: Update `VocalOverdubScreen` to receive `activeLoops` state.
- [ ] Task: Implement background playback of loops during recording.
- [ ] Task: Loop Syncing: Add "Global Sync" or "Restart All" button.
- [ ] Task: Ensure audio mixing allows mic input + loop playback simultaneously.

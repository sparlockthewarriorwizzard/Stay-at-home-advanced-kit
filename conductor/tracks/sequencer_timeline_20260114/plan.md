# Track: Implement Linear Sequencer Timeline ('Seq' View)

**Goal:** Build the horizontal arrangement view for song construction, allowing users to paint patterns onto a time grid. This is the 'Seq' tab described in the technical specification.

**Status:** PENDING

## Phase 1: Core Layout & Navigation
- [x] **Task 1: Scaffold Sequencer Screen & Navigation Logic** (cd7bcdf)
    -   Create `src/screens/SequencerTimelineScreen.tsx`.
    -   Update `LoopBoardScreen` (or parent navigator) to handle the Tab switching (`Loop` vs `Seq`) as per spec.
    -   Implement the basic "Split Pane" layout (Fixed Left Sidebar, Scrollable Right Content).
    -   *Test:* Verify navigation between Matrix and Sequencer views.

- [x] **Task 2: Implement Track Headers (Left Sidebar)** (87db778)
    -   Create `TrackHeader` component.
    -   Implement vertical stack matching the 8 colors/icons from Loop Board.
    -   Ensure sticky positioning (stays visible while timeline scrolls horizontally).
    -   Sync vertical scrolling with the main timeline.
    -   *Spec:* Icon only, background color matches track, high Z-index.

## Phase 2: Timeline & Ruler
- [ ] **Task 3: Implement Timeline Ruler & Grid**
    -   Create `TimelineRuler` component (Top fixed bar).
    -   Render Bar numbers (1, 2, 3...) and grid lines (vertical).
    -   Implement horizontal scrolling logic.
    -   *Spec:* Dark grey background, white integers, solid bar lines, faint beat lines.

- [ ] **Task 4: Implement Arrangement Block (Clip) Renderer**
    -   Create `ArrangementClip` component.
    -   Visuals: Rounded rectangle, solid fill (Track Color), Label text.
    -   Implement "Hatched" state visual (diagonal stripes) for muted/ghost clips.
    -   Render clips onto the grid based on mock data (initially).

## Phase 3: State Integration & Playback
- [ ] **Task 5: Integrate with LoopStore / Arrangement Data**
    -   Define data structure for the arrangement (e.g., `SequenceEvent[]` with startBar, duration, patternId).
    -   Connect `SequencerTimelineScreen` to `useLoopStore` (or create `useArrangementStore`).
    -   Render actual active loops/patterns onto the timeline.

- [ ] **Task 6: Implement Playhead & Auto-Scroll**
    -   Create vertical white Playhead line.
    -   Animate playhead based on `LoopStore` current time/beat.
    -   Implement "Page Turn" or "Smooth Follow" auto-scrolling when playhead reaches edge.

## Phase 4: Toolbar & Interactions
- [ ] **Task 7: Implement Secondary Toolbar**
    -   Create sub-header below main transport.
    -   Add placeholders for Undo/Redo (History) and Automation Toggle.
    -   *Spec:* Curved arrow icons, Bezier curve icon.

- [ ] **Task 8: Final Polish & Interaction Sync**
    -   Ensure color consistency with Loop Matrix.
    -   Verify vertical scroll sync between headers and canvas.
    -   Verify performance (use `FlatList` or optimized rendering if needed).

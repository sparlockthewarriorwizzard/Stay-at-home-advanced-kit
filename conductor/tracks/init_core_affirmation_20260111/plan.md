# Track Plan: Initialize Project Core & Affirmation Recording Flow

## Phase 1: Project Consolidation & Setup
- [x] Task: Move `Stay-at-home-advanced-kit` contents to project root and install dependencies. (d0ccb13)
- [x] Task: Configure `app.json` (or `app.config.ts`) with correct project name ("Able Music") and bundle identifier. (8fd57a6)
- [x] Task: Verify the base app passes static checks (lint/TSC). (bbb0e4c)
- [ ] Task: Conductor - User Manual Verification 'Project Consolidation & Setup' (Protocol in workflow.md)

## Phase 2: Affirmation Module Integration ## Phase 2: Affirmation Module Integration & Refactor Refactor [checkpoint: a9546ea]
- [x] Task: Create `src/modules/affirmation-flow` directory and copy files from `extracted_modules/affirmation-flow`. (0023830)
- [x] Task: Context7 Check: Query `expo-audio` documentation for recording/playback patterns. (58c14e9)
- [x] Task: Uninstall `expo-av` and install `expo-audio`. (450446f)
- [x] Task: Refactor `useAffirmation.ts` to implement `expo-audio` recording logic (start, stop, prepare). (369d56f)
- [x] Task: Update `AffirmationRecorder.tsx` UI to reflect the new state management from the refactored hook. (483f8ff)
- [ ] Task: Conductor - User Manual Verification 'Affirmation Module Integration & Refactor' (Protocol in workflow.md)

## Phase 3: Navigation ## Phase 3: Navigation & Integration Integration [checkpoint: 629db59]
- [x] Task: Create a new screen `src/screens/AffirmationRecordScreen.tsx` wrapping the `AffirmationRecorder`. (869a426)
- [x] Task: Register `AffirmationRecordScreen` in `src/navigation/RootNavigator.tsx`. (6fcc23d)
- [x] Task: Add a temporary navigation button on `HomeScreen` to access the recorder. (aa3212a)
- [ ] Task: Conductor - User Manual Verification 'Navigation & Integration' (Protocol in workflow.md)

## Phase 4: Verification & Cleanup
- [x] Task: Test the full flow: Navigate -> Record -> Stop -> Playback. (e63ca75)
- [ ] Task: Verify audio file upload logic in `AffirmationService.ts` (mock if backend not ready).
- [ ] Task: Clean up `extracted_modules` and `Stay-at-home-advanced-kit` folders (delete if empty/merged).
- [ ] Task: Conductor - User Manual Verification 'Verification & Cleanup' (Protocol in workflow.md)

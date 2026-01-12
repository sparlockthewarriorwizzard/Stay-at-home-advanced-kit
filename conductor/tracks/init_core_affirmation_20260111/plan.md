# Track Plan: Initialize Project Core & Affirmation Recording Flow

## Phase 1: Project Consolidation & Setup
- [x] Task: Move `Stay-at-home-advanced-kit` contents to project root and install dependencies. (d0ccb13)
- [ ] Task: Configure `app.json` (or `app.config.ts`) with correct project name ("Able Music") and bundle identifier.
- [ ] Task: Verify the base app runs on Android/iOS (simulators).
- [ ] Task: Conductor - User Manual Verification 'Project Consolidation & Setup' (Protocol in workflow.md)

## Phase 2: Affirmation Module Integration & Refactor
- [ ] Task: Create `src/modules/affirmation-flow` directory and copy files from `extracted_modules/affirmation-flow`.
- [ ] Task: Context7 Check: Query `expo-audio` documentation for recording/playback patterns.
- [ ] Task: Uninstall `expo-av` and install `expo-audio`.
- [ ] Task: Refactor `useAffirmation.ts` to implement `expo-audio` recording logic (start, stop, prepare).
- [ ] Task: Update `AffirmationRecorder.tsx` UI to reflect the new state management from the refactored hook.
- [ ] Task: Conductor - User Manual Verification 'Affirmation Module Integration & Refactor' (Protocol in workflow.md)

## Phase 3: Navigation & Integration
- [ ] Task: Create a new screen `src/screens/AffirmationRecordScreen.tsx` wrapping the `AffirmationRecorder`.
- [ ] Task: Register `AffirmationRecordScreen` in `src/navigation/RootNavigator.tsx`.
- [ ] Task: Add a temporary navigation button on `HomeScreen` to access the recorder.
- [ ] Task: Conductor - User Manual Verification 'Navigation & Integration' (Protocol in workflow.md)

## Phase 4: Verification & Cleanup
- [ ] Task: Test the full flow: Navigate -> Record -> Stop -> Playback.
- [ ] Task: Verify audio file upload logic in `AffirmationService.ts` (mock if backend not ready).
- [ ] Task: Clean up `extracted_modules` and `Stay-at-home-advanced-kit` folders (delete if empty/merged).
- [ ] Task: Conductor - User Manual Verification 'Verification & Cleanup' (Protocol in workflow.md)

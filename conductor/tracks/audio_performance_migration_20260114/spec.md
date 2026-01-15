# Track Specification: High-Performance Audio Migration

**Overview:**
Migrate the core audio architecture from `expo-av` to `react-native-audio-api`. This transition will leverage the React Native New Architecture (JSI/TurboModules) to eliminate synchronization drift (jitter) and resolve Out-Of-Memory (OOM) crashes by moving heavy audio data processing to native memory buffers.

**Functional Requirements:**
1.  **Audio Engine Migration:** Replace `NativeLoopEngine` implementation with a `react-native-audio-api` based `AudioContext`.
2.  **Sample-Accurate Scheduling:** Implement a "Lookahead Scheduler" pattern for the Sequencer Timeline to ensure perfect rhythmic integrity.
3.  **High-Fidelity Loop Matrix:** Update `LoopPad` to trigger sounds via native buffers with <10ms latency.
4.  **Synced Vocal Recording:** Refactor `VocalOverdubScreen` to record while playing back loops from the high-performance engine, ensuring sample-accurate alignment.
5.  **Native Memory Management:** Preload all active kit samples into native `AudioBuffer`s on app launch to eliminate bridge-induced OOM issues.

**Non-Functional Requirements:**
1.  **Performance:** Achieve "touch-to-sound" latency of <10ms and rhythmic jitter of <2ms.
2.  **Stability:** Eliminate OOM crashes during kit loading and simultaneous loop playback.
3.  **Compatibility:** Support EAS Cloud Builds for both iOS and Android.

**Acceptance Criteria:**
*   Loop pads trigger instantly with no audible delay.
*   Sequencer playback remains perfectly in sync over long periods (3+ minutes).
*   App does not crash when loading 8+ simultaneous high-quality loops.
*   The development build compiles successfully via EAS.

**Out of Scope:**
*   Implementing a full "Drum" pattern editor (this remains a separate UI task).
*   Cloud storage synchronization (Supabase integration is separate).

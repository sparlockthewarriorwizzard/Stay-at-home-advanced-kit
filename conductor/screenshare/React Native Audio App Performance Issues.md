# **High-Performance Mobile Audio Architecture: Overcoming React Native Limitations and Evaluating Next-Generation Stacks for Interactive Music Applications**

## **1\. Executive Introduction: The Real-Time Imperative in Mobile Music Software**

The evolution of mobile computing has transformed smartphones and tablets from passive media consumption devices into sophisticated creative workstations. In the domain of digital audio workstations (DAWs), grooveboxes, and interactive music sequencers, the user expectation has shifted from simple playback to professional-grade, low-latency creation. However, this transition has exposed severe architectural schisms in cross-platform development frameworks. The query regarding synchronization drift ("sync issues") and Out-Of-Memory (OOM) crashes in an Expo/React Native environment addresses a systemic failure mode common to hybrid mobile development: the mismatch between the asynchronous, event-driven nature of JavaScript bridges and the synchronous, deterministic requirements of real-time digital signal processing (DSP).

Developing interactive audio applications—specifically those involving loop pads (sample triggering) and linear sequencers (timeline-based scheduling)—presents a unique set of engineering challenges that are distinct from standard media playback. While applications like Spotify or YouTube can rely on large buffers (seconds of latency) to ensure smooth playback, a musical instrument requires "touch-to-sound" latency of under 10 milliseconds to feel responsive, and scheduling precision (jitter) of under 2 milliseconds to maintain rhythmic integrity.1 The standard React Native architecture, particularly within the managed Expo environment, historically struggles to meet these thresholds due to the overhead of the asynchronous bridge and the non-deterministic nature of the JavaScript event loop.3

This report provides an exhaustive technical analysis of these failure modes, deconstructing the specific mechanisms of synchronization loss and memory exhaustion reported in the user query. It proceeds to evaluate immediate remediation strategies within the React Native ecosystem, specifically leveraging the New Architecture (JSI and TurboModules) and the react-native-audio-api. Furthermore, it conducts a comparative analysis of alternative technology stacks, including Flutter’s Foreign Function Interface (FFI) capabilities with flutter\_soloud and the industry-standard C++ integration via JUCE. The objective is to provide a comprehensive architectural blueprint for building high-performance, sample-accurate interactive music applications on mobile devices.

## **2\. Theoretical Fundamentals of Real-Time Audio Systems**

To diagnose the "sync" and "memory" issues accurately, one must first establish the theoretical constraints of mobile audio subsystems. An interactive music application does not merely play sound; it synthesizes audio streams in real-time, requiring a fundamentally different architecture than a music player.

### **2.1 The Audio Callback and Thread Priority**

At the operating system level—whether CoreAudio on iOS or AAudio/OpenSL ES on Android—audio is generated via a "pull" mechanism. The audio hardware (DAC) consumes samples at a fixed rate, typically 44,100 Hz or 48,000 Hz. To feed this hardware, the OS fires a high-priority callback function at regular intervals, requesting a specific block of frames (the buffer size). If the application fails to fill this buffer within the allotted time window (often less than 5ms for low-latency performance), the hardware plays silence or repeats the previous buffer, resulting in an audible "glitch" or "pop" known as a buffer underrun.4

In a robust architecture, this callback runs on a dedicated high-priority Audio Thread. This thread must be "real-time safe," meaning it must never block. It cannot perform file I/O, it cannot lock mutexes that might be held by lower-priority threads, and critically, it should not perform memory allocation (malloc/free), as these operations have non-deterministic execution times. The React Native JavaScript thread, by contrast, violates all these rules. It shares execution time with UI layout, network requests, and garbage collection, making it inherently unsuitable for direct participation in the audio callback loop.5

### **2.2 Sample-Accurate Scheduling vs. Wall-Clock Time**

The reported "sync issues" in sequencers often stem from a misunderstanding of time domains. In a JavaScript environment, developers typically rely on "Wall-Clock Time"—the system clock accessed via Date.now() or performance.now(), and scheduled via setTimeout or setInterval. However, Wall-Clock Time is subject to drift. It is not synchronized with the audio hardware's sample clock.

The audio hardware operates on "Audio Time," which is a simple count of samples processed since the stream began. For a sequencer to remain perfectly synchronized (e.g., a drum loop aligning with a synthesizer sequence), events must be scheduled against this Audio Time. A "kick drum at beat 4" is not "2000ms from now"; it is "Audio Frame \#88,200." Standard React Native bridges introduce variable latency (jitter) when passing these commands from JS to Native, causing the audio to trigger late. Even a 20ms variance—imperceptible in UI interactions—causes a "flam" or "gallop" effect in rhythmic audio that renders a musical instrument unusable.1

### **2.3 Audio Memory Management and Latency**

Digital audio is memory-intensive. CD-quality stereo audio (16-bit, 44.1kHz) consumes approximately 10.5 MB of RAM per minute. A loop pad application that loads 16 tracks of 4-minute backing stems requires over 600 MB of raw PCM data in RAM.

Mobile operating systems impose strict limits on heap sizes. On Android, the standard heap limit for an application might be as low as 128MB or 256MB on some devices. When an application attempts to load compressed audio (MP3/AAC) and decode it into raw PCM for low-latency playback, the memory footprint expands by a factor of 10x or more relative to the compressed file size. If this decoding happens within the managed runtime (JavaScript VM or Java VM), it puts immense pressure on the Garbage Collector (GC). The resulting GC pauses not only cause UI jank but can block the main thread long enough to cause audio dropouts or, in severe cases, cause the OS to terminate the application for exceeding memory quotas—the "Out of Memory" crash reported by the user.7

## **3\. Deconstructing the React Native & Expo Failure Mode**

The user's experience with React Native and Expo—specifically utilizing libraries like expo-av or react-native-sound—represents a classic architectural mismatch. While these libraries are excellent for asynchronous media playback, they lack the structural components necessary for interactive synthesis.

### **3.1 The Asynchronous Bridge Bottleneck**

The "Old Architecture" of React Native relies on a serialized bridge to communicate between the JavaScript thread (where the sequencer logic lives) and the Native thread (where the audio engine lives).

When a user taps a pad or a sequencer step triggers:

1. **Event Generation:** The JS thread generates a "Play" command.  
2. **Serialization:** This command is serialized into a JSON string.  
3. **Bridge Crossing:** The message enters the bridge queue.  
4. **Deserialization:** The Native thread receives and parses the JSON.  
5. **Execution:** The Native audio player (e.g., Android MediaPlayer) is instructed to play.

This entire pipeline is asynchronous. The time it takes for a message to traverse the bridge depends on the current load of the JS thread. If React is currently diffing a complex component tree or processing a network response, the "Play" command waits. This introduces **latency jitter**. One note might trigger in 5ms, the next in 40ms. In a linear sequencer, this jitter manifests as an unstable groove—the "sync issue" described. The sequencer sounds "sloppy" because the interval between notes is fluctuating based on CPU load rather than musical time.2

Furthermore, expo-av specifically is built on top of system media players (AVPlayer on iOS, ExoPlayer/MediaPlayer on Android). These APIs are designed for high-latency buffering to ensure smooth playback of network streams. They often enforce a "warm-up" period where the audio engine buffers data before producing sound, adding a fixed latency (often 50-200ms) that makes real-time drumming impossible. They also lack "fire-and-forget" polyphony; triggering the same sound rapidly (e.g., a drum roll) often fails or cuts off the previous instance because the underlying player state machine cannot transition fast enough.9

### **3.2 The Out-Of-Memory Mechanism in Managed Runtimes**

The reported OOM crashes are frequently a result of "Double-RAM" consumption caused by the bridge.

#### **3.2.1 The Base64 Problem**

In many naive React Native audio implementations, developers attempt to load audio files in JavaScript to manipulate them or pass them to native modules. Since the bridge only supports JSON (strings), binary audio data is often encoded as Base64 strings.

* **Expansion:** Base64 encoding increases file size by \~33%.  
* **Duplication:** The string exists in the JS Heap (managed by Hermes/V8). It is then copied and decoded into the Native Heap (C++/Java) to be played.  
* **GC Pressure:** The huge strings in the JS heap trigger frequent Garbage Collection.

If a user loads a "Loop Pad" with 12 samples, each 5MB in size:

* Native Size: 60MB.  
* Base64 JS Size: \~80MB.  
* Total RAM: 140MB+ (transient spikes during copy operations can double this).

On a constrained Android device, this rapid allocation and duplication exceeds the largeHeap limit, causing an immediate crash. The error message "Out of memory" 7 confirms that the application is exhausting its addressable memory space before the GC can reclaim the transient Base64 strings.

#### **3.2.2 Android AudioTrack Limits**

Another source of OOM-like crashes on Android is the exhaustion of hardware AudioTrack resources. Android has a hard system limit on the number of active AudioTrack instances (traditionally 32, but often fewer are available for low-latency paths). If an Expo app creates a new Sound object for every single pad and every single sequencer track without properly mixing them into a single stream, the app will hit the system limit. The OS will refuse to create new tracks, throwing exceptions that often masquerade as memory errors or simply result in silence.8

### **3.3 The Failure of setInterval for Sequencing**

Using JavaScript's setInterval or setTimeout for a sequencer clock is mathematically guaranteed to drift. In browser and mobile JS engines, timers are throttled to save battery, and their execution is delayed if the main thread is busy. A sequencer set to 120 BPM (500ms per beat) using setInterval might fire at intervals of 502ms, 510ms, 495ms. Over the course of a 3-minute song, this drift accumulates, causing the visual playhead to desynchronize from the audio, or worse, causing multiple audio tracks scheduled independently to drift apart from each other.6

## **4\. Advanced Optimization within React Native (The "New Architecture")**

While the "Old Architecture" is unsuitable for interactive audio, the React Native ecosystem has evolved. The introduction of the **New Architecture**, centered around the **JavaScript Interface (JSI)** and **TurboModules**, enables a solution that can rival native performance without abandoning React Native entirely. This represents the primary "guidance" requested by the user for fixing their current stack.

### **4.1 JSI: Removing the Bridge**

The JavaScript Interface (JSI) allows the JavaScript runtime (Hermes) to hold direct references to C++ "HostObjects." This eliminates the need for JSON serialization.

* **Synchronous Execution:** A JS function call AudioEngine.play(soundId) via JSI is a synchronous call into C++. It executes immediately, eliminating the non-deterministic bridge latency.  
* **Shared Memory:** JSI allows the Native side to allocate a large AudioBuffer in the native heap (C++) and pass a reference to it to JavaScript. JavaScript can manipulate this reference without copying the data. This solves the "Double-RAM" OOM issue because the heavy binary data never enters the JS heap as a string.3

### **4.2 The Solution: react-native-audio-api**

The research identifies **react-native-audio-api** (developed by Software Mansion) as the critical library for implementing this modern architecture.5 It is designed to bring the W3C **Web Audio API** standard to React Native, implemented via high-performance C++ backends (Oboe on Android, AVAudioEngine on iOS).

#### **4.2.1 Solving Synchronization with Lookahead Scheduling**

The Web Audio API model, implemented by react-native-audio-api, solves the sync issue by decoupling the "scheduling time" from the "execution time." This is known as the **Lookahead Scheduling** pattern, widely used in web music apps (like Tone.js).

**The Pattern Mechanism:**

1. **The Audio Clock:** The native audio engine maintains a precise, monotonic clock (audioContext.currentTime) that counts actual audio samples processed.  
2. **The Schedule:** Instead of saying "Play Now," the JS thread calculates a timestamp in the near future: startTime \= audioContext.currentTime \+ 0.100 (100ms from now).  
3. **The Queue:** This command source.start(startTime) is sent to the native C++ engine via JSI.  
4. **Native Execution:** The C++ audio thread, running independently of the JS thread, checks this queue. When its internal clock hits startTime, it mixes the sound.

**Result:** Even if the JS thread jitters by 50ms, the command arrives at the native layer *before* the scheduled startTime. The audio thread executes it at the exact sample requested, resulting in sample-accurate timing (zero audible jitter) despite the JS thread's instability.2

#### **4.2.2 Solving Memory with Native Buffers**

react-native-audio-api allows loading audio files directly into native memory buffers (AudioBuffer).

* **Loader:** const buffer \= await audioContext.decodeAudioData(fileData);  
* **Reference:** The buffer object in JS is just a handle. The data sits in C++.  
* **Reusability:** You can create 100 AudioBufferSourceNode instances (voices) that all share the same read-only AudioBuffer reference. This is drastically more memory-efficient than creating 100 Sound objects in expo-av.  
* **Heap Configuration:** To further prevent OOMs on Android, the manifest should be configured with android:largeHeap="true" to accommodate the raw PCM data of the loaded buffers.7

### **4.3 Implementing the Lookahead Scheduler**

For the user's "linear sequencer," the guidance is to implement a recursive setTimeout loop in JavaScript that functions as a "feeder" for the native engine.

JavaScript

// Conceptual implementation of Lookahead Scheduler  
const LOOKAHEAD\_WINDOW \= 0.1; // 100ms  
const SCHEDULER\_INTERVAL \= 25; // Check every 25ms

function scheduler() {  
  const currentTime \= audioContext.currentTime;  
    
  // Find all notes that need to play in the next 100ms  
  const upcomingNotes \= songData.notes.filter(note \=\>   
    note.time \>= currentTime && note.time \< currentTime \+ LOOKAHEAD\_WINDOW  
  );

  upcomingNotes.forEach(note \=\> {  
    if (\!note.scheduled) {  
      playNote(note.sample, note.time); // native call: source.start(note.time)  
      note.scheduled \= true;  
    }  
  });  
}

setInterval(scheduler, SCHEDULER\_INTERVAL);

This pattern ensures that the Native Audio Thread always has a buffer of upcoming events to play, effectively absorbing the jitter of the JS thread.12

## **5\. Alternative Stack Analysis: Flutter & Dart**

The user asked for "better tech stacks." Flutter is a strong contender, offering a middle ground between the ease of high-level UI development and the performance of native code.

### **5.1 Architecture: AOT Compilation and FFI**

Unlike React Native, Flutter compiles Dart code Ahead-Of-Time (AOT) into native machine code (ARM). There is no "Bridge." Communication with C++ libraries is handled via **Dart FFI (Foreign Function Interface)**, which allows Dart to call C functions with minimal overhead (often nanoseconds compared to milliseconds for the RN bridge).16

This architectural difference makes Flutter inherently more stable for timing-sensitive operations. The Dart Garbage Collector is also optimized for high-throughput UI scenarios (generational GC), often resulting in fewer "stop-the-world" pauses than the JS engine.

### **5.2 The Audio Engine: flutter\_soloud**

The research highlights **flutter\_soloud** as the leading solution for low-latency interactive audio in Flutter.17

* **Engine:** It wraps **SoLoud**, a high-performance C++ audio engine designed for game development.  
* **Features:** It supports "fire-and-forget" low-latency playback, ideal for loop pads. It handles voice management (polyphony) automatically, preventing the "AudioTrack exhaustion" issues seen in Android MediaPlayer.  
* **Memory:** It loads samples into native memory and manages decoding efficiently.  
* **Gapless Looping:** Unlike standard players, flutter\_soloud supports sample-accurate looping points, which is a critical requirement for loop-based music apps.19

### **5.3 Sequencing with Isolates**

For the "Linear Sequencer," Dart offers **Isolates**—independent worker threads that do not share memory with the main UI thread.

* **Stability:** A sequencer clock running in a separate Isolate is immune to "UI jank." If the UI thread drops frames due to a complex animation, the Isolate continues to tick and trigger audio events via FFI.20  
* **Comparison:** While react-native-audio-api relies on the C++ thread for timing (Lookahead), Flutter allows the Dart code itself to be precise enough for many sequencing tasks when using Isolates, simplifying the logic (no complex lookahead math required, though still recommended for pro apps).

### **5.4 Case Study: Flutter vs. React Native for Loop Pads**

In a direct comparison of a "Drum Pad" app:

* **React Native (Standard):** Tapping a pad sends a JSON message \-\> Bridge \-\> Java. Latency: 20-50ms (variable). Result: Feels "laggy."  
* **Flutter (flutter\_soloud):** Tapping a pad calls FFI \-\> C++. Latency: \<10ms (consistent). Result: Feels "snappy."  
* **React Native (JSI/AudioAPI):** Tapping a pad calls JSI \-\> C++. Latency: \<10ms (consistent). Result: Feels "snappy" (Comparable to Flutter).

**Verdict:** Flutter offers better performance "out of the box" with fewer complex configurations than React Native. However, a properly optimized React Native app using JSI can match Flutter's performance.

## **6\. Alternative Stack Analysis: The Native "Gold Standard" (JUCE & C++)**

For commercial-grade music applications (DAWs like FL Studio Mobile, Ableton Note), neither standard React Native nor Flutter is the industry standard. That title belongs to **JUCE**.

### **6.1 The C++ Advantage**

C++ allows for manual memory management (no GC pauses) and direct access to CPU SIMD instructions (for DSP math). This is essential for real-time effects (filters, reverb, synthesis) where every microsecond counts.

### **6.2 Oboe and AudioKit**

* **Oboe (Android):** A C++ library by Google that solves the fragmentation of Android audio. It automatically selects AAudio (on modern devices) or OpenSL ES (on older ones) to guarantee the lowest possible latency. It offers a callback-based API perfect for synthesis.4  
* **AudioKit (iOS):** A comprehensive Swift/C++ framework for iOS that provides synthesis, analysis, and effects. It wraps the complex AVAudioEngine.21

### **6.3 The Hybrid "React-JUCE" Architecture**

There is an emerging architecture that combines the UI speed of React Native with the power of JUCE, often referred to as **React-JUCE** or **Blueprint**.22

* **Concept:** The application logic and audio engine are written entirely in C++ using JUCE. This ensures professional-grade audio performance (sub-3ms latency, perfect sync).  
* **UI Integration:** React Native is used *solely* as a view layer. A custom JSI bridge sends UI events (knob turns, pad taps) to the C++ engine. The C++ engine sends visualization data (waveforms) back to RN.  
* **Benefit:** This provides the "best of both worlds"—the rapid UI development of React and the uncompromised audio of C++.  
* **Cost:** This requires significant C++ expertise and maintaining a complex build system (CMake \+ Gradle \+ CocoaPods). It is significantly harder to implement than the Flutter or Pure RN solutions.

## **7\. Architectural Blueprints for Specific Use Cases**

To satisfy the user's request for "guidance," this section provides concrete architectural patterns for the two specific app types mentioned.

### **7.1 The Loop Pad Architecture**

**Requirement:** Instant triggering, polyphony (overlapping sounds), low latency.

**Recommended Stack: React Native \+ react-native-audio-api (or Flutter \+ Soloud)**

**Implementation Pattern:**

1. **Preload Phase:** On app launch, decode all loop samples into AudioBuffer objects. Do NOT stream them from disk. Store these buffers in a Map\<String, AudioBuffer\>.  
2. **Voice Pool:** Create a pool of AudioBufferSourceNodes (or Soloud voices). When a pad is tapped, grab a node from the pool.  
3. **Triggering:**  
   * *Bad:* player.play() (waiting for promise).  
   * *Good:* source.buffer \= loadedBuffer; source.connect(ctx.destination); source.start(0);  
4. **Memory Strategy:** Monitor the LargeHeap usage. If the user loads a new "Sound Pack," explicitly dispose() the old buffers to free C++ memory before loading new ones to avoid OOM.

### **7.2 The Linear Sequencer Architecture**

**Requirement:** Sample-accurate timing, timeline editing, multiple tracks.

**Recommended Stack: React Native \+ react-native-audio-api (Lookahead Pattern)**

**Implementation Pattern:**

1. **Data Structure:** Store the song as a JSON object: { tracks: \[{ id: 1, events: \[{ time: 0.0, sample: 'kick' }, { time: 0.5, sample: 'snare' }\] }\] }.  
2. **The Scheduler Loop:** A setInterval runs every 25ms in JS.  
3. **Lookahead Logic:**  
   JavaScript  
   const audioTime \= ctx.currentTime;  
   const lookahead \= 0.1; // 100ms  
   // Find events between audioTime and audioTime \+ lookahead  
   events.forEach(e \=\> {  
      if (e.time \>= audioTime && e.time \< audioTime \+ lookahead) {  
          playSampleAt(e.sample, e.time); // e.time is precise Native Audio Time  
      }  
   });

4. **Visual Sync:** Do NOT use the setInterval loop to update the UI playhead (it's too jittery). Use requestAnimationFrame. In each frame, read ctx.currentTime and calculate the playhead position: x \= currentTime \* pixelsPerSecond. This ensures the playhead moves smoothly at 60fps/120fps while the audio stays locked to the hardware clock.12

## **8\. Comparative Evaluation and Benchmarking**

The following table summarizes the trade-offs between the analyzed stacks.

| Metric | Standard RN (Expo-AV) | RN (Audio API / JSI) | Flutter (Soloud) | Native C++ (JUCE) |
| :---- | :---- | :---- | :---- | :---- |
| **Sync Accuracy** | Low (Drift \> 20ms) | **Perfect (Sample Accurate)** | High (\< 5ms) | **Perfect (Sample Accurate)** |
| **Latency** | High (\> 50ms) | Low (\< 10ms) | Low (\< 10ms) | **Lowest (\< 3ms)** |
| **Memory Risk** | **High (OOM frequent)** | Low (Shared Buffers) | Low (Efficient) | Lowest (Manual Control) |
| **Dev Velocity** | **Fastest** | Fast | Medium (Learn Dart) | Slow (C++ Complexity) |
| **Sequencing** | Unusable | **Excellent (Lookahead)** | Good (Isolates) | **Excellent** |
| **DSP Capability** | None | Moderate (Worklets) | Moderate | **Unlimited** |

### **8.1 Gap Analysis regarding User Requirements**

* **Guidance for current stack:** The user asked if there is guidance. The answer is **yes**, but it requires abandoning expo-av for interactive features. The guidance is to adopt react-native-audio-api to gain access to the Web Audio scheduling model.  
* **Better Tech Stack:** The answer is **yes**. Flutter is "better" in terms of out-of-the-box performance for simple apps. C++ (JUCE) is "better" for professional depth. React Native with JSI is "better" for maintaining the current codebase while solving the performance bottlenecks.

## **9\. Future Outlook: WebAssembly and the New Architecture**

The landscape of mobile audio is shifting rapidly.

* **Wasm (WebAssembly):** The ability to run compiled C++/Rust code inside the JS engine (via AudioWorklets) is becoming a viable path. react-native-audio-api supports Audio Worklets (v2), allowing developers to compile DSP algorithms (like a synth or filter) in C++ or Rust (via Wasm) and run them inside the audio thread of the React Native app.25  
* **React Native Fabric:** As React Native completes its transition to the Fabric architecture (standard in 2025/2026), the overhead of UI updates will decrease, making visual synchronizers (playheads, VU meters) even more responsive and less prone to jank.26  
* **GPU Audio:** Emerging research suggests offloading massive polyphony and DSP to the GPU, though this remains experimental on mobile.

## **10\. Conclusion and Strategic Recommendations**

The "issues with sync and out of memory" experienced by the user are not merely bugs to be patched; they are symptoms of using a media consumption library (expo-av) for a media creation task. The React Native Bridge and the JS heap cannot sustain the throughput required for real-time interactive audio.

### **Recommendation 1: The "Fix It Now" Strategy (React Native)**

If the goal is to salvage the current React Native project:

1. **Migrate to react-native-audio-api:** This is the critical step. It provides the **AudioContext** and **Lookahead Scheduling** capabilities missing from expo-av.  
2. **Implement JSI:** Ensure that all audio triggering uses the synchronous JSI path, avoiding the bridge.  
3. **Optimize Memory:** Use native AudioBuffer objects for samples. Enable largeHeap in the Android manifest.  
4. **Adopt Development Builds:** Move away from Expo Go to **Expo Dev Client** to support these custom native modules.

### **Recommendation 2: The "Fresh Start" Strategy (Flutter)**

If the user is willing to rewrite the application and prioritizes ease of development over deep DSP customization:

1. **Adopt Flutter:** The AOT compilation model eliminates the bridge bottleneck.  
2. **Use flutter\_soloud:** This library provides an immediate, high-performance solution for loop pads and triggers with minimal configuration.  
3. **Use Isolates:** Implement the sequencer clock in a Dart Isolate to ensure timing stability.

### **Recommendation 3: The "Pro App" Strategy (Native/JUCE)**

If the user aims to build a competitor to GarageBand or FL Studio:

1. **Hybrid React-JUCE:** Build the audio engine in **C++/JUCE**. Use React Native only for the UI.  
2. **Native Integration:** This is the only path that guarantees professional-grade latency (\<3ms) and the ability to process complex audio chains without hitting the performance ceiling of a managed runtime.

**Final Verdict:** For a "Loop Pad" and "Linear Sequencer," the **React Native \+ react-native-audio-api** stack (using the Lookahead pattern) is the most pragmatic high-performance solution that allows the user to leverage their existing React Native expertise while solving the fundamental synchronization and memory issues.

#### **Works cited**

1. A tale of two clocks – Scheduling Web Audio with precision | Hacker News, accessed January 14, 2026, [https://news.ycombinator.com/item?id=31935058](https://news.ycombinator.com/item?id=31935058)  
2. A tale of two clocks | Articles \- web.dev, accessed January 14, 2026, [https://web.dev/articles/audio-scheduling](https://web.dev/articles/audio-scheduling)  
3. What's the difference between bridging a module with C++ or with JSI in React Native?, accessed January 14, 2026, [https://stackoverflow.com/questions/69501535/whats-the-difference-between-bridging-a-module-with-c-or-with-jsi-in-react-na](https://stackoverflow.com/questions/69501535/whats-the-difference-between-bridging-a-module-with-c-or-with-jsi-in-react-na)  
4. Using Android low latency audio with React Native turbomodules | by Teemu Pohjanlehto, accessed January 14, 2026, [https://blog.stackademic.com/using-android-low-latency-audio-with-react-native-turbomodules-e6828647928b](https://blog.stackademic.com/using-android-low-latency-audio-with-react-native-turbomodules-e6828647928b)  
5. From Files to Buffers: Building Real-Time Audio Pipelines in React Native \- Callstack, accessed January 14, 2026, [https://www.callstack.com/blog/from-files-to-buffers-building-real-time-audio-pipelines-in-react-native](https://www.callstack.com/blog/from-files-to-buffers-building-real-time-audio-pipelines-in-react-native)  
6. Android \- info for create a loop pad \- music app \- Stack Overflow, accessed January 14, 2026, [https://stackoverflow.com/questions/33271494/android-info-for-create-a-loop-pad-music-app](https://stackoverflow.com/questions/33271494/android-info-for-create-a-loop-pad-music-app)  
7. Out of memory Application crash React Native \- Stack Overflow, accessed January 14, 2026, [https://stackoverflow.com/questions/39655791/out-of-memory-application-crash-react-native](https://stackoverflow.com/questions/39655791/out-of-memory-application-crash-react-native)  
8. How to avoid Out of Memory issue in Expo App? \- Stack Overflow, accessed January 14, 2026, [https://stackoverflow.com/questions/67522157/how-to-avoid-out-of-memory-issue-in-expo-app](https://stackoverflow.com/questions/67522157/how-to-avoid-out-of-memory-issue-in-expo-app)  
9. expo-audio issues (recording always empty, stop on android only works after second time), accessed January 14, 2026, [https://www.reddit.com/r/expo/comments/1kspie7/expoaudio\_issues\_recording\_always\_empty\_stop\_on/](https://www.reddit.com/r/expo/comments/1kspie7/expoaudio_issues_recording_always_empty_stop_on/)  
10. Low Latency Audio : r/reactnative \- Reddit, accessed January 14, 2026, [https://www.reddit.com/r/reactnative/comments/1ao6n96/low\_latency\_audio/](https://www.reddit.com/r/reactnative/comments/1ao6n96/low_latency_audio/)  
11. Installing expo 48 gives error out of memory · Issue \#21717 \- GitHub, accessed January 14, 2026, [https://github.com/expo/expo/issues/21717](https://github.com/expo/expo/issues/21717)  
12. Web Audio Scheduling | Loophole Letters, accessed January 14, 2026, [https://loophole-letters.vercel.app/web-audio-scheduling](https://loophole-letters.vercel.app/web-audio-scheduling)  
13. Unlocking React Native Speed: TurboModules, JSI, and Hermes Explained \- DEV Community, accessed January 14, 2026, [https://dev.to/sharad\_k\_e2232631d5ae480f/unlocking-react-native-speed-turbomodules-jsi-and-hermes-explained-294e](https://dev.to/sharad_k_e2232631d5ae480f/unlocking-react-native-speed-turbomodules-jsi-and-hermes-explained-294e)  
14. Introduction | React Native Audio API, accessed January 14, 2026, [https://docs.swmansion.com/react-native-audio-api/docs/](https://docs.swmansion.com/react-native-audio-api/docs/)  
15. Advanced techniques: Creating and sequencing audio \- Web APIs | MDN, accessed January 14, 2026, [https://developer.mozilla.org/en-US/docs/Web/API/Web\_Audio\_API/Advanced\_techniques](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques)  
16. Flutter for React Native developers, accessed January 14, 2026, [https://docs.flutter.dev/get-started/flutter-for/react-native-devs](https://docs.flutter.dev/get-started/flutter-for/react-native-devs)  
17. Flutter SoLoud: How to reduce playback latency when syncing audio with UI (metronome-style)? \- Stack Overflow, accessed January 14, 2026, [https://stackoverflow.com/questions/79676727/flutter-soloud-how-to-reduce-playback-latency-when-syncing-audio-with-ui-metro](https://stackoverflow.com/questions/79676727/flutter-soloud-how-to-reduce-playback-latency-when-syncing-audio-with-ui-metro)  
18. flutter\_soloud (Package of the Week) \- YouTube, accessed January 14, 2026, [https://www.youtube.com/watch?v=2t6Bt04EyLw](https://www.youtube.com/watch?v=2t6Bt04EyLw)  
19. flutter\_soloud | Flutter package \- Pub.dev, accessed January 14, 2026, [https://pub.dev/packages/flutter\_soloud](https://pub.dev/packages/flutter_soloud)  
20. Concurrency and isolates \- Flutter documentation, accessed January 14, 2026, [https://docs.flutter.dev/perf/isolates](https://docs.flutter.dev/perf/isolates)  
21. AudioKit vs AVFoundation… anyone have experience? : r/iOSProgramming \- Reddit, accessed January 14, 2026, [https://www.reddit.com/r/iOSProgramming/comments/1j5jo5a/audiokit\_vs\_avfoundation\_anyone\_have\_experience/](https://www.reddit.com/r/iOSProgramming/comments/1j5jo5a/audiokit_vs_avfoundation_anyone_have_experience/)  
22. Introducing Blueprint: Build native JUCE interfaces with React.js, accessed January 14, 2026, [https://forum.juce.com/t/introducing-blueprint-build-native-juce-interfaces-with-react-js/34174](https://forum.juce.com/t/introducing-blueprint-build-native-juce-interfaces-with-react-js/34174)  
23. JoshMarler/react-juce: Write cross-platform native apps with React.js and JUCE \- GitHub, accessed January 14, 2026, [https://github.com/JoshMarler/react-juce](https://github.com/JoshMarler/react-juce)  
24. \[React Native\] Managing State-Driven Animations and Game Logic in a Grid-Based Memory App : r/iosdev \- Reddit, accessed January 14, 2026, [https://www.reddit.com/r/iosdev/comments/1prx0fh/react\_native\_managing\_statedriven\_animations\_and/](https://www.reddit.com/r/iosdev/comments/1prx0fh/react_native_managing_statedriven_animations_and/)  
25. software-mansion/react-native-audio-api: High-performance audio engine \- GitHub, accessed January 14, 2026, [https://github.com/software-mansion/react-native-audio-api](https://github.com/software-mansion/react-native-audio-api)  
26. React Native Wrapped 2025: A Month-by-Month Recap of The Year \- Callstack, accessed January 14, 2026, [https://www.callstack.com/blog/react-native-wrapped-2025-a-month-by-month-recap-of-the-year](https://www.callstack.com/blog/react-native-wrapped-2025-a-month-by-month-recap-of-the-year)  
27. React Native 0.83 \- React 19.2, New DevTools features, no breaking changes, accessed January 14, 2026, [https://reactnative.dev/blog/2025/12/10/react-native-0.83](https://reactnative.dev/blog/2025/12/10/react-native-0.83)
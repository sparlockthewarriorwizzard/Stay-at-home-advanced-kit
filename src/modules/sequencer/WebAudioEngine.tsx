import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// HTML Content with Tone.js and Sequencer Logic
const soundEngineHTML = `
<html>
<head>
  <script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script>
</head>
<body>
<script>
  // --- SYNTH SETUP ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 10,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: "exponential" }
  }).toDestination();

  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
  }).toDestination();

  const hihat = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  }).toDestination();
  hihat.volume.value = -15;

  const clap = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0 }
  }).toDestination();
  // Simple filter for clap
  const clapFilter = new Tone.Filter(800, "bandpass").toDestination();
  clap.connect(clapFilter);

  const instruments = {
    '909-kick': kick,
    '909-snare': snare,
    '909-hihat': hihat,
    '909-clap': clap,
    // Aliases for other kits (re-using synths for now)
    'lofi-kick': kick,
    'lofi-snare': snare,
    'lofi-hihat': hihat,
    'kick': kick,
    'snare': snare,
    'hihat': hihat,
    'clap': clap
  };

  // --- SEQUENCER STATE ---
  // pattern[instrumentId][stepIndex] = boolean
  let pattern = {}; 
  let stepsCount = 16;
  let currentStep = 0;

  // --- TRANSPORT LOOP ---
  Tone.Transport.scheduleRepeat((time) => {
    // 1. Notify RN for visual update
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TICK', step: currentStep }));

    // 2. Trigger sounds for this step
    try {
        Object.keys(pattern).forEach(instId => {
            if (pattern[instId] && pattern[instId][currentStep]) {
                const synth = instruments[instId] || instruments['kick']; // Fallback
                
                // Trigger logic based on instrument type
                if (synth === kick) synth.triggerAttackRelease("C1", "8n", time);
                else if (synth === hihat) synth.triggerAttackRelease(32, "32n", time, 0.3);
                else synth.triggerAttackRelease("8n", time);
            }
        });
    } catch (e) {
        // Prevent one bad trigger from stalling the sequencer
        // window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: 'Audio Trigger Failed' }));
    }

    // 3. Advance step
    currentStep = (currentStep + 1) % stepsCount;

  }, "16n"); // 16th notes

  // --- COMMAND HANDLER ---
  document.addEventListener('message', (event) => handleCommand(event.data));
  window.addEventListener('message', (event) => handleCommand(event.data));

  async function handleCommand(raw) {
    try {
        const cmd = JSON.parse(raw);
        
        // Ensure Audio Context is running
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }

        switch (cmd.type) {
            case 'START':
                currentStep = 0;
                Tone.Transport.start();
                break;
            case 'STOP':
                Tone.Transport.stop();
                break;
            case 'PAUSE':
                Tone.Transport.pause();
                break;
            case 'UPDATE_PATTERN':
                pattern = cmd.pattern;
                break;
            case 'SET_BPM':
                Tone.Transport.bpm.value = cmd.bpm;
                break;
            case 'PREVIEW':
                // Single shot trigger
                const synth = instruments[cmd.instrumentId];
                if (synth) {
                     if (synth === kick) synth.triggerAttackRelease("C1", "8n");
                     else if (synth === hihat) synth.triggerAttackRelease(32, "32n", undefined, 0.3);
                     else synth.triggerAttackRelease("8n");
                }
                break;
        }
    } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: e.message }));
    }
  }
</script>
</body>
</html>
`;

export interface WebAudioEngineRef {
    sendCommand: (cmd: any) => void;
}

interface Props {
    onTick?: (step: number) => void;
}

export const WebAudioEngine = forwardRef<WebAudioEngineRef, Props>(({ onTick }, ref) => {
    const webViewRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
        sendCommand: (cmd: any) => {
            const script = `handleCommand('${JSON.stringify(cmd)}'); true;`;
            webViewRef.current?.injectJavaScript(script);
        }
    }));

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'TICK' && onTick) {
                onTick(data.step);
            } else if (data.type === 'ERROR') {
                console.error('[WebAudio] Error:', data.message);
            }
        } catch (e) {
            // Ignore parse errors
        }
    };

    return (
        <View style={{ height: 0, width: 0, overflow: 'hidden', position: 'absolute' }}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: soundEngineHTML }}
                javaScriptEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                onMessage={handleMessage}
                mixedContentMode="always"
            />
        </View>
    );
});

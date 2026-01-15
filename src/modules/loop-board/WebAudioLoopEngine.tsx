import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const loopEngineHTML = `
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
<script>
  // Check if Tone loaded
  if (typeof Tone === 'undefined') {
      setTimeout(() => {
          if (typeof Tone === 'undefined') {
             window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: 'Tone.js FAILED to load from CDN' }));
          }
      }, 2000);
  } else {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'Tone.js Loaded Successfully' }));
  }

  // --- SYNTH SETUP ---
  // Since we don't have WAV files yet, we will create "Virtual Loops" using Tone.Loop and Synths.
  
  const loops = {};
  const synths = {};

  // 1. ETHEREAL PAD LOOP
  synths['pad'] = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatstring", count: 3, spread: 30 },
    envelope: { attack: 0.4, decay: 0.1, sustain: 0.5, release: 1 }
  }).toDestination();
  synths['pad'].volume.value = -10;

  loops['pad'] = new Tone.Loop(time => {
    synths['pad'].triggerAttackRelease(["C3", "E3", "G3"], "1m", time);
  }, "2m"); // 2 bar loop

  // 2. LOFI DRUM LOOP
  synths['kick'] = new Tone.MembraneSynth().toDestination();
  synths['snare'] = new Tone.NoiseSynth({ envelope: { decay: 0.2 } }).toDestination();
  
  loops['drums'] = new Tone.Loop(time => {
    // Simple beat: Kick on 1, Snare on 2
    synths['kick'].triggerAttackRelease("C1", "8n", time);
    synths['snare'].triggerAttackRelease("8n", time + Tone.Time("4n"));
    synths['kick'].triggerAttackRelease("C1", "8n", time + Tone.Time("2n"));
    synths['snare'].triggerAttackRelease("8n", time + Tone.Time("2n") + Tone.Time("4n"));
  }, "1m");

  // 3. ARPEGGIO LOOP
  synths['arp'] = new Tone.Synth().toDestination();
  synths['arp'].volume.value = -15;
  const arpPattern = new Tone.Pattern((time, note) => {
    synths['arp'].triggerAttackRelease(note, "16n", time);
  }, ["C4", "E4", "G4", "B4"], "upDown");
  arpPattern.interval = "16n";
  loops['arp'] = arpPattern;

  // 4. BASS LOOP
  synths['bass'] = new Tone.MonoSynth({
    oscillator: { type: "square" },
    filter: { Q: 6, type: "lowpass", rollover: -12 }
  }).toDestination();
  
  loops['bass'] = new Tone.Loop(time => {
    synths['bass'].triggerAttackRelease("C2", "8n", time);
    synths['bass'].triggerAttackRelease("E2", "8n", time + Tone.Time("4n."));
  }, "1m");


  // --- COMMAND HANDLER ---
  document.addEventListener('message', (event) => handleCommand(event.data));
  window.addEventListener('message', (event) => handleCommand(event.data));

  // Signal ready
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'WebView Ready, Tone.js loading...' }));

  async function handleCommand(raw) {
    try {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'Command received: ' + raw }));
        const cmd = JSON.parse(raw);
        
        if (Tone.context.state !== 'running') {
            await Tone.start();
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', message: 'Tone.js Context Started' }));
        }
        if (Tone.Transport.state !== 'started') Tone.Transport.start();

        switch (cmd.type) {
            case 'TRIGGER_PAD':
                handlePadTrigger(cmd.padId, cmd.mode); // mode: 'oneshot' | 'loop'
                break;
            case 'STOP_ALL':
                Tone.Transport.stop();
                Object.values(loops).forEach(l => l.stop());
                break;
        }
    } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: e.message }));
    }
  }

  function handlePadTrigger(padId, mode) {
      const loop = loops[padId];
      if (!loop) return;

      if (loop.state === 'started') {
          loop.stop();
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAD_STATE', padId, active: false }));
      } else {
          // Sync to next measure for musicality
          loop.start("@1m"); 
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAD_STATE', padId, active: true }));
      }
  }
</script>
</body>
</html>
`;

export interface WebAudioLoopEngineRef {
    sendCommand: (cmd: any) => void;
}

interface Props {
    onPadStateChange?: (padId: string, active: boolean) => void;
}

export const WebAudioLoopEngine = forwardRef<WebAudioLoopEngineRef, Props>(({ onPadStateChange }, ref) => {
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
            if (data.type === 'PAD_STATE' && onPadStateChange) {
                onPadStateChange(data.padId, data.active);
            } else if (data.type === 'LOG') {
                console.log(`[WebView] ${data.message}`);
            }
        } catch (e) {}
    };

    return (
        <View style={{ height: 0, width: 0, overflow: 'hidden', position: 'absolute' }}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: loopEngineHTML }}
                javaScriptEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                onMessage={handleMessage}
            />
        </View>
    );
});

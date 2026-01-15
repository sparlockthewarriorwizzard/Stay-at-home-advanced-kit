import { Audio, AVPlaybackStatus } from 'expo-av';
import { useLoopStore } from './LoopStore';

// Mapping for the "Default" Kit
// Structure: [instrument][row_index]
const DEFAULT_KIT_ASSETS: Record<string, Record<number, any>> = {
    kick: {
        1: require('../../assets/sounds/kits/default/kick/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/kick/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/kick/Row_3.wav'),
        4: require('../../assets/sounds/kits/default/kick/Row_1.wav'),
    },
    clap: {
        1: require('../../assets/sounds/kits/default/clap/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/clap/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/clap/Row_3.wav'),
        4: require('../../assets/sounds/kits/default/clap/Row_1.wav'),
    },
    tops: {
        1: require('../../assets/sounds/kits/default/tops/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/tops/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/tops/Row_3.wav'),
        4: require('../../assets/sounds/kits/default/tops/Row_1.wav'),
    },
    bass: {
        1: require('../../assets/sounds/kits/default/bass/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/bass/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/bass/Row_3.wav'),
        4: require('../../assets/sounds/kits/default/bass/Row_1.wav'),
    },
    chords: {
        1: require('../../assets/sounds/kits/default/chords/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/chords/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/chords/Row_3.wav'),
        4: require('../../assets/sounds/kits/default/chords/Row_1.wav'),
    },
    vocal: {
        1: require('../../assets/sounds/kits/default/vocal/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/vocal/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/vocal/Row_3.wav'),
        4: require('../../assets/sounds/kits/default/vocal/Row_1.wav'),
    },
    adds: {
        1: require('../../assets/sounds/kits/default/adds/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/adds/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/adds/Row_3.wav'),
        4: require('../../assets/sounds/kits/default/adds/Row_1.wav'),
    },
    fx: {
        1: require('../../assets/sounds/kits/default/fx/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/fx/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/fx/Row_3.wav'),
        4: require('../../assets/sounds/kits/default/fx/Row_1.wav'),
    },
};

class NativeLoopEngine {
    private static instance: NativeLoopEngine;
    private sounds: Record<string, Audio.Sound> = {};
    private loopIdToTrackId: Record<string, string> = {};
    private isLoaded = false;
    
    private constructor() {}

    static getInstance() {
        if (!NativeLoopEngine.instance) {
            NativeLoopEngine.instance = new NativeLoopEngine();
        }
        return NativeLoopEngine.instance;
    }

    async loadAll() {
        if (this.isLoaded) return;

        try {
            console.log('[NativeLoopEngine] High-Performance Init...');
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            });

            // GLOBAL SETTINGS
            const GLOBAL_BPM = 86;
            
            // PREPARE TASKS
            const promises: Promise<void>[] = [];
            const types = ['kick', 'clap', 'tops', 'bass', 'chords', 'vocal', 'adds', 'fx'];

            types.forEach((type, typeIndex) => {
                const trackId = `track${typeIndex + 1}`;
                
                for (let i = 1; i <= 4; i++) {
                    const loopId = `${type}${i}`;
                    const asset = DEFAULT_KIT_ASSETS[type]?.[i];
                    
                    if (!asset) continue;

                    this.loopIdToTrackId[loopId] = trackId;

                    // LOAD TASK
                    const loadTask = async () => {
                        try {
                            const { sound } = await Audio.Sound.createAsync(
                                asset,
                                { isLooping: true, volume: 1.0, shouldPlay: false }
                            );
                            
                            // PRE-CALCULATE PITCH CORRECTION
                            let sourceBpm = 120; // Row 1 & 4 (Default)
                            if (i === 2) sourceBpm = 86;
                            if (i === 3) sourceBpm = 110;

                            if (sourceBpm !== GLOBAL_BPM) {
                                const rate = GLOBAL_BPM / sourceBpm;
                                await sound.setRateAsync(rate, true); // Correct Pitch
                            }

                            this.sounds[loopId] = sound;
                        } catch (e) {
                            console.error(`[NativeLoopEngine] Failed to load ${loopId}`, e);
                        }
                    };
                    promises.push(loadTask());
                }
            });

            // EXECUTE ALL PARALLEL (Real devices can handle this)
            await Promise.all(promises);

            this.isLoaded = true;
            console.log(`[NativeLoopEngine] Ready. ${Object.keys(this.sounds).length} loops armed.`);
        } catch (e) {
            console.error('[NativeLoopEngine] Fatal error initializing', e);
        }
    }

    private handleStatusUpdate(loopId: string, status: AVPlaybackStatus) {
        // No-op
    }

    async playLoop(trackId: string, loopId: string) {
        // OPTIMIZED TRIGGER: Fire-and-Forget
        
        // 1. Stop neighbors
        const currentLoopsForTrack = Object.keys(this.loopIdToTrackId)
            .filter(id => this.loopIdToTrackId[id] === trackId && id !== loopId);
        
        currentLoopsForTrack.forEach(id => {
            const s = this.sounds[id];
            if (s) s.stopAsync(); // No await
        });

        // 2. Play Target
        const sound = this.sounds[loopId];
        if (sound) {
            sound.playFromPositionAsync(0).catch(e => {
                console.warn(`[NativeLoopEngine] Play error ${loopId}`, e);
            });
        }
    }

    async stopLoop(loopId: string) {
        const sound = this.sounds[loopId];
        if (sound) {
            sound.stopAsync(); // No await
        }
    }

    async stopAll() {
        Object.values(this.sounds).forEach(s => s.stopAsync());
    }
}

export default NativeLoopEngine;
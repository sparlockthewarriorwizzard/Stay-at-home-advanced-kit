import { Asset } from 'expo-asset';
import { AudioBuffer, AudioBufferSourceNode } from 'react-native-audio-api';
import { AudioEngine } from '../audio-engine/AudioEngine';

// Mapping for the "Default" Kit
const DEFAULT_KIT_ASSETS: Record<string, Record<number, any>> = {
    kick: {
        1: require('../../assets/sounds/kits/default/kick/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/kick/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/kick/Row_3.wav'),
    },
    clap: {
        1: require('../../assets/sounds/kits/default/clap/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/clap/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/clap/Row_3.wav'),
    },
    tops: {
        1: require('../../assets/sounds/kits/default/tops/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/tops/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/tops/Row_3.wav'),
    },
    bass: {
        1: require('../../assets/sounds/kits/default/bass/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/bass/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/bass/Row_3.wav'),
    },
    chords: {
        1: require('../../assets/sounds/kits/default/chords/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/chords/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/chords/Row_3.wav'),
    },
    vocal: {
        1: require('../../assets/sounds/kits/default/vocal/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/vocal/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/vocal/Row_3.wav'),
    },
    adds: {
        1: require('../../assets/sounds/kits/default/adds/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/adds/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/adds/Row_3.wav'),
    },
    fx: {
        1: require('../../assets/sounds/kits/default/fx/Row_1.wav'),
        2: require('../../assets/sounds/kits/default/fx/Row_2.wav'),
        3: require('../../assets/sounds/kits/default/fx/Row_3.wav'),
    },
};

class NativeLoopEngine {
    private static instance: NativeLoopEngine;
    private buffers: Record<string, AudioBuffer> = {};
    private activeSources: Record<string, AudioBufferSourceNode> = {};
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
            console.log('[NativeLoopEngine] High-Performance Native Init...');
            const audioEngine = AudioEngine.getInstance();
            
            const types = ['kick', 'clap', 'tops', 'bass', 'chords', 'vocal', 'adds', 'fx'];
            const promises: Promise<void>[] = [];

            types.forEach((type) => {
                for (let i = 1; i <= 3; i++) {
                    const loopId = `${type}${i}`;
                    const assetModule = DEFAULT_KIT_ASSETS[type]?.[i];
                    
                    if (!assetModule) continue;

                    const loadTask = async () => {
                        try {
                            const asset = Asset.fromModule(assetModule);
                            console.log(`[NativeLoopEngine] Downloading ${loopId}...`);
                            await asset.downloadAsync();
                            const uri = asset.localUri || asset.uri;
                            console.log(`[NativeLoopEngine] Loading ${loopId} into buffer: ${uri.substring(0, 50)}...`);
                            
                            const buffer = await audioEngine.loadBuffer(uri);
                            this.buffers[loopId] = buffer;
                            console.log(`[NativeLoopEngine] Successfully loaded ${loopId}`);
                        } catch (e) {
                            console.error(`[NativeLoopEngine] Failed to load ${loopId}`, e);
                        }
                    };
                    promises.push(loadTask());
                }
            });

            await Promise.all(promises);
            this.isLoaded = true;
            console.log(`[NativeLoopEngine] Ready. ${Object.keys(this.buffers).length} buffers loaded.`);
        } catch (e) {
            console.error('[NativeLoopEngine] Fatal error initializing', e);
        }
    }

    async playLoop(trackId: string, loopId: string) {
        const buffer = this.buffers[loopId];
        if (!buffer) {
            console.warn(`[NativeLoopEngine] No buffer found for ${loopId}`);
            return;
        }

        // 1. Stop current loop for this track if any
        this.stopLoop(trackId);

        // 2. Schedule playback
        const audioEngine = AudioEngine.getInstance();
        const source = audioEngine.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(audioEngine.context.destination);
        
        // Start immediately (or at next quantization point if we handle it here, 
        // but currently LoopStore handles quantization by calling this at the right time)
        source.start(0);
        
        this.activeSources[trackId] = source;
    }

    async stopLoop(trackId: string) {
        const source = this.activeSources[trackId];
        if (source) {
            try {
                source.stop();
            } catch (e) {
                // Ignore if already stopped
            }
            delete this.activeSources[trackId];
        }
    }

    async stopAll() {
        Object.keys(this.activeSources).forEach(trackId => {
            this.stopLoop(trackId);
        });
    }

    async unloadAll() {
        await this.stopAll();
        this.buffers = {};
        this.isLoaded = false;
        await AudioEngine.getInstance().close();
    }

    public getLoadedBuffers(): Record<string, AudioBuffer> {
        return this.buffers;
    }
}

export default NativeLoopEngine;

import { Asset } from 'expo-asset';
import { SoundKit } from '../types/MusicTypes';

// Import assets directly
const kickAsset = require('../assets/sounds/kick.wav');
const snareAsset = require('../assets/sounds/snare.wav');
const hihatAsset = require('../assets/sounds/hihat.wav');
const clapAsset = require('../assets/sounds/clap.wav');

export class SoundKitService {
  private static kits: SoundKit[] = [
    {
      id: 'classic-909',
      name: 'Classic 909',
      description: 'Standard electronic drum kit',
      instruments: [
        { id: '909-kick', name: 'Kick', asset: kickAsset },
        { id: '909-snare', name: 'Snare', asset: snareAsset },
        { id: '909-hihat', name: 'HiHat', asset: hihatAsset },
        { id: '909-clap', name: 'Clap', asset: clapAsset },
      ],
    },
    {
        id: 'lofi',
        name: 'Lofi Vibes',
        description: 'Mellow lofi drum sounds',
        instruments: [
          { id: 'lofi-kick', name: 'Kick', asset: kickAsset }, // Reuse placeholders
          { id: 'lofi-snare', name: 'Snare', asset: snareAsset },
          { id: 'lofi-hihat', name: 'HiHat', asset: hihatAsset },
        ],
      },
  ];

  public static getKits(): SoundKit[] {
    return this.kits;
  }

  public static getKitById(id: string): SoundKit | undefined {
    return this.kits.find(k => k.id === id);
  }

  public static getDefaultKit(): SoundKit {
    return this.kits[0];
  }
}

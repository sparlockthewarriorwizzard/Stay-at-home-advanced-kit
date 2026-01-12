import { SoundKit } from '../types/MusicTypes';

// Placeholder for real assets.
// In a real build, we would use require('../assets/sounds/kick.wav')
// But since these files were just created, I'll define the service to handle them.

export class SoundKitService {
  private static kits: SoundKit[] = [
    {
      id: 'classic-909',
      name: 'Classic 909',
      description: 'Standard electronic drum kit',
      instruments: [
        { id: '909-kick', name: 'Kick', asset: require('../assets/sounds/kick.wav') },
        { id: '909-snare', name: 'Snare', asset: require('../assets/sounds/snare.wav') },
        { id: '909-hihat', name: 'HiHat', asset: require('../assets/sounds/hihat.wav') },
        { id: '909-clap', name: 'Clap', asset: require('../assets/sounds/clap.wav') },
      ],
    },
    {
        id: 'lofi',
        name: 'Lofi Vibes',
        description: 'Mellow lofi drum sounds',
        instruments: [
          { id: 'lofi-kick', name: 'Kick', asset: require('../assets/sounds/kick.wav') }, // Reuse placeholders
          { id: 'lofi-snare', name: 'Snare', asset: require('../assets/sounds/snare.wav') },
          { id: 'lofi-hihat', name: 'HiHat', asset: require('../assets/sounds/hihat.wav') },
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

/**
 * Exact Chess.com Sound Service for CHESSexp.
 * Preloads and plays official Chess.com audio assets for tactile, authentic feedback.
 */
class SoundService {
  constructor() {
    this.muted = false;
    this.audioCache = {};
    this.isBrowser = typeof window !== 'undefined';

    if (this.isBrowser) {
      this.preloadSounds();
    }
  }

  preloadSounds() {
    const soundFiles = {
      move: '/sounds/move-self.mp3',
      moveOpponent: '/sounds/move-opponent.mp3',
      capture: '/sounds/capture.mp3',
      check: '/sounds/move-check.mp3',
      castle: '/sounds/castle.mp3',
      promote: '/sounds/promote.mp3',
      gameEnd: '/sounds/game-end.mp3',
      gameStart: '/sounds/game-start.mp3',
      illegal: '/sounds/illegal.mp3'
    };

    Object.entries(soundFiles).forEach(([name, src]) => {
      try {
        const audio = new Audio(src);
        audio.preload = 'auto';
        this.audioCache[name] = audio;
      } catch (e) {
        // Fallback gracefully
      }
    });
  }

  setMuted(muted) {
    this.muted = muted;
  }

  play(name) {
    if (this.muted || !this.isBrowser) return;

    try {
      const audio = this.audioCache[name];
      if (audio) {
        // Clone to allow rapid consecutive clicks / moves without clipping
        const playInstance = audio.cloneNode();
        playInstance.volume = 0.85;
        playInstance.play().catch(() => {
          // Ignore autoplay restrictions before user interaction
        });
      }
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  playMove() {
    this.play('move');
  }

  playOpponentMove() {
    this.play('moveOpponent');
  }

  playCapture() {
    this.play('capture');
  }

  playCheck() {
    this.play('check');
  }

  playCastle() {
    this.play('castle');
  }

  playPromote() {
    this.play('promote');
  }

  playGameEnd() {
    this.play('gameEnd');
  }

  playIllegal() {
    this.play('illegal');
  }
}

export const soundService = new SoundService();

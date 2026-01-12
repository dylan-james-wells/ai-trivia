// Audio Manager for game state-based music and sound effects
// Audio files should be placed in /public/audio/

export type MusicTrack = 'setup' | 'board' | 'question' | 'victory' | 'none';
export type SoundEffect = 'correct' | 'incorrect' | 'points-gain' | 'points-lose' | 'nobody-knows';

// Configure audio file paths here - easy to swap out later
export const AUDIO_CONFIG = {
  music: {
    setup: '/audio/setup-music.mp3',      // Playful, upbeat menu music
    board: '/audio/board-music.mp3',       // Mellow, thinking music
    question: '/audio/question-music.mp3', // Tension-building music
    victory: '/audio/victory-music.mp3',   // Celebratory winner announcement music
  },
  sfx: {
    correct: '/audio/sfx-correct.mp3',       // AI says correct
    incorrect: '/audio/sfx-incorrect.mp3',   // AI says incorrect
    'points-gain': '/audio/sfx-points-gain.mp3', // Moderator confirms correct
    'points-lose': '/audio/sfx-points-lose.mp3', // Moderator confirms incorrect
    'nobody-knows': '/audio/sfx-nobody-knows.mp3', // Everyone passed, answer revealed
  },
  // Default volumes (0-1)
  defaultMusicVolume: 0.3,
  defaultSfxVolume: 0.5,
};

class AudioManager {
  private musicElement: HTMLAudioElement | null = null;
  private currentTrack: MusicTrack = 'none';
  private musicVolume: number = AUDIO_CONFIG.defaultMusicVolume;
  private sfxVolume: number = AUDIO_CONFIG.defaultSfxVolume;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private isPaused: boolean = false; // Track if music is paused for SFX

  // Must be called after user interaction (browser autoplay policy)
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.musicElement = new Audio();
    this.musicElement.loop = true;
    this.musicElement.volume = this.isMuted ? 0 : this.musicVolume;

    // Load saved preferences
    const savedMuted = localStorage.getItem('audio-muted');
    const savedMusicVol = localStorage.getItem('audio-music-volume');
    const savedSfxVol = localStorage.getItem('audio-sfx-volume');

    if (savedMuted !== null) this.isMuted = savedMuted === 'true';
    if (savedMusicVol !== null) this.musicVolume = parseFloat(savedMusicVol);
    if (savedSfxVol !== null) this.sfxVolume = parseFloat(savedSfxVol);

    this.isInitialized = true;
  }

  playMusic(track: MusicTrack): void {
    if (!this.isInitialized || !this.musicElement) return;

    // If same track and not paused, nothing to do
    if (track === this.currentTrack && !this.isPaused) return;

    // If same track but paused, just resume
    if (track === this.currentTrack && this.isPaused) {
      this.resumeMusic();
      return;
    }

    this.currentTrack = track;
    this.isPaused = false;

    if (track === 'none') {
      this.musicElement.pause();
      this.musicElement.currentTime = 0;
      return;
    }

    const src = AUDIO_CONFIG.music[track];
    this.musicElement.src = src;
    this.musicElement.volume = this.isMuted ? 0 : this.musicVolume;
    this.musicElement.play().catch(() => {
      // Autoplay was prevented - will play on next user interaction
      console.log('Music autoplay prevented, will retry on interaction');
    });
  }

  // Pause music (used when playing evaluation SFX)
  pauseMusic(): void {
    if (!this.isInitialized || !this.musicElement) return;
    this.musicElement.pause();
    this.isPaused = true;
  }

  // Resume music after SFX
  resumeMusic(): void {
    if (!this.isInitialized || !this.musicElement || !this.isPaused) return;
    if (this.currentTrack === 'none') return;

    this.isPaused = false;
    this.musicElement.play().catch(() => {
      console.log('Music resume prevented');
    });
  }

  playSfx(effect: SoundEffect): void {
    if (!this.isInitialized || this.isMuted) return;

    const src = AUDIO_CONFIG.sfx[effect];
    const audio = new Audio(src);
    audio.volume = this.sfxVolume;
    audio.play().catch(() => {
      console.log('SFX play prevented');
    });
  }

  // Play SFX and pause music until explicitly resumed
  playSfxAndPauseMusic(effect: SoundEffect): void {
    if (!this.isInitialized) return;

    this.pauseMusic();

    if (!this.isMuted) {
      const src = AUDIO_CONFIG.sfx[effect];
      const audio = new Audio(src);
      audio.volume = this.sfxVolume;
      audio.play().catch(() => {
        console.log('SFX play prevented');
      });
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.musicElement) {
      this.musicElement.volume = muted ? 0 : this.musicVolume;
    }
    localStorage.setItem('audio-muted', String(muted));
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicElement && !this.isMuted) {
      this.musicElement.volume = this.musicVolume;
    }
    localStorage.setItem('audio-music-volume', String(this.musicVolume));
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('audio-sfx-volume', String(this.sfxVolume));
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }

  getCurrentTrack(): MusicTrack {
    return this.currentTrack;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }

  // Stop all audio
  stop(): void {
    if (this.musicElement) {
      this.musicElement.pause();
      this.musicElement.currentTime = 0;
    }
    this.currentTrack = 'none';
    this.isPaused = false;
  }
}

// Singleton instance
export const audioManager = new AudioManager();

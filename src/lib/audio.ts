import { SoundType } from '@/types/game';

export class AudioManager {
  private audioContext: AudioContext | null = null;

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playSound(type: SoundType, enabled: boolean) {
    if (!enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const currentTime = this.audioContext.currentTime;

    switch (type) {
      case 'jump':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.2);
        break;

      case 'score':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(523.25, currentTime);
        oscillator.frequency.setValueAtTime(659.25, currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.3);
        break;

      case 'gameOver':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.4, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.5);
        break;

      case 'collect':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.05);
        oscillator.frequency.exponentialRampToValueAtTime(1600, currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.15);
        break;
    }
  }
}

export type ParlorCue = 'lock' | 'tile' | 'win' | 'loss' | 'tie';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) audioContext = new AudioContext();
  return audioContext;
}

function tone(context: AudioContext, frequency: number, duration: number, delay = 0, volume = 0.035): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startAt = context.currentTime + delay;

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.01);
}

const hapticPatterns: Record<ParlorCue, number | number[]> = {
  lock: 16,
  tile: 7,
  win: [14, 30, 18],
  loss: 48,
  tie: 10,
};

export function playParlorFeedback(cue: ParlorCue): void {
  const context = getAudioContext();
  if (context) {
    void context.resume().catch(() => undefined);

    if (cue === 'lock') tone(context, 182, 0.1, 0, 0.05);
    if (cue === 'tile') tone(context, 398, 0.055, 0, 0.025);
    if (cue === 'win') {
      tone(context, 523, 0.1, 0, 0.045);
      tone(context, 659, 0.14, 0.09, 0.04);
      tone(context, 784, 0.18, 0.19, 0.035);
    }
    if (cue === 'loss') {
      tone(context, 168, 0.16, 0, 0.055);
      tone(context, 122, 0.2, 0.1, 0.04);
    }
    if (cue === 'tie') tone(context, 285, 0.09, 0, 0.03);
  }

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(hapticPatterns[cue]);
  }
}

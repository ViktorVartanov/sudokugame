/**
 * Tiny sound effect layer using the Web Audio API's oscillator, so the game
 * needs no bundled audio assets (keeps everything self-contained offline).
 * All sounds are short, soft, and only ever played when the "Sound Effects"
 * setting is on — never autoplaying music.
 */

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function playTone(frequency: number, startTime: number, duration: number, ctx: AudioContext, gainPeak = 0.08) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

export function playCorrectSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  playTone(660, ctx.currentTime, 0.12, ctx);
}

export function playWrongSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  playTone(180, ctx.currentTime, 0.18, ctx, 0.06);
}

export function playBoxCompleteSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(523, now, 0.14, ctx);
  playTone(659, now + 0.09, 0.16, ctx);
}

export function playVictorySound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  [523, 659, 784, 1047].forEach((freq, i) => playTone(freq, now + i * 0.1, 0.22, ctx, 0.09));
}

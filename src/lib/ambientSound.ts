import type { AmbientProfile } from './storyWorlds';

/**
 * Every world's ambient loop is synthesized live via the Web Audio API —
 * there are no audio files to fetch, cache, or bundle. This trivially
 * satisfies "assets must work offline in the PWA" (there's nothing to fetch)
 * and keeps bundle size flat regardless of how many worlds get a sound.
 */

let sharedContext: AudioContext | null = null;
function getContext(): AudioContext {
  sharedContext ??= new AudioContext();
  return sharedContext;
}

function makeNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

interface ProfileConfig {
  build: (ctx: AudioContext, out: GainNode) => AudioScheduledSourceNode[];
}

const PROFILES: Record<AmbientProfile, ProfileConfig> = {
  'warm-pad': {
    build(ctx, out) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 196;
      osc2.frequency.value = 246.94;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(out);
      return [osc1, osc2];
    },
  },
  'quiet-drone': {
    build(ctx, out) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 110;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      osc.connect(filter);
      filter.connect(out);
      return [osc];
    },
  },
  'rain-noise': {
    build(ctx, out) {
      const noise = ctx.createBufferSource();
      noise.buffer = makeNoiseBuffer(ctx);
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2000;
      noise.connect(filter);
      filter.connect(out);
      return [noise];
    },
  },
  chime: {
    build(ctx, out) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 523.25;
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.15;
      lfoGain.gain.value = 8;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(out);
      lfo.start();
      return [osc, lfo];
    },
  },
  'wave-noise': {
    build(ctx, out) {
      const noise = ctx.createBufferSource();
      noise.buffer = makeNoiseBuffer(ctx);
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.12;
      lfoGain.gain.value = 250;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      noise.connect(filter);
      filter.connect(out);
      lfo.start();
      return [noise, lfo];
    },
  },
  'synth-pulse': {
    build(ctx, out) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 82.41;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      osc.connect(filter);
      filter.connect(out);
      return [osc];
    },
  },
  'neon-arp': {
    build(ctx, out) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 220;
      const gain = ctx.createGain();
      gain.gain.value = 0.5;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 3;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.4;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(gain);
      gain.connect(out);
      lfo.start();
      return [osc, lfo];
    },
  },
  'wind-drone': {
    build(ctx, out) {
      const noise = ctx.createBufferSource();
      noise.buffer = makeNoiseBuffer(ctx);
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 600;
      filter.Q.value = 0.6;
      noise.connect(filter);
      filter.connect(out);
      return [noise];
    },
  },
  'deep-space': {
    build(ctx, out) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 55;
      osc2.frequency.value = 55.5;
      osc1.connect(out);
      osc2.connect(out);
      return [osc1, osc2];
    },
  },
  'regal-pad': {
    build(ctx, out) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc3.type = 'sawtooth';
      osc1.frequency.value = 130.81;
      osc2.frequency.value = 164.81;
      osc3.frequency.value = 196;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(out);
      return [osc1, osc2, osc3];
    },
  },
};

let activeNodes: AudioScheduledSourceNode[] = [];
let activeGain: GainNode | null = null;

export function stopAmbientSound(): void {
  if (activeGain) {
    const ctx = getContext();
    const now = ctx.currentTime;
    activeGain.gain.cancelScheduledValues(now);
    activeGain.gain.setValueAtTime(activeGain.gain.value, now);
    activeGain.gain.linearRampToValueAtTime(0, now + 0.4);
  }
  const nodesToStop = activeNodes;
  setTimeout(() => {
    for (const node of nodesToStop) {
      try {
        node.stop();
      } catch {
        /* already stopped */
      }
    }
  }, 450);
  activeNodes = [];
  activeGain = null;
}

export function playAmbientSound(profile: AmbientProfile): void {
  stopAmbientSound();
  const ctx = getContext();
  if (ctx.state === 'suspended') void ctx.resume();

  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);
  gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.6);

  const nodes = PROFILES[profile].build(ctx, gain);
  for (const node of nodes) node.start();

  activeNodes = nodes;
  activeGain = gain;
}

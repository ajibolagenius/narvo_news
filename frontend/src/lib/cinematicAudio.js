/**
 * Cinematic Audio Effects for Narvo — broadcast-grade cues.
 * Uses Tone.js to synthesize realistic news broadcast intro, mid-break, and outro sounds.
 * Scoped exclusively to the Briefing section.
 */
import * as Tone from 'tone';

let initialized = false;
let masterGain = null;
let reverb = null;
let compressor = null;

async function ensureInit() {
  if (initialized) return;
  await Tone.start();

  // Master chain: compressor → reverb → destination
  compressor = new Tone.Compressor({ threshold: -20, ratio: 4, attack: 0.003, release: 0.25 }).toDestination();
  reverb = new Tone.Reverb({ decay: 3, wet: 0.25 }).connect(compressor);
  masterGain = new Tone.Gain(0.7).connect(reverb);

  initialized = true;
}

/**
 * NEWS BROADCAST INTRO
 * Deep bass tone → rising harmonic chord → bright stab + filtered noise sweep.
 * Mimics the gravitas of CNN / BBC / Al Jazeera opens.
 */
export async function playBriefingIntro() {
  await ensureInit();
  const now = Tone.now();

  // 1. Sub-bass foundation (like a cinematic low rumble)
  const sub = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.3, decay: 0.6, sustain: 0.4, release: 1.5 },
    volume: -12,
  }).connect(masterGain);
  sub.triggerAttackRelease('C2', '2n', now);

  // 2. Rising pad chord (major — authoritative, confident)
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.4, decay: 0.5, sustain: 0.3, release: 2 },
    volume: -16,
  }).connect(masterGain);
  pad.triggerAttackRelease(['C3', 'E3', 'G3'], '2n', now + 0.2);
  pad.triggerAttackRelease(['C4', 'E4', 'G4'], '4n', now + 0.6);

  // 3. Bright stab — the "attention" hit
  const stab = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.6 },
    volume: -20,
  }).connect(masterGain);
  stab.triggerAttackRelease(['E5', 'G5', 'B5'], '16n', now + 1.0);

  // 4. Filtered noise sweep (like an air rush)
  const noise = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.6, decay: 0.4, sustain: 0, release: 0.5 },
    volume: -26,
  });
  const lpf = new Tone.Filter({ frequency: 200, type: 'lowpass' }).connect(masterGain);
  noise.connect(lpf);
  lpf.frequency.rampTo(4000, 0.8, now + 0.1);
  noise.triggerAttackRelease('1n', now + 0.1);

  // Cleanup
  setTimeout(() => {
    sub.dispose(); pad.dispose(); stab.dispose(); noise.dispose(); lpf.dispose();
  }, 5000);
}

/**
 * MID-COMMERCIAL / SECTION DIVIDER
 * Short transitional cue — a soft "ding" with a filtered sweep.
 * Used between story segments in a briefing.
 */
export async function playSectionDivider() {
  await ensureInit();
  const now = Tone.now();

  // Soft bell-like tone
  const bell = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.4, sustain: 0, release: 1.2 },
    volume: -18,
  }).connect(masterGain);
  bell.triggerAttackRelease('E5', '8n', now);

  // Subtle low sweep
  const sweep = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.15, decay: 0.3, sustain: 0, release: 0.6 },
    volume: -24,
  }).connect(masterGain);
  sweep.triggerAttackRelease('G3', '4n', now + 0.05);

  // Tiny noise burst
  const tick = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.1 },
    volume: -30,
  }).connect(masterGain);
  tick.triggerAttackRelease('32n', now + 0.02);

  setTimeout(() => {
    bell.dispose(); sweep.dispose(); tick.dispose();
  }, 3000);
}

/**
 * NEWS BROADCAST OUTRO
 * Descending chord resolution → soft pad tail → gentle fade.
 * The "that's all for now" sign-off feel.
 */
export async function playBriefingOutro() {
  await ensureInit();
  const now = Tone.now();

  // 1. Descending resolution chord
  const chord = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.1, decay: 0.4, sustain: 0.2, release: 2.5 },
    volume: -16,
  }).connect(masterGain);
  chord.triggerAttackRelease(['G4', 'B4', 'D5'], '4n', now);
  chord.triggerAttackRelease(['E4', 'G4', 'C5'], '4n', now + 0.4);
  chord.triggerAttackRelease(['C4', 'E4', 'G4'], '2n', now + 0.8);

  // 2. Sub-bass closing tone
  const bass = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.2, decay: 0.8, sustain: 0.1, release: 2 },
    volume: -14,
  }).connect(masterGain);
  bass.triggerAttackRelease('C2', '2n', now + 0.8);

  // 3. Final soft shimmer
  const shimmer = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.3, decay: 1.0, sustain: 0, release: 2 },
    volume: -28,
  }).connect(masterGain);
  shimmer.triggerAttackRelease('G5', '2n', now + 1.2);

  setTimeout(() => {
    chord.dispose(); bass.dispose(); shimmer.dispose();
  }, 6000);
}

/**
 * Check if audio context is ready.
 */
export function isAudioReady() {
  return initialized && Tone.context.state === 'running';
}

/**
 * Dispose all resources (cleanup).
 */
export function dispose() {
  if (masterGain) { masterGain.dispose(); masterGain = null; }
  if (reverb) { reverb.dispose(); reverb = null; }
  if (compressor) { compressor.dispose(); compressor = null; }
  initialized = false;
}

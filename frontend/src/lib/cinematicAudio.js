/**
 * Cinematic Audio Effects for Narvo using Tone.js
 * Delivers broadcast-grade audio cues for news briefings and UI transitions.
 */
import * as Tone from 'tone';

let initialized = false;
let synth = null;
let noiseSynth = null;
let reverb = null;

async function ensureInit() {
  if (initialized) return;
  await Tone.start();

  reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.2, release: 1.2 },
    volume: -18,
  }).connect(reverb);

  noiseSynth = new Tone.NoiseSynth({
    noise: { type: 'brown' },
    envelope: { attack: 0.5, decay: 0.3, sustain: 0, release: 0.8 },
    volume: -30,
  }).connect(reverb);

  initialized = true;
}

/**
 * Briefing intro chime — a rising two-note broadcast cue.
 */
export async function playBriefingIntro() {
  await ensureInit();
  const now = Tone.now();
  synth.triggerAttackRelease('C4', '8n', now);
  synth.triggerAttackRelease('E4', '8n', now + 0.15);
  synth.triggerAttackRelease('G4', '4n', now + 0.3);
}

/**
 * Briefing outro — a soft descending close.
 */
export async function playBriefingOutro() {
  await ensureInit();
  const now = Tone.now();
  synth.triggerAttackRelease('G4', '8n', now);
  synth.triggerAttackRelease('E4', '8n', now + 0.2);
  synth.triggerAttackRelease('C4', '4n', now + 0.4);
}

/**
 * Breaking news alert — urgent attention-grabbing staccato.
 */
export async function playBreakingAlert() {
  await ensureInit();
  const now = Tone.now();
  synth.triggerAttackRelease('E5', '16n', now);
  synth.triggerAttackRelease('E5', '16n', now + 0.1);
  synth.triggerAttackRelease('G5', '8n', now + 0.25);
  noiseSynth.triggerAttackRelease('16n', now + 0.05);
}

/**
 * Subtle UI transition — minimal click/tick.
 */
export async function playUITransition() {
  await ensureInit();
  synth.triggerAttackRelease('A5', '32n', Tone.now());
}

/**
 * Section divider — soft sweep between news segments.
 */
export async function playSectionDivider() {
  await ensureInit();
  const now = Tone.now();
  const filter = new Tone.Filter(800, 'lowpass').connect(reverb);
  const sweep = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.3, decay: 0.5, sustain: 0, release: 0.5 },
    volume: -22,
  }).connect(filter);
  sweep.triggerAttackRelease('D4', '2n', now);
  setTimeout(() => { sweep.dispose(); filter.dispose(); }, 3000);
}

/**
 * Check if Tone.js audio context is ready.
 */
export function isAudioReady() {
  return initialized && Tone.context.state === 'running';
}

/**
 * Dispose all synths (cleanup).
 */
export function dispose() {
  if (synth) { synth.dispose(); synth = null; }
  if (noiseSynth) { noiseSynth.dispose(); noiseSynth = null; }
  if (reverb) { reverb.dispose(); reverb = null; }
  initialized = false;
}

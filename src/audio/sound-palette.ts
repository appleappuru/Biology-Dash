/**
 * Biology Dash: Immune Patrol
 * Procedural "Toy-Synthesizer" Sound Palette (Pure Web Audio)
 */

import { globalAudio } from './bio-audio';

const PENTATONIC_SEMITONES = [0, 2, 4, 7, 9, 12, 14, 16];
const G4_ROOT = 392.0;

/**
 * 1. Swarm Pop Cascade (Marimba/Kalimba pop)
 */
export function playSwarmPop(combo: number = 0): void {
  const dest = globalAudio.getDestination();
  const ctx = globalAudio.getContext();
  if (!ctx || !dest) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  // Low-pass filter for soft wooden marimba timbre
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.Q.setValueAtTime(3.5, now);

  // Pitch sweep: 320 Hz -> 160 Hz (with slight combo pitch elevation)
  const pitchFactor = 1 + Math.min(0.5, combo * 0.04);
  const baseFreq = 320 * pitchFactor;
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(baseFreq, now);
  osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.055);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
  osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, now + 0.045);

  // Snappy ADSR envelope
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.08);
  osc2.stop(now + 0.08);
}

/**
 * 2. Clearance Combo: Ascending Pentatonic Star Chimes
 */
export function playComboChime(comboIndex: number): void {
  const dest = globalAudio.getDestination();
  const ctx = globalAudio.getContext();
  if (!ctx || !dest) return;

  const now = ctx.currentTime;
  const semitone = PENTATONIC_SEMITONES[comboIndex % PENTATONIC_SEMITONES.length];
  const octave = Math.floor(comboIndex / PENTATONIC_SEMITONES.length);
  const freq = G4_ROOT * Math.pow(2, (semitone + octave * 12) / 12);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(now);
  osc.stop(now + 0.3);

  // Sub-bass pad on combos >= 4
  if (comboIndex >= 4) {
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(98.0, now); // G2

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    subOsc.connect(subGain);
    subGain.connect(dest);

    subOsc.start(now);
    subOsc.stop(now + 0.42);
  }
}

/**
 * 3. Antibody Binding: "Fairy Plink" Glockenspiel
 */
export function playFairyPlink(): void {
  const dest = globalAudio.getDestination();
  const ctx = globalAudio.getContext();
  if (!ctx || !dest) return;

  const now = ctx.currentTime;
  [1046.5, 2093.0].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const amp = idx === 0 ? 0.25 : 0.12;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(amp, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.25);
  });
}

/**
 * 4. Gate Cloner Chime: Cascading Bell Chord (C5 -> E5 -> G5 -> C6)
 */
export function playGateClonerChime(): void {
  const dest = globalAudio.getDestination();
  const ctx = globalAudio.getContext();
  if (!ctx || !dest) return;

  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, idx) => {
    const t = ctx.currentTime + idx * 0.05;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.38);
  });
}

/**
 * 5. Cytokine Champion Roar: Pillowy Brass Bloop
 */
export function playCytokineRoar(): void {
  const dest = globalAudio.getDestination();
  const ctx = globalAudio.getContext();
  if (!ctx || !dest) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(82, now + 0.45);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.5);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc.start(now);
  osc.stop(now + 0.58);
}

/**
 * 6. Biofilm Cracking Clack & Coin Jingle
 */
export function playBiofilmCrack(): void {
  const dest = globalAudio.getDestination();
  const ctx = globalAudio.getContext();
  if (!ctx || !dest) return;

  const now = ctx.currentTime;
  // Wooden clack
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.07);

  // Follow-up coin ring (B5 -> E6)
  [987.77, 1318.51].forEach((freq, idx) => {
    const t = now + 0.06 + idx * 0.07;
    const coinOsc = ctx.createOscillator();
    const coinGain = ctx.createGain();
    coinOsc.type = 'sine';
    coinOsc.frequency.setValueAtTime(freq, t);

    coinGain.gain.setValueAtTime(0.001, t);
    coinGain.gain.linearRampToValueAtTime(0.2, t + 0.005);
    coinGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    coinOsc.connect(coinGain);
    coinGain.connect(dest);
    coinOsc.start(t);
    coinOsc.stop(t + 0.27);
  });
}

/**
 * 7. Hold-to-Charge Magic Wand & Readiness Double-Bell
 */
export function playChargeReady(): void {
  const dest = globalAudio.getDestination();
  const ctx = globalAudio.getContext();
  if (!ctx || !dest) return;

  const now = ctx.currentTime;
  [783.99, 987.77].forEach((freq, idx) => {
    const t = now + idx * 0.06;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.38);
  });
}

/**
 * 8. Colony Nest Piñata Burst: Ascending Glissando & Fanfare
 */
export function playPinataFanfare(): void {
  const dest = globalAudio.getDestination();
  const ctx = globalAudio.getContext();
  if (!ctx || !dest) return;

  const now = ctx.currentTime;
  const fanfareNotes = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
  fanfareNotes.forEach((freq, idx) => {
    const t = now + idx * 0.08;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.55);
  });
}

/**
 * 9. Defeat / Nap Time: Gentle Music-Box Descending Lullaby
 */
export function playDefeatLullaby(): void {
  const dest = globalAudio.getDestination();
  const ctx = globalAudio.getContext();
  if (!ctx || !dest) return;

  const now = ctx.currentTime;
  const lullaby = [659.25, 587.33, 523.25, 392.0]; // E5, D5, C5, G4
  lullaby.forEach((freq, idx) => {
    const t = now + idx * 0.2;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}

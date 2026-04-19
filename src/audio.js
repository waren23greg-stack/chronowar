// ============================================================
//  CHRONOWAR — CINEMATIC AUDIO ENGINE
//  Procedural orchestral score inspired by Hans Zimmer /
//  Two Steps From Hell / Audiomachine.
//  Pure Web Audio API — zero external deps.
// ============================================================

let ctx = null;
let masterGain = null;
let musicGain  = null;
let sfxGain    = null;
let reverbNode = null;
let isRunning  = false;
let musicPhase = "calm"; // calm | tension | epic | finale

// ── Boot AudioContext on first user gesture ─────────────────
export function bootAudio() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.82, ctx.currentTime);
  masterGain.connect(ctx.destination);

  musicGain = ctx.createGain();
  musicGain.gain.setValueAtTime(0.55, ctx.currentTime);
  musicGain.connect(masterGain);

  sfxGain = ctx.createGain();
  sfxGain.gain.setValueAtTime(0.9, ctx.currentTime);
  sfxGain.connect(masterGain);

  reverbNode = buildReverb(3.2, 0.6);

  startCinematicScore();
  return ctx;
}

export function setMusicPhase(phase) {
  if (phase !== musicPhase) {
    musicPhase = phase;
  }
}

export function setMasterVolume(v) {
  if (!masterGain) return;
  masterGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.4);
}

// ─────────────────────────────────────────────────────────────
//  REVERB — impulse‑response convolver built from noise
// ─────────────────────────────────────────────────────────────
function buildReverb(duration = 3, decay = 0.7) {
  const convolver = ctx.createConvolver();
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  for (let c = 0; c < 2; c++) {
    const ch = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  convolver.buffer = impulse;
  convolver.connect(masterGain);
  return convolver;
}

// ─────────────────────────────────────────────────────────────
//  UTILITY — create oscillator with ADSR
// ─────────────────────────────────────────────────────────────
function osc(freq, type = "sine", attack = 0.02, decay = 0.1, sustain = 0.7, release = 0.4, duration = 0.6, destination = masterGain, detune = 0) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  if (detune) o.detune.setValueAtTime(detune, ctx.currentTime);
  o.connect(g);
  g.connect(destination);
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(sustain, ctx.currentTime + attack);
  g.gain.linearRampToValueAtTime(sustain * 0.75, ctx.currentTime + attack + decay);
  g.gain.setValueAtTime(sustain * 0.75, ctx.currentTime + duration - release);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + duration);
}

// send signal through reverb as well
function oscReverb(freq, type, attack, decay, sustain, release, duration, gain = 0.3, detune = 0) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  if (detune) o.detune.setValueAtTime(detune, ctx.currentTime);
  o.connect(g);
  const dryG = ctx.createGain();
  dryG.gain.setValueAtTime(gain * 0.6, ctx.currentTime);
  const wetG = ctx.createGain();
  wetG.gain.setValueAtTime(gain * 0.4, ctx.currentTime);
  g.connect(dryG);
  dryG.connect(masterGain);
  g.connect(wetG);
  wetG.connect(reverbNode);
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(1, ctx.currentTime + attack);
  g.gain.linearRampToValueAtTime(0.75, ctx.currentTime + attack + decay);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + duration);
}

// White noise burst
function noise(duration = 0.08, gainVal = 0.18, lpFreq = 4000) {
  if (!ctx) return;
  const bufLen = ctx.sampleRate * duration;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(lpFreq, ctx.currentTime);
  const g = ctx.createGain();
  g.gain.setValueAtTime(gainVal, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  src.connect(lp);
  lp.connect(g);
  g.connect(sfxGain);
  src.start();
  src.stop(ctx.currentTime + duration);
}

// ─────────────────────────────────────────────────────────────
//  MUSIC SYSTEM — layered procedural score
// ─────────────────────────────────────────────────────────────

// Scale / chord definitions (all in Hz, based on D minor / D Aeolian — Zimmer's favourite)
const NOTES = {
  D2: 73.42, A2: 110,   C3: 130.81, D3: 146.83, E3: 164.81,
  F3: 174.61, G3: 196,  A3: 220,    Bb3: 233.08, C4: 261.63,
  D4: 293.66, E4: 329.63, F4: 349.23, G4: 392,  A4: 440,
  C5: 523.25, D5: 587.33, F5: 698.46, G5: 784,  A5: 880,
};

// Chord voicings
const CHORDS = {
  Dm: [NOTES.D2, NOTES.A2, NOTES.D3, NOTES.F3, NOTES.A3],
  F:  [NOTES.C3, NOTES.F3, NOTES.A3, NOTES.C4],
  Gm: [NOTES.G3, NOTES.Bb3, NOTES.D4, NOTES.G4],
  Bb: [NOTES.F3, NOTES.Bb3, NOTES.D4, NOTES.F4],
  Am: [NOTES.A2, NOTES.E3, NOTES.A3, NOTES.C4],
  C:  [NOTES.C3, NOTES.E3, NOTES.G3, NOTES.C4],
};

const PROG_CALM    = ["Dm", "F",  "Gm", "Bb"];
const PROG_TENSION = ["Dm", "Am", "Gm", "C"];
const PROG_EPIC    = ["Dm", "Gm", "Bb", "F"];

let chordIdx = 0;
let musicTimer = null;

function playStringPad(chord, duration = 4.5, vol = 0.07) {
  if (!ctx || !chord) return;
  chord.forEach((freq, i) => {
    const detune = (i % 2 === 0 ? 1 : -1) * (3 + Math.random() * 4);
    // sawtooth gives string-like overtones, filtered down
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(600 + i * 200, ctx.currentTime);
    o.type = "sawtooth";
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    o.detune.setValueAtTime(detune, ctx.currentTime);
    o.connect(lp); lp.connect(g);
    const dry = ctx.createGain(); dry.gain.setValueAtTime(0.55, ctx.currentTime);
    const wet = ctx.createGain(); wet.gain.setValueAtTime(0.45, ctx.currentTime);
    g.connect(dry); dry.connect(musicGain);
    g.connect(wet); wet.connect(reverbNode);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.8);
    g.gain.setValueAtTime(vol, ctx.currentTime + duration - 0.9);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + duration);
  });
}

function playBrassStab(freq, delay = 0) {
  if (!ctx) return;
  [0, 7, 12].forEach((semitones, i) => {
    const f = freq * Math.pow(2, semitones / 12);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(1200, ctx.currentTime + delay);
    lp.frequency.linearRampToValueAtTime(2400, ctx.currentTime + delay + 0.15);
    o.type = "sawtooth";
    o.frequency.setValueAtTime(f, ctx.currentTime + delay);
    o.connect(lp); lp.connect(g);
    g.connect(musicGain);
    g.gain.setValueAtTime(0, ctx.currentTime + delay);
    g.gain.linearRampToValueAtTime(0.09 - i * 0.02, ctx.currentTime + delay + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.45);
    o.start(ctx.currentTime + delay);
    o.stop(ctx.currentTime + delay + 0.5);
  });
}

function playPercussion(delay = 0) {
  if (!ctx) return;
  // Timpani-like
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(80, ctx.currentTime + delay);
  o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + delay + 0.4);
  o.connect(g); g.connect(musicGain);
  g.gain.setValueAtTime(0, ctx.currentTime + delay);
  g.gain.linearRampToValueAtTime(0.25, ctx.currentTime + delay + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.6);
  o.start(ctx.currentTime + delay);
  o.stop(ctx.currentTime + delay + 0.7);
  // Snare noise hit
  noise(0.12, 0.12, 3000);
}

function getMusicBeat() {
  const prog = musicPhase === "tension" ? PROG_TENSION
             : musicPhase === "epic"    ? PROG_EPIC
             : PROG_CALM;
  const chordName = prog[chordIdx % prog.length];
  const chord = CHORDS[chordName];
  const dur = musicPhase === "calm" ? 5.5 : musicPhase === "tension" ? 4.0 : 3.0;
  chordIdx++;
  return { chord, dur, chordName };
}

function musicLoop() {
  if (!ctx) return;
  const { chord, dur } = getMusicBeat();
  const vol = musicPhase === "calm" ? 0.055 : musicPhase === "tension" ? 0.07 : 0.09;
  playStringPad(chord, dur, vol);

  if (musicPhase === "epic") {
    playBrassStab(chord[0], 0.1);
    playBrassStab(chord[2], 0.7);
    playPercussion(0);
    playPercussion(1.5);
  } else if (musicPhase === "tension") {
    playBrassStab(chord[0], 0.2);
    playPercussion(dur * 0.5);
  } else {
    // calm — occasional very soft brass
    if (chordIdx % 3 === 0) playBrassStab(chord[0] * 0.5, 1.0);
  }

  musicTimer = setTimeout(musicLoop, (dur - 0.3) * 1000);
}

function startCinematicScore() {
  if (isRunning) return;
  isRunning = true;
  // Fade-in delay
  setTimeout(() => {
    musicLoop();
  }, 800);
}

// ─────────────────────────────────────────────────────────────
//  SOUND EFFECTS — one function per game event
// ─────────────────────────────────────────────────────────────

export function sfxMove(isCapture = false, isCrossRealm = false) {
  if (!ctx) return;
  if (isCrossRealm) {
    sfxRealmTranscend();
    return;
  }
  if (isCapture) {
    sfxCapture();
    return;
  }
  // Wooden piece thock — impact + resonance
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(320, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.07);
  o.connect(g); g.connect(sfxGain);
  g.gain.setValueAtTime(0.35, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  o.start(); o.stop(ctx.currentTime + 0.15);
  noise(0.04, 0.09, 5000);
}

export function sfxCapture() {
  if (!ctx) return;
  // Impact crash — rising dissonance
  [1, 1.26, 1.587, 2].forEach((ratio, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = i < 2 ? "sawtooth" : "square";
    o.frequency.setValueAtTime(90 * ratio, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(45 * ratio, ctx.currentTime + 0.5);
    o.connect(g);
    const wet = ctx.createGain(); wet.gain.setValueAtTime(0.3, ctx.currentTime);
    g.connect(sfxGain); g.connect(wet); wet.connect(reverbNode);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.18 - i * 0.03, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    o.start(); o.stop(ctx.currentTime + 0.6);
  });
  noise(0.15, 0.22, 6000);
  // Metal sting
  setTimeout(() => {
    osc(880, "triangle", 0.005, 0.05, 0.3, 0.2, 0.4, sfxGain);
    osc(1108, "triangle", 0.005, 0.05, 0.2, 0.2, 0.35, sfxGain);
  }, 80);
}

export function sfxRealmTranscend() {
  if (!ctx) return;
  // Whoosh sweep + harmonic shimmer (portal opening)
  // Frequency sweep up
  const sweep = ctx.createOscillator();
  const sweepG = ctx.createGain();
  sweep.type = "sine";
  sweep.frequency.setValueAtTime(80, ctx.currentTime);
  sweep.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.7);
  sweep.connect(sweepG); sweepG.connect(sfxGain);
  sweepG.gain.setValueAtTime(0, ctx.currentTime);
  sweepG.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
  sweepG.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
  sweep.start(); sweep.stop(ctx.currentTime + 0.75);
  // Harmonic shimmer
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
    setTimeout(() => {
      oscReverb(freq, "triangle", 0.01, 0.1, 0.4, 0.3, 0.9, 0.18, (i % 2 === 0 ? 8 : -8));
    }, i * 60);
  });
  // Low ethereal drone
  oscReverb(NOTES.D2, "sine", 0.05, 0.1, 0.5, 0.4, 1.2, 0.2);
}

export function sfxCheck() {
  if (!ctx) return;
  // Alarm brass stab — rising 3 note sting
  const intervals = [0, 0.18, 0.36];
  const freqs     = [NOTES.A3, NOTES.C4, NOTES.E4];
  intervals.forEach((delay, i) => {
    setTimeout(() => {
      playBrassStab(freqs[i] * 0.5, 0);
      oscReverb(freqs[i], "sawtooth", 0.01, 0.05, 0.5, 0.15, 0.35, 0.22);
    }, delay * 1000);
  });
  // Low rumble
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(55, ctx.currentTime);
  o.connect(g); g.connect(sfxGain);
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.05);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  o.start(); o.stop(ctx.currentTime + 0.85);
}

export function sfxCheckmate() {
  if (!ctx) return;
  // EPIC FINALE — Hans Zimmer INCEPTION "BRAAAM" style
  // Deep bass hit
  [36.71, 55, 73.42].forEach((freq, i) => {
    setTimeout(() => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(400, ctx.currentTime);
      o.connect(lp); lp.connect(g);
      const wet = ctx.createGain(); wet.gain.setValueAtTime(0.5, ctx.currentTime);
      g.connect(sfxGain); g.connect(wet); wet.connect(reverbNode);
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.4 - i * 0.08, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      o.start(); o.stop(ctx.currentTime + 2.8);
    }, i * 120);
  });
  // Rising brass fanfare
  const fanfareNotes = [NOTES.D3, NOTES.F3, NOTES.A3, NOTES.D4, NOTES.F4, NOTES.A4];
  fanfareNotes.forEach((freq, i) => {
    setTimeout(() => {
      oscReverb(freq, "sawtooth", 0.03, 0.1, 0.6, 0.3, 0.8, 0.25, i % 2 === 0 ? 5 : -5);
    }, 300 + i * 130);
  });
  // Timpani rolls
  [0, 0.5, 1.0, 1.5, 2.0].forEach(t => {
    setTimeout(() => playPercussion(0), t * 1000);
  });
  // High choir shimmer
  setTimeout(() => {
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      oscReverb(freq, "triangle", 0.2, 0.3, 0.7, 0.8, 3.0, 0.15, i * 5);
    });
  }, 1000);
}

export function sfxGameStart() {
  if (!ctx) return;
  // Ceremonial low gong + horn call
  oscReverb(NOTES.D2, "sine", 0.01, 0.2, 0.6, 1.5, 3.0, 0.35);
  oscReverb(NOTES.A2, "sine", 0.01, 0.2, 0.5, 1.5, 2.5, 0.28);
  setTimeout(() => {
    playBrassStab(NOTES.D3 * 0.5, 0);
    playBrassStab(NOTES.F3 * 0.5, 0.25);
    playBrassStab(NOTES.A3 * 0.5, 0.5);
  }, 500);
  noise(0.3, 0.08, 2000);
}

export function sfxPromotion() {
  if (!ctx) return;
  // Ascending fanfare — triumph
  const ascend = [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.D5];
  ascend.forEach((freq, i) => {
    setTimeout(() => {
      oscReverb(freq, "triangle", 0.02, 0.05, 0.6, 0.3, 0.7, 0.25);
      osc(freq * 2, "sine", 0.02, 0.05, 0.3, 0.3, 0.5, sfxGain);
    }, i * 100);
  });
}

export function sfxAiThinking() {
  if (!ctx) return;
  // Subtle pulsing low tone — menacing
  oscReverb(NOTES.D2 * 0.5, "sine", 0.1, 0.2, 0.3, 0.5, 1.2, 0.12);
}

// ─────────────────────────────────────────────────────────────
//  MUSIC PHASE AUTO-MANAGEMENT
// ─────────────────────────────────────────────────────────────
export function updateMusicFromGame(moveNum, status, captureCount) {
  if (!ctx) return;
  if (status === "checkmate" || status === "stalemate") {
    setMusicPhase("finale");
    musicGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);
    return;
  }
  if (status === "check") {
    setMusicPhase("epic");
    return;
  }
  if (moveNum > 25 || captureCount > 8) {
    setMusicPhase("epic");
  } else if (moveNum > 12 || captureCount > 3) {
    setMusicPhase("tension");
  } else {
    setMusicPhase("calm");
  }
}

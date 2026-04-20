// ============================================================
//  CHRONOWAR — ORCHESTRAL AUDIO ENGINE v4
//  5 distinct cinematic compositions, smooth crossfade rotation
//
//  Track 1 — "Ashes of the Past"       D minor · Cello-led · Very slow
//  Track 2 — "The Living Battlefield"  A minor · Violin/harp · Urgent
//  Track 3 — "Voices From the Future"  E Dorian · Flute-led · Ethereal
//  Track 4 — "The Eternal March"       G minor · Full strings · Stately
//  Track 5 — "Chronicle's Twilight"    F major  · Violin+Flute · Warm
// ============================================================

// ── Context & routing nodes ───────────────────────────────
let ctx         = null;
let masterGain  = null;
let musicGain   = null;
let sfxGain     = null;
let reverb      = null;

// ── Music state ───────────────────────────────────────────
let _muted      = false;
let musicPhase  = "calm"; // "calm" | "tension" | "epic"

// ── Track rotation ────────────────────────────────────────
let trackIdx         = 0;
let chordInTrack     = 0;
let currentDest      = null;  // current sessionGain → musicGain
let musicTimer       = null;

// Publicly exported track name (for optional UI display)
export let currentTrackName = "";

// ─────────────────────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────────────────────
export function bootAudio() {
  if (ctx) { if (ctx.state === "suspended") ctx.resume(); return ctx; }
  ctx         = new (window.AudioContext || window.webkitAudioContext)();
  masterGain  = ctx.createGain(); masterGain.gain.value = 0.78; masterGain.connect(ctx.destination);
  musicGain   = ctx.createGain(); musicGain.gain.value  = 0.44; musicGain.connect(masterGain);
  sfxGain     = ctx.createGain(); sfxGain.gain.value    = 0.72; sfxGain.connect(masterGain);
  reverb      = buildReverb(4.8, 0.52);
  // First session gain
  currentDest = makeSessionGain(1.0);
  scheduleNextTrack(1200);
  return ctx;
}

export function setMasterVolume(v) {
  if (!masterGain) return;
  _muted = (v === 0);
  masterGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.5);
}

// ─────────────────────────────────────────────────────────
//  SESSION GAIN — isolated gain node per track instance
//  Voices route: osc → g → [dry → sessionGain → musicGain]
//                           [wet → reverb    → masterGain]
// ─────────────────────────────────────────────────────────
function makeSessionGain(initialVol = 0) {
  const g = ctx.createGain();
  g.gain.value = initialVol;
  g.connect(musicGain);
  return g;
}

// ─────────────────────────────────────────────────────────
//  REVERB — long hall impulse
// ─────────────────────────────────────────────────────────
function buildReverb(dur, decay) {
  const conv = ctx.createConvolver();
  const sr = ctx.sampleRate, len = Math.ceil(sr * dur);
  const buf = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < len; i++)
      ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  conv.buffer = buf; conv.connect(masterGain); return conv;
}

// ─────────────────────────────────────────────────────────
//  VOICE BUILDERS — each writes to currentDest
// ─────────────────────────────────────────────────────────

// Vol multiplier so phase-volume is applied at voice level
function phaseVol(v) {
  return v * (musicPhase === "epic" ? 1.25 : musicPhase === "tension" ? 1.10 : 1.0);
}

function violin(freq, dur = 2.5, vol = 0.07, vibDepth = 4, vibRate = 5.5, attack = 0.38, detune = 0, dest = null) {
  if (!ctx || !currentDest) return;
  dest = dest || currentDest;
  const t = ctx.currentTime;
  const lfo = ctx.createOscillator(), lfoG = ctx.createGain();
  lfo.frequency.value = vibRate; lfoG.gain.value = vibDepth; lfo.connect(lfoG);
  const osc = ctx.createOscillator();
  osc.type = "sawtooth"; osc.frequency.value = freq; osc.detune.value = detune;
  lfoG.connect(osc.frequency);
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 200;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass";  lp.frequency.value = 2600; lp.Q.value = 0.7;
  const pk = ctx.createBiquadFilter(); pk.type = "peaking";  pk.frequency.value = 800; pk.gain.value = 3; pk.Q.value = 1.2;
  const g = ctx.createGain();
  osc.connect(hp); hp.connect(pk); pk.connect(lp); lp.connect(g);
  const dry = ctx.createGain(); dry.gain.value = 0.55;
  const wet = ctx.createGain(); wet.gain.value = 0.45;
  const v = phaseVol(vol);
  g.connect(dry); dry.connect(dest); g.connect(wet); wet.connect(reverb);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + attack);
  g.gain.setValueAtTime(v * 0.88, t + dur - 0.7);
  g.gain.linearRampToValueAtTime(0, t + dur);
  lfo.start(t); lfo.stop(t + dur); osc.start(t); osc.stop(t + dur);
}

function cello(freq, dur = 3.5, vol = 0.07, attack = 0.55, dest = null) {
  violin(freq, dur, vol, 2.2, 4.0, attack, 0, dest);
}

function flute(freq, dur = 2.0, vol = 0.052, delay = 0, dest = null) {
  if (!ctx || !currentDest) return;
  dest = dest || currentDest;
  const t = ctx.currentTime + delay;
  const lfo = ctx.createOscillator(), lfoG = ctx.createGain();
  lfo.frequency.value = 5.9; lfoG.gain.value = 3.2; lfo.connect(lfoG);
  const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
  lfoG.connect(osc.frequency);
  const osc2 = ctx.createOscillator(); osc2.type = "sine"; osc2.frequency.value = freq * 2;
  const g1 = ctx.createGain(); g1.gain.value = 0.82;
  const g2 = ctx.createGain(); g2.gain.value = 0.12;
  osc.connect(g1); osc2.connect(g2);
  const mix = ctx.createGain(); g1.connect(mix); g2.connect(mix);
  const nLen = Math.ceil(ctx.sampleRate * Math.max(0.05, dur));
  const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
  const nd = nBuf.getChannelData(0);
  for (let i = 0; i < nLen; i++) nd[i] = (Math.random() * 2 - 1) * 0.014;
  const nSrc = ctx.createBufferSource(); nSrc.buffer = nBuf;
  const nbp = ctx.createBiquadFilter(); nbp.type = "bandpass"; nbp.frequency.value = freq; nbp.Q.value = 9;
  nSrc.connect(nbp); nbp.connect(mix);
  const gMain = ctx.createGain();
  mix.connect(gMain);
  const dry = ctx.createGain(); dry.gain.value = 0.5;
  const wet = ctx.createGain(); wet.gain.value = 0.5;
  const v = phaseVol(vol);
  gMain.connect(dry); dry.connect(dest); gMain.connect(wet); wet.connect(reverb);
  gMain.gain.setValueAtTime(0, t);
  gMain.gain.linearRampToValueAtTime(v, t + 0.18);
  gMain.gain.setValueAtTime(v, t + dur - 0.35);
  gMain.gain.linearRampToValueAtTime(0, t + dur);
  lfo.start(t); lfo.stop(t + dur); osc.start(t); osc.stop(t + dur);
  osc2.start(t); osc2.stop(t + dur); nSrc.start(t); nSrc.stop(t + dur);
}

function harp(freq, dur = 1.6, vol = 0.055, delay = 0, dest = null) {
  if (!ctx) return;
  dest = dest || currentDest || sfxGain;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = freq;
  const osc2 = ctx.createOscillator(); osc2.type = "sine"; osc2.frequency.value = freq * 2;
  const g1 = ctx.createGain(); g1.gain.value = 0.76;
  const g2 = ctx.createGain(); g2.gain.value = 0.24;
  osc.connect(g1); osc2.connect(g2);
  const gMain = ctx.createGain();
  g1.connect(gMain); g2.connect(gMain);
  const wet = ctx.createGain(); wet.gain.value = 0.5;
  gMain.connect(dest); gMain.connect(wet); wet.connect(reverb);
  gMain.gain.setValueAtTime(phaseVol(vol), t);
  gMain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t); osc.stop(t + dur); osc2.start(t); osc2.stop(t + dur);
}

// ─────────────────────────────────────────────────────────
//  THE FIVE COMPOSITIONS
// ─────────────────────────────────────────────────────────

// ── Hz reference ──
const Hz = {
  // Octave 2
  Bb1:58.27, D2:73.42,  Eb2:77.78, F2:87.31,  G2:98.00,
  Ab2:103.83,A2:110,    Bb2:116.54,B2:123.47,  C3:130.81,
  Cs3:138.59,D3:146.83, Eb3:155.56,E3:164.81,  F3:174.61,
  Fs3:185.00,G3:196,    Ab3:207.65,A3:220,      Bb3:233.08,
  B3:246.94, C4:261.63, Cs4:277.18,D4:293.66,  Eb4:311.13,
  E4:329.63, F4:349.23, Fs4:369.99,G4:392,     Ab4:415.30,
  A4:440,    Bb4:466.16,B4:493.88, C5:523.25,  D5:587.33,
  Eb5:622.25,E5:659.25, F5:698.46, Fs5:739.99, G5:784,
  A5:880,    Bb5:932.33,C6:1046.5,
};

// ─────────────────────────────────────────────────────────
// TRACK 1 — "Ashes of the Past"
// D minor · Solo cello dominant · Very slow 9s · Ancient, lonely
// ─────────────────────────────────────────────────────────
const T1 = {
  name: "Ashes of the Past",
  chordDur: 9.0,
  cyclesPerRotation: 5,  // 5 chords then rotate
  prog: [
    [Hz.D2, Hz.F3,  Hz.A3,  Hz.D4,  Hz.F4],
    [Hz.A2, Hz.E3,  Hz.A3,  Hz.C4,  Hz.E4],
    [Hz.C3, Hz.E3,  Hz.G3,  Hz.C4,  Hz.E4],
    [Hz.G2, Hz.D3,  Hz.G3,  Hz.Bb3, Hz.D4],
    [Hz.F2, Hz.C3,  Hz.F3,  Hz.A3,  Hz.C4],
  ],
  fluteNotes: [Hz.D5, Hz.A5, Hz.F5, Hz.D5, Hz.C5],
  play(notes, dur, fi) {
    // Solo cello — the star of this track
    cello(notes[0] * 0.5, dur, 0.095, 0.65);
    cello(notes[1] * 0.5, dur, 0.060, 0.75);
    // Sparse viola
    violin(notes[2], dur, 0.042, 3.0, 4.8, 0.55, 0);
    violin(notes[3], dur, 0.030, 3.2, 4.8, 0.65, 6);
    // Occasional flute — only every 2nd chord, single long note
    if (fi % 2 === 0) {
      flute(this.fluteNotes[fi % this.fluteNotes.length], dur * 0.7, 0.038, 1.0);
    }
  },
};

// ─────────────────────────────────────────────────────────
// TRACK 2 — "The Living Battlefield"
// A minor · Active violin + harp pulse · 4.5s · Urgent, forward-moving
// ─────────────────────────────────────────────────────────
const T2 = {
  name: "The Living Battlefield",
  chordDur: 4.5,
  cyclesPerRotation: 8,
  prog: [
    [Hz.A2, Hz.C3,  Hz.E3,  Hz.A3,  Hz.C4,  Hz.E4],
    [Hz.F2, Hz.C3,  Hz.F3,  Hz.A3,  Hz.C4],
    [Hz.G2, Hz.D3,  Hz.G3,  Hz.B3,  Hz.D4],
    [Hz.E3, Hz.B3,  Hz.E4,  Hz.G4],
    [Hz.A2, Hz.E3,  Hz.A3,  Hz.C4,  Hz.E4],
    [Hz.D3, Hz.F3,  Hz.A3,  Hz.D4],
    [Hz.G2, Hz.B3,  Hz.D4,  Hz.G4],
    [Hz.E3, Hz.G3,  Hz.B3,  Hz.E4],
  ],
  fluteNotes: [Hz.E5, Hz.C5, Hz.D5, Hz.B4||Hz.Bb4, Hz.A4, Hz.G4, Hz.A4, Hz.E5],
  play(notes, dur, fi) {
    // Cello foundation
    cello(notes[0] * 0.5, dur, 0.065, 0.5);
    // Active violin section — higher energy
    notes.slice(1, 4).forEach((n, i) =>
      violin(n, dur, 0.058, 4.5+i*0.4, 5.8, 0.30+i*0.04, i*5));
    notes.slice(3).forEach((n, i) =>
      violin(n, dur, 0.038, 5.0, 6.0, 0.38, -i*4));
    // Harp arpeggio pulse — every 1.1s through the chord
    const arpNotes = notes.slice(0, 4);
    arpNotes.forEach((n, i) => harp(n, dur * 0.38, 0.042, i * 1.1));
    // Short staccato flute phrase (2 notes quick)
    if (Math.random() > 0.35) {
      const fn = this.fluteNotes[fi % this.fluteNotes.length];
      flute(fn, dur * 0.35, 0.048, 0.2);
      flute(fn * 1.125, dur * 0.3, 0.038, dur * 0.38 + 0.1);
    }
  },
};

// ─────────────────────────────────────────────────────────
// TRACK 3 — "Voices From the Future"
// E Dorian · Flute dominant · 7s · Mysterious, ethereal, timeless
// ─────────────────────────────────────────────────────────
const T3 = {
  name: "Voices From the Future",
  chordDur: 7.0,
  cyclesPerRotation: 4,
  prog: [
    [Hz.E3, Hz.G3,  Hz.B3,  Hz.E4,  Hz.G4],
    [Hz.D3, Hz.Fs3, Hz.A3,  Hz.D4,  Hz.Fs4],
    [Hz.B2, Hz.D3,  Hz.Fs3, Hz.B3,  Hz.D4],
    [Hz.A2, Hz.Cs3, Hz.E3,  Hz.A3,  Hz.Cs4],
  ],
  fluteLines: [
    [Hz.E5, Hz.Fs5, Hz.G5, Hz.E5],
    [Hz.D5, Hz.Fs5, Hz.A5, Hz.D5],
    [Hz.B4, Hz.D5,  Hz.Fs5, Hz.B4||Hz.Bb4],
    [Hz.A4, Hz.Cs4, Hz.E5, Hz.A4],
  ],
  play(notes, dur, fi) {
    // Strings are the background — soft, high register, barely there
    cello(notes[0] * 0.5, dur, 0.045, 0.8);
    notes.slice(1, 3).forEach((n, i) =>
      violin(n, dur, 0.030, 3.5, 5.5, 0.6+i*0.1, i*8));
    notes.slice(2).forEach((n, i) =>
      violin(n, dur, 0.022, 4.0, 6.0, 0.7, -i*6));
    // Flute IS the melody — full phrase across the chord duration
    const line = this.fluteLines[fi % this.fluteLines.length];
    const noteDur = (dur - 0.4) / line.length;
    line.forEach((fn, i) => flute(fn, noteDur + 0.3, 0.058, i * noteDur));
    // Harp — high register shimmer only
    [notes[2], notes[3] || notes[2], notes[4] || notes[2]].forEach((n, i) =>
      harp(n * 2, dur * 0.3, 0.028, 0.5 + i * 2.0));
  },
};

// ─────────────────────────────────────────────────────────
// TRACK 4 — "The Eternal March"
// G minor · Full strings + harp pulse · 6s · Stately, ceremonial
// ─────────────────────────────────────────────────────────
const T4 = {
  name: "The Eternal March",
  chordDur: 6.0,
  cyclesPerRotation: 6,
  prog: [
    [Hz.G2,  Hz.D3,  Hz.G3,  Hz.Bb3, Hz.D4,  Hz.G4],
    [Hz.Eb2, Hz.Bb2, Hz.Eb3, Hz.G3,  Hz.Bb3, Hz.Eb4||Hz.E4],
    [Hz.Bb1, Hz.F2,  Hz.Bb2, Hz.D3,  Hz.F3,  Hz.Bb3],
    [Hz.F2,  Hz.C3,  Hz.F3,  Hz.A3,  Hz.C4,  Hz.F4],
    [Hz.G2,  Hz.Bb2, Hz.D3,  Hz.G3,  Hz.Bb3],
    [Hz.C3,  Hz.Eb3, Hz.G3,  Hz.C4,  Hz.Eb4||Hz.E4],
  ],
  fluteNotes: [Hz.G5, Hz.Bb5||Hz.A5, Hz.D5, Hz.F5, Hz.G5, Hz.Eb5||Hz.E5],
  play(notes, dur, fi) {
    // Heavy cello foundation
    cello(notes[0] * 0.5, dur, 0.098, 0.5);
    cello(notes[1] * 0.5, dur, 0.065, 0.58);
    // Full viola section
    notes.slice(1, 4).forEach((n, i) =>
      violin(n, dur, 0.065, 3.2+i*0.3, 5.0, 0.40+i*0.06, i*4));
    // Violin upper
    notes.slice(3).forEach((n, i) =>
      violin(n, dur, 0.048, 4.0, 5.5, 0.50, -i*5));
    // Harp heartbeat pulse — every 1.5s, like a march
    for (let t = 0; t < dur - 0.5; t += 1.5) {
      harp(notes[0], 1.2, 0.040, t);
      if (t > 0) harp(notes[2], 0.8, 0.026, t + 0.22);
    }
    // Flute countermelody (different from string notes — a counter line)
    const fn = this.fluteNotes[fi % this.fluteNotes.length];
    flute(fn, dur * 0.6, 0.045, 0.8);
    if (dur > 5.5) flute(fn * (185/196), dur * 0.45, 0.032, dur * 0.62);
  },
};

// ─────────────────────────────────────────────────────────
// TRACK 5 — "Chronicle's Twilight"
// F major (warm, not minor) · Violin + Flute dialogue · 6.5s
// ─────────────────────────────────────────────────────────
const T5 = {
  name: "Chronicle's Twilight",
  chordDur: 6.5,
  cyclesPerRotation: 5,
  prog: [
    [Hz.F2,  Hz.A2,  Hz.C3,  Hz.F3,  Hz.A3,  Hz.C4],
    [Hz.C3,  Hz.E3,  Hz.G3,  Hz.C4,  Hz.E4],
    [Hz.D3,  Hz.F3,  Hz.A3,  Hz.D4,  Hz.F4],
    [Hz.A2,  Hz.C3,  Hz.E3,  Hz.A3,  Hz.C4],
    [Hz.Bb1, Hz.F2,  Hz.Bb2, Hz.D3,  Hz.F3,  Hz.Bb3],
  ],
  // Violin melody and flute melody alternate each chord
  violinMelody: [Hz.C5, Hz.E5, Hz.D5, Hz.A4, Hz.Bb4||Hz.A4],
  fluteMelody:  [Hz.F5, Hz.G5, Hz.F5, Hz.E5, Hz.D5],
  play(notes, dur, fi) {
    // Warm cello — F major is warmer, less dark
    cello(notes[0] * 0.5, dur, 0.072, 0.6);
    // Viola layer
    notes.slice(1, 4).forEach((n, i) =>
      violin(n, dur, 0.050, 3.5+i*0.4, 5.3, 0.45+i*0.08, i*3));
    // Violin upper + melody in dialogue with flute
    // Even chords: violin carries melody
    // Odd chords: flute carries melody
    if (fi % 2 === 0) {
      // Violin melody phrase
      const vm = this.violinMelody[fi % this.violinMelody.length];
      violin(vm, dur * 0.72, 0.060, 5.5, 6.2, 0.28, 0);
      violin(vm * (186/196), dur * 0.55, 0.038, 5.2, 6.0, 0.32, -8);
      // Flute supports softly
      flute(this.fluteMelody[fi % this.fluteMelody.length], dur * 0.40, 0.028, dur * 0.65);
    } else {
      // Flute melody phrase
      const fm = this.fluteMelody[fi % this.fluteMelody.length];
      flute(fm, dur * 0.68, 0.058, 0.25);
      // Violin supports softly
      violin(this.violinMelody[(fi+1) % this.violinMelody.length], dur * 0.42, 0.032, 4.8, 5.8, 0.45, 0);
    }
    // Harp waltz arpeggio — 3-note up and down
    const arp = [notes[1], notes[2], notes[3] || notes[2]];
    arp.forEach((n, i) => harp(n, dur * 0.3, 0.038, 0.4 + i * (dur * 0.25)));
    arp.slice().reverse().forEach((n, i) => harp(n, dur * 0.25, 0.028, dur * 0.55 + i * (dur * 0.13)));
  },
};

const TRACKS = [T1, T2, T3, T4, T5];

// ─────────────────────────────────────────────────────────
//  CROSSFADE — fade out current session, start new track
// ─────────────────────────────────────────────────────────
const FADE_DUR = 3.2; // seconds

function crossfadeToNextTrack() {
  if (!ctx) return;

  // Determine next track — phase influences preference but doesn't override
  const forcedByPhase = musicPhase === "tension" ? [1, 3] // T2, T4
    : musicPhase === "epic" ? [3, 4]                      // T4, T5
    : null;

  let next;
  if (forcedByPhase && Math.random() < 0.4) {
    next = forcedByPhase[Math.floor(Math.random() * forcedByPhase.length)];
  } else {
    next = (trackIdx + 1) % TRACKS.length;
  }
  trackIdx = next;

  // Fade out old session
  const old = currentDest;
  if (old) {
    old.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_DUR);
    setTimeout(() => { try { old.disconnect(); } catch {} }, (FADE_DUR + 1) * 1000);
  }

  // New session fades in
  const newDest = makeSessionGain(0);
  newDest.gain.linearRampToValueAtTime(1.0, ctx.currentTime + FADE_DUR);
  currentDest = newDest;

  chordInTrack = 0;
  currentTrackName = TRACKS[trackIdx].name;
}

// ─────────────────────────────────────────────────────────
//  MUSIC LOOP
// ─────────────────────────────────────────────────────────
function scheduleNextTrack(delayMs = 0) {
  if (musicTimer) clearTimeout(musicTimer);
  musicTimer = setTimeout(musicLoop, delayMs);
}

function musicLoop() {
  if (!ctx || !currentDest) { scheduleNextTrack(5000); return; }

  const track = TRACKS[trackIdx];
  const dur   = track.chordDur * (musicPhase === "tension" ? 0.85 : musicPhase === "epic" ? 0.75 : 1.0);
  const chord = track.prog[chordInTrack % track.prog.length];

  if (!_muted) track.play(chord, dur, chordInTrack);

  chordInTrack++;

  // After cycling through all chords N times, crossfade to next track
  const totalChords = track.prog.length * track.cyclesPerRotation;
  if (chordInTrack >= totalChords) crossfadeToNextTrack();

  scheduleNextTrack((dur - 0.45) * 1000);
}

// ─────────────────────────────────────────────────────────
//  GAME PHASE
// ─────────────────────────────────────────────────────────
export function setMusicPhase(p) { musicPhase = p; }

export function updateMusicFromGame(moveNum, status, captures) {
  if (!ctx) return;
  if (status === "checkmate" || status === "stalemate" || status === "draw") {
    musicGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3); return;
  }
  const prev = musicPhase;
  musicPhase = status === "check"           ? "tension"
             : moveNum > 20 || captures > 6 ? "epic"
             : moveNum > 10 || captures > 2 ? "tension"
             : "calm";
  const vol = musicPhase === "calm" ? 0.44 : musicPhase === "tension" ? 0.52 : 0.60;
  musicGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 2.5);
  // Phase escalation also accelerates track transition
  if (prev === "calm" && musicPhase === "epic") {
    chordInTrack = Math.max(chordInTrack, TRACKS[trackIdx].prog.length * (TRACKS[trackIdx].cyclesPerRotation - 1));
  }
}

// ─────────────────────────────────────────────────────────
//  SFX — unchanged, routed to sfxGain (not sessionGain)
// ─────────────────────────────────────────────────────────

// Helper for sfx that uses sfxGain, not currentDest
function sfxViolin(freq, dur, vol, vibD, vibR, atk, detune) {
  violin(freq, dur, vol, vibD, vibR, atk, detune, sfxGain);
}
function sfxHarp(freq, dur, vol, delay) { harp(freq, dur, vol, delay, sfxGain); }
function sfxFlute(freq, dur, vol, delay) { flute(freq, dur, vol, delay, sfxGain); }

export function sfxMove(isCapture = false, isCrossRealm = false) {
  if (!ctx) return;
  if (isCrossRealm) { sfxRealmTranscend(); return; }
  if (isCapture)    { sfxCapture(); return; }
  sfxHarp(Hz.A4, 0.85, 0.055, 0);
  sfxHarp(Hz.E5, 0.65, 0.028, 0.045);
}

export function sfxCapture() {
  if (!ctx) return;
  sfxViolin(Hz.A4,  0.55, 0.068, 8, 6.5, 0.04, 0);
  sfxViolin(Hz.Bb3, 0.50, 0.054, 6, 6.0, 0.05, 0);
  sfxHarp(Hz.D4, 1.0, 0.046, 0.38);
}

export function sfxRealmTranscend() {
  if (!ctx) return;
  [Hz.D4,Hz.F4,Hz.A4,Hz.D5,Hz.F5,Hz.A5].forEach((f, i) =>
    sfxFlute(f, 0.55, 0.048+i*0.004, i * 0.1));
  [Hz.A5,Hz.C6,Hz.A5].forEach((f, i) =>
    sfxViolin(f, 1.6, 0.022, 6, 7, 0.3, i*8));
  [Hz.D4,Hz.F4,Hz.A4,Hz.D5].forEach((f, i) =>
    sfxHarp(f, 1.3, 0.040, i * 0.09));
}

export function sfxCheck() {
  if (!ctx) return;
  sfxViolin(Hz.E5, 0.7, 0.078, 5, 6, 0.04, 0);
  setTimeout(() => {
    sfxViolin(Hz.F5, 1.1, 0.072, 5, 6, 0.04, 0);
    sfxFlute(Hz.F5, 0.8, 0.050, 0);
  }, 260);
  sfxViolin(Hz.D2, 1.4, 0.060, 2.2, 4, 0.08, 0);
}

export function sfxCheckmate() {
  if (!ctx) return;
  sfxViolin(Hz.D2, 4.2, 0.10, 2.2, 4, 0.28, 0);
  sfxViolin(Hz.A2, 4.0, 0.085, 2.2, 4, 0.34, 0);
  [Hz.D3,Hz.F3,Hz.A3,Hz.D4,Hz.F4].forEach((f, i) =>
    sfxViolin(f, 3.8, 0.068-i*0.006, 5, 5.5, 0.42+i*0.08, i*5));
  [Hz.A4,Hz.D5,Hz.F5].forEach((f, i) =>
    sfxViolin(f, 3.4, 0.048, 5.5, 5.8, 0.55+i*0.1, -i*6));
  [Hz.D4,Hz.F4,Hz.A4,Hz.D5,Hz.F5,Hz.A5].forEach((f, i) =>
    sfxFlute(f, 0.65, 0.058, 0.65+i*0.27));
  [Hz.D4,Hz.F4,Hz.A4,Hz.D5,Hz.F5,Hz.D5,Hz.A4,Hz.F4].forEach((f, i) =>
    sfxHarp(f, 1.7, 0.042, 0.4+i*0.14));
}

export function sfxGameStart() {
  if (!ctx) return;
  [Hz.D3,Hz.F3,Hz.A3,Hz.D4,Hz.F4,Hz.A4,Hz.D5].forEach((f, i) =>
    sfxHarp(f, 2.4-i*0.18, 0.052, i*0.13));
  setTimeout(() => {
    sfxViolin(Hz.D2, 3.5, 0.075, 2.2, 4, 0.6, 0);
    sfxViolin(Hz.A4, 2.8, 0.055, 4.0, 5.5, 0.52, 0);
    sfxFlute(Hz.D5, 2.6, 0.050, 0);
  }, 950);
}

export function sfxPromotion() {
  if (!ctx) return;
  [Hz.D5,Hz.F5,Hz.A5,Hz.D5,Hz.A5].forEach((f, i) =>
    sfxFlute(f, 0.52, 0.060, i*0.17));
  [Hz.D4,Hz.A4,Hz.D5].forEach((f, i) =>
    sfxHarp(f, 1.1, 0.044, i*0.1));
}

export function sfxAiThinking() {
  if (!ctx) return;
  sfxViolin(Hz.D2 * 0.5, 1.7, 0.036, 2.2, 4, 0.85, 0);
}

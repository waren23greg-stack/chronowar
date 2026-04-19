// ============================================================
//  CHRONOWAR — ORCHESTRAL AUDIO ENGINE v3
//  Instrumentation: Violin · Viola · Cello · Flute · Harp
//  Mood: Cinematic, calm, deeply atmospheric
//  Key: D minor — warm, melancholic, ancient
// ============================================================

let ctx = null;
let masterGain = null;
let musicGain  = null;
let sfxGain    = null;
let reverb     = null;
let musicPhase = "calm";
let chordIdx   = 0;
let _muted     = false;

const F = {
  D2:73.42, A2:110, C3:130.81, D3:146.83, E3:164.81,
  F3:174.61, G3:196, A3:220, Bb3:233.08, C4:261.63,
  D4:293.66, E4:329.63, F4:349.23, G4:392, A4:440,
  Bb4:466.16, C5:523.25, D5:587.33, E5:659.25, F5:698.46,
  G5:784, A5:880, C6:1046.5,
};

// ─── Boot ────────────────────────────────────────────────
export function bootAudio() {
  if (ctx) { if (ctx.state === "suspended") ctx.resume(); return ctx; }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain(); masterGain.gain.value = 0.78; masterGain.connect(ctx.destination);
  musicGain  = ctx.createGain(); musicGain.gain.value  = 0.42; musicGain.connect(masterGain);
  sfxGain    = ctx.createGain(); sfxGain.gain.value    = 0.72; sfxGain.connect(masterGain);
  reverb = buildReverb(4.5, 0.55);
  startScore();
  return ctx;
}

export function setMasterVolume(v) {
  if (!masterGain) return;
  _muted = v === 0;
  masterGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.5);
}

export function setMusicPhase(p) { musicPhase = p; }

// ─── Reverb ──────────────────────────────────────────────
function buildReverb(dur, decay) {
  const conv = ctx.createConvolver();
  const sr = ctx.sampleRate, len = sr * dur;
  const buf = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  conv.buffer = buf; conv.connect(masterGain); return conv;
}

// ─── Violin/Viola — bowed string ─────────────────────────
function violin(freq, duration = 2.5, vol = 0.07, vibDepth = 4, vibRate = 5.5, attack = 0.38, detune = 0) {
  if (!ctx) return;
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
  g.connect(dry); dry.connect(musicGain); g.connect(wet); wet.connect(reverb);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.setValueAtTime(vol * 0.88, t + duration - 0.7);
  g.gain.linearRampToValueAtTime(0, t + duration);
  lfo.start(t); lfo.stop(t + duration);
  osc.start(t); osc.stop(t + duration);
}

// ─── Cello ───────────────────────────────────────────────
function cello(freq, duration = 3.5, vol = 0.07, attack = 0.5) {
  violin(freq, duration, vol, 2.2, 4.0, attack, 0);
}

// ─── Flute — pure sine + breath + vibrato ────────────────
function flute(freq, duration = 2.0, vol = 0.052, delay = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const lfo = ctx.createOscillator(), lfoG = ctx.createGain();
  lfo.frequency.value = 5.9; lfoG.gain.value = 3.2;
  lfo.connect(lfoG);
  const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
  lfoG.connect(osc.frequency);
  const osc2 = ctx.createOscillator(); osc2.type = "sine"; osc2.frequency.value = freq * 2;
  const g1 = ctx.createGain(); g1.gain.value = 0.82;
  const g2 = ctx.createGain(); g2.gain.value = 0.12;
  osc.connect(g1); osc2.connect(g2);
  const mix = ctx.createGain(); g1.connect(mix); g2.connect(mix);
  // Breath
  const nLen = Math.ceil(ctx.sampleRate * duration);
  const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
  const nd = nBuf.getChannelData(0);
  for (let i = 0; i < nLen; i++) nd[i] = (Math.random() * 2 - 1) * 0.015;
  const nSrc = ctx.createBufferSource(); nSrc.buffer = nBuf;
  const nbp = ctx.createBiquadFilter(); nbp.type = "bandpass"; nbp.frequency.value = freq; nbp.Q.value = 9;
  nSrc.connect(nbp); nbp.connect(mix);
  const gMain = ctx.createGain();
  mix.connect(gMain);
  const dry = ctx.createGain(); dry.gain.value = 0.5;
  const wet = ctx.createGain(); wet.gain.value = 0.5;
  gMain.connect(dry); dry.connect(musicGain); gMain.connect(wet); wet.connect(reverb);
  gMain.gain.setValueAtTime(0, t);
  gMain.gain.linearRampToValueAtTime(vol, t + 0.18);
  gMain.gain.setValueAtTime(vol, t + duration - 0.35);
  gMain.gain.linearRampToValueAtTime(0, t + duration);
  lfo.start(t); lfo.stop(t + duration);
  osc.start(t); osc.stop(t + duration);
  osc2.start(t); osc2.stop(t + duration);
  nSrc.start(t); nSrc.stop(t + duration);
}

// ─── Harp — triangle pluck ───────────────────────────────
function harp(freq, duration = 1.6, vol = 0.055, delay = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = freq;
  const osc2 = ctx.createOscillator(); osc2.type = "sine"; osc2.frequency.value = freq * 2;
  const g1 = ctx.createGain(); g1.gain.value = 0.76;
  const g2 = ctx.createGain(); g2.gain.value = 0.24;
  osc.connect(g1); osc2.connect(g2);
  const gMain = ctx.createGain();
  g1.connect(gMain); g2.connect(gMain);
  const wet = ctx.createGain(); wet.gain.value = 0.55;
  gMain.connect(sfxGain); gMain.connect(wet); wet.connect(reverb);
  gMain.gain.setValueAtTime(vol, t);
  gMain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t); osc.stop(t + duration);
  osc2.start(t); osc2.stop(t + duration);
}

// ─── Score chords ─────────────────────────────────────────
const CHORDS = {
  Dm: [F.D3,F.F3,F.A3,F.D4,F.F4,F.A4],
  Gm: [F.G3,F.Bb3,F.D4,F.G4,F.Bb4],
  Bb: [F.F3,F.Bb3,F.D4,F.F4],
  F:  [F.F3,F.A3,F.C4,F.F4,F.A4],
  Am: [F.A3,F.C4,F.E4,F.A4],
  C:  [F.C3,F.E3,F.G3,F.C4],
};
const FLUTE_LINES = {
  Dm:[F.F5,F.E5,F.D5,F.A5], Gm:[F.G5,F.F5,F.D5,F.Bb4],
  Bb:[F.D5,F.F5,F.Bb4,F.D5], F:[F.C5,F.A4,F.F5,F.C5],
  Am:[F.E5,F.C5,F.A4,F.E5], C:[F.E5,F.G5,F.C5,F.E5],
};
const PROGS = {
  calm:    ["Dm","F","Gm","Bb"],
  tension: ["Dm","Am","Gm","C"],
  epic:    ["Dm","Gm","Bb","Dm"],
};

function playChord(name, dur) {
  const notes = CHORDS[name] || CHORDS.Dm;
  const isEpic = musicPhase === "epic";
  const isTens = musicPhase === "tension";
  // Cello foundation
  cello(notes[0] * 0.5, dur, isEpic ? 0.09 : 0.065, 0.6);
  cello(notes[1] * 0.5, dur, 0.05, 0.65);
  // Viola middle
  notes.slice(1, 4).forEach((n, i) =>
    violin(n, dur, isEpic ? 0.062 : 0.045, 3.5+i*0.3, 5.2, 0.42+i*0.06, i*4));
  // Violin upper
  notes.slice(3).forEach((n, i) => {
    violin(n, dur, isEpic ? 0.048 : 0.033, 4.5+i*0.4, 5.8, 0.52+i*0.05, -i*5);
    violin(n, dur, isEpic ? 0.028 : 0.018, 4.0, 5.4, 0.58, 14+i*3);
  });
  // Flute
  const line = FLUTE_LINES[name] || FLUTE_LINES.Dm;
  if (isEpic) {
    line.forEach((n, i) => flute(n, dur / line.length + 0.15, 0.05, (dur / line.length) * i));
  } else if (Math.random() > 0.3) {
    flute(line[Math.floor(Math.random() * line.length)], dur * 0.55, 0.042, 0.3 + Math.random() * 0.6);
  }
  // Harp arpeggios on tension
  if (isTens) notes.slice(0, 4).forEach((n, i) => harp(n, dur * 0.45, 0.036, i * 0.18));
}

function musicLoop() {
  if (!ctx) { setTimeout(musicLoop, 5000); return; }
  const prog = PROGS[musicPhase] || PROGS.calm;
  const name = prog[chordIdx % prog.length];
  const dur  = musicPhase === "calm" ? 6.5 : musicPhase === "tension" ? 5.0 : 4.2;
  chordIdx++;
  if (!_muted) playChord(name, dur);
  setTimeout(musicLoop, (dur - 0.5) * 1000);
}

function startScore() { setTimeout(musicLoop, 1400); }

// ─── SFX ────────────────────────────────────────────────
export function sfxMove(isCapture = false, isCrossRealm = false) {
  if (!ctx) return;
  if (isCrossRealm) { sfxRealmTranscend(); return; }
  if (isCapture)    { sfxCapture();        return; }
  harp(F.A4, 0.85, 0.05, 0);
  harp(F.E5, 0.65, 0.026, 0.045);
}

export function sfxCapture() {
  if (!ctx) return;
  violin(F.A4, 0.55, 0.065, 8, 6.5, 0.04);
  violin(F.Bb3, 0.5,  0.052, 6, 6,   0.05);
  harp(F.D4, 1.0, 0.045, 0.38);
}

export function sfxRealmTranscend() {
  if (!ctx) return;
  [F.D4,F.F4,F.A4,F.D5,F.F5,F.A5].forEach((f, i) => flute(f, 0.55, 0.048+i*0.004, i * 0.1));
  [F.A5,F.C6,F.A5].forEach((f, i) => violin(f, 1.6, 0.022, 6, 7, 0.3, i*8));
  [F.D4,F.F4,F.A4,F.D5].forEach((f, i) => harp(f, 1.3, 0.04, i * 0.09));
}

export function sfxCheck() {
  if (!ctx) return;
  violin(F.E5, 0.7, 0.075, 5, 6, 0.04);
  setTimeout(() => { violin(F.F5, 1.1, 0.07, 5, 6, 0.04); flute(F.F5, 0.8, 0.048); }, 260);
  cello(F.D2, 1.4, 0.058, 0.07);
}

export function sfxCheckmate() {
  if (!ctx) return;
  cello(F.D2, 4.2, 0.10, 0.28); cello(F.A2, 4.0, 0.082, 0.34);
  [F.D3,F.F3,F.A3,F.D4,F.F4].forEach((f, i) => violin(f, 3.8, 0.068-i*0.006, 5, 5.5, 0.42+i*0.08, i*5));
  [F.A4,F.D5,F.F5].forEach((f, i) => violin(f, 3.4, 0.048, 5.5, 5.8, 0.55+i*0.1, -i*6));
  [F.D4,F.F4,F.A4,F.D5,F.F5,F.A5].forEach((f, i) => flute(f, 0.65, 0.058, 0.65+i*0.27));
  [F.D4,F.F4,F.A4,F.D5,F.F5,F.D5,F.A4,F.F4].forEach((f, i) => harp(f, 1.7, 0.042, 0.4+i*0.14));
}

export function sfxGameStart() {
  if (!ctx) return;
  [F.D3,F.F3,F.A3,F.D4,F.F4,F.A4,F.D5].forEach((f, i) => harp(f, 2.4-i*0.18, 0.052, i*0.13));
  setTimeout(() => {
    cello(F.D2, 3.5, 0.072, 0.6);
    violin(F.A4, 2.8, 0.052, 4, 5.5, 0.52);
    flute(F.D5, 2.6, 0.048);
  }, 950);
}

export function sfxPromotion() {
  if (!ctx) return;
  [F.D5,F.F5,F.A5,F.D5,F.A5].forEach((f, i) => flute(f, 0.52, 0.058, i*0.17));
  [F.D4,F.A4,F.D5].forEach((f, i) => harp(f, 1.1, 0.042, i*0.1));
}

export function sfxAiThinking() {
  if (!ctx) return;
  cello(F.D2 * 0.5, 1.7, 0.036, 0.85);
}

export function updateMusicFromGame(moveNum, status, captures) {
  if (!ctx) return;
  if (status === "checkmate" || status === "stalemate") {
    musicGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3); return;
  }
  musicPhase = status === "check"           ? "tension"
             : moveNum > 20 || captures > 6 ? "epic"
             : moveNum > 10 || captures > 2 ? "tension"
             : "calm";
  const vol = musicPhase === "calm" ? 0.42 : musicPhase === "tension" ? 0.50 : 0.57;
  musicGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 2.5);
}

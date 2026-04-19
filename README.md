<div align="center">

# ⚔ CHRONOWAR
### The Chronicles of Three Realms

*Chess reimagined — every move generates AI epic storytelling across three simultaneous timelines*

[![Live Demo](https://img.shields.io/badge/▶_PLAY_NOW-chronowar.vercel.app-d4a843?style=for-the-badge)](https://chronowar.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Powered by Claude](https://img.shields.io/badge/Narration-Claude_AI-c060ff?style=flat-square)](https://anthropic.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 🌍 What is ChronoWar?

ChronoWar is a **narrative chess variant** played across **three simultaneous 6×6 boards** — the amber *Past*, the emerald *Present*, and the violet *Future*. Every move you make is narrated in real-time by Claude AI as **epic mythic prose**, building a unique war chronicle that is yours alone.

It is chess. It is a story. It is a living legend.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌍 **Three Realms** | Past, Present & Future boards — all active simultaneously |
| 📖 **AI Narration** | Every move generates 2–3 verses of epic storytelling via Claude |
| 🤖 **AI Opponent** | Minimax + alpha-beta pruning across all three realms. Easy / Medium / Hard |
| 🏛 **Landing Page** | Cinematic hero page with feature showcase |
| 📚 **Tutorial** | 6-step interactive guide with live visual examples |
| 🏆 **Points & Ranking** | Chronicle Points, ELO rating, 7 rank tiers — persisted locally |
| 🎻 **Orchestral Score** | Procedural strings (violin/viola/cello/flute/harp) — pure Web Audio API |
| 📜 **Battle Chronicle** | Post-game Claude writes the entire war as one shareable epic story |
| 🎨 **SVG Pieces** | Hand-drawn dimensional chess pieces — no emoji |

---

## 🏛 The Factions

### ☀ The Luminar Order (White)
| Piece | Name | Movement |
|---|---|---|
| ♔ King | Monarch Auris the Eternal | 1 square any direction · can cross realms |
| ♕ Queen | Lady Solenne, Weaver of Time | Any direction, any distance |
| ♖ Rook | Pillar of Dawn | Orthogonal slides |
| ♗ Bishop | Temporal Seer | Diagonal slides |
| ♘ Knight | Chronorider | L-shaped jump |
| ♙ Pawn | Timewarden | Forward, captures diagonally |
| ✦ Sage | The Oracle | Rook-movement (orthogonal slides) |
| ◈ Phase Walker | Phase Walker | Diagonal slides — **phases through allied pieces** |

### 🌑 The Umbral Conclave (Black)
Mirrors the Luminar Order with dark counterparts: Lich-Lord Vex'rath, Void Empress Nythera, Void Riders, Shadow Phasers, and the Decay Oracle.

---

## 🌀 Cross-Realm Movement

- **Kings** can move between adjacent realms (Past ↔ Present ↔ Future)
- **Pawns** that reach the last rank can **promote** OR **cross into an adjacent realm**
- Cross-realm moves are highlighted with a portal shimmer and trigger a transcendence narration

---

## 🏆 Ranking System

| Rank | CP Required | Description |
|---|---|---|
| 🛡 Timewarden | 0 | Beginning of the journey |
| 🏇 Chronorider | 200 | First victories across time |
| ⚔ Realm Knight | 500 | Mastery of cross-realm tactics |
| ✦ Sage of Ages | 1,000 | Strategic mind across timelines |
| ◈ Phase Walker | 2,000 | Phase through opponent strategies |
| ♛ Time Sovereign | 4,000 | Dominion over past, present, future |
| ♔ Eternal Lord | 8,000 | Legend written in the chronicles |

### Chronicle Points (CP)
- Capture: **+5 CP** · Cross-realm move: **+3 CP** · Check: **+8 CP** · Promotion: **+12 CP**
- Win vs Easy: **+30 CP** · Win vs Medium: **+55 CP** · Win vs Hard: **+80 CP**
- Win in <20 moves: **+25 CP bonus** · Every 3-win streak: **+15 CP bonus**

---

## 🎻 Orchestral Audio Engine

Built entirely with the **Web Audio API** — no external audio files, no dependencies.

Instruments synthesized in real-time:
- **Violin & Viola** — Sawtooth → hi-pass → formant peak → low-pass filter → vibrato LFO
- **Cello** — Same chain, lower register, 0.6s bow attack
- **Flute** — Pure sine + harmonic overtone + breath bandpass noise + vibrato LFO
- **Harp** — Triangle oscillator with exponential decay (SFX layer)
- **Hall Reverb** — 4.5-second convolver built from exponential noise impulse

The score is in **D minor** and dynamically evolves across three phases:
- 🌙 **Calm** (moves 1–10): Soft string pads, sparse flute phrases
- ⚡ **Tension** (moves 11–20): Harp arpeggios added, fuller strings
- 🔥 **Epic** (moves 20+/check): Full ensemble, flute plays complete phrases each chord

---

## 🚀 Getting Started

```bash
git clone https://github.com/waren23greg-stack/chronowar.git
cd chronowar
npm install
```

Add your Anthropic API key (for AI narration):
```bash
# Create .env file
echo "VITE_ANTHROPIC_API_KEY=your_key_here" > .env
```

```bash
npm run dev     # Development server
npm run build   # Production build
```

---

## 🏗 Architecture

```
chronowar/
├── src/
│   ├── engine.js          ← Full 3-realm chess logic (zero deps, pure JS)
│   ├── ai.js              ← Minimax + alpha-beta pruning across 3 boards
│   ├── narrative.js       ← Claude API narration per move
│   ├── chronicle.js       ← Post-game full battle chronicle generation
│   ├── audio.js           ← Procedural orchestral score (Web Audio API)
│   ├── points.jsx         ← Chronicle Points, ELO, ranking system
│   ├── pieces.jsx         ← Hand-drawn SVG chess piece components
│   ├── App.jsx            ← Game orchestrator + state machine
│   ├── App.css            ← Cinematic dark design system + animations
│   └── components/
│       ├── LandingPage.jsx    ← Cinematic hero / feature page
│       ├── Tutorial.jsx       ← 6-step interactive guide
│       ├── RealmBoard.jsx     ← Each time-realm board (3D perspective)
│       ├── BoardSquare.jsx    ← Interactive square with SVG pieces
│       ├── ChroniclePanel.jsx ← Typewriter narration + saga scroll
│       └── GameOverlay.jsx    ← Cinematic checkmate/stalemate screen
```

---

## 🗺 Roadmap

- [ ] Online multiplayer (WebSockets)
- [ ] Shareable Chronicle card (screenshot / social)
- [ ] Global leaderboard
- [ ] Replay viewer — watch any past game
- [ ] Mobile-optimised layout
- [ ] Custom piece skin packs

---

<div align="center">

*"Two factions. Three realms. One eternal chronicle."*

**[▶ Play ChronoWar Now](https://chronowar.vercel.app)**

</div>

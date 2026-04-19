<div align="center">

# ⚔ CHRONOWAR
### The Chronicles of Three Realms

*Chess reimagined — every move generates AI epic storytelling across three simultaneous timelines*

[![Live Demo](https://img.shields.io/badge/▶_PLAY_NOW-chronowar.vercel.app-c89030?style=for-the-badge)](https://chronowar.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Powered by Claude](https://img.shields.io/badge/Narration-Claude_AI-8848c0?style=flat-square)](https://anthropic.com)
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
| 🗺 **Living Map** | Parchment map background that auto-shifts per active realm (Past/Present/Future) |
| 🏛 **Landing Page** | Cinematic hero page with feature showcase |
| 📚 **Tutorial** | 6-step interactive guide with live visual examples |
| 🏆 **Points & Ranking** | Chronicle Points, ELO rating, 7 rank tiers — persisted in localStorage |
| 🎻 **Orchestral Score** | Procedural strings (violin/viola/cello/flute/harp) — pure Web Audio API |
| 📜 **Battle Chronicle** | Post-game Claude writes the entire war as one shareable epic story |
| 🖼 **Chronicle Card** | Export a beautiful parchment image card (16:9 or 1:1) with QR code — share on X or Instagram |
| 🎨 **SVG Pieces** | Heraldic hand-drawn chess pieces — clean, high-contrast, no bloom |

---

## 🖼 Chronicle Card

After every checkmate, ChronoWar generates a **shareable image card** rendered entirely on HTML Canvas:

- **16:9 format** — optimised for X (Twitter) Cards
- **1:1 square format** — optimised for Instagram
- Painted parchment background with aged grain texture, ruled lines, and vignette
- Epic saga title (AI-generated), winner banner, key verse moments, battle statistics
- QR code linking to `chronowar.vercel.app` (landscape format)
- One-click PNG download or native Web Share API (`navigator.share`)
- X/Twitter intent fallback with pre-filled tweet text

---

## 🗺 Map Background System

The root background dynamically transitions (1.4s ease) whenever you interact with a different realm:

| Realm | Aesthetic | Palette |
|---|---|---|
| ⏳ Past | Aged sepia parchment | Amber/gold, ruled lines, age spots |
| ⚔ Present | Military topo map | Muted greens, grid, contour ellipse |
| ✧ Future | Indigo vellum blueprint | Cool purple, crosshatch, star dots |

Each board also carries an inline SVG map-texture pattern overlay (no external files).

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
Mirrors the Luminar Order: Lich-Lord Vex'rath, Void Empress Nythera, Void Riders, Shadow Phasers, and the Decay Oracle.

---

## 🌀 Cross-Realm Movement

- **Kings** can move between adjacent realms (Past ↔ Present ↔ Future)
- **Pawns** that reach the last rank can **promote** OR **cross into an adjacent realm**
- Cross-realm moves trigger a flute glissando + portal shimmer + dedicated narration

---

## 🏆 Ranking System

| Rank | CP Required |
|---|---|
| 🛡 Timewarden | 0 |
| 🏇 Chronorider | 200 |
| ⚔ Realm Knight | 500 |
| ✦ Sage of Ages | 1,000 |
| ◈ Phase Walker | 2,000 |
| ♛ Time Sovereign | 4,000 |
| ♔ Eternal Lord | 8,000 |

**Chronicle Points:** Capture +5 · Cross-realm +3 · Check +8 · Promotion +12 · Win (Hard) +80 · Fast win (<20 moves) +25

---

## 🎻 Orchestral Audio Engine

Pure **Web Audio API** — no external files, no dependencies.

- **Violin & Viola** — Sawtooth → hi-pass → formant peak → low-pass → vibrato LFO
- **Cello** — Warm bowed bass, 0.6s bow attack
- **Flute** — Pure sine + harmonic overtone + breath bandpass noise + vibrato
- **Harp** — Triangle pluck with exponential decay (SFX layer)
- **Hall Reverb** — 4.5s convolver built from exponential noise impulse response
- **Key: D minor** — 3-phase score: Calm → Tension → Epic

---

## 🚀 Getting Started

```bash
git clone https://github.com/waren23greg-stack/chronowar.git
cd chronowar
npm install
echo "VITE_ANTHROPIC_API_KEY=your_key_here" > .env
npm run dev
```

---

## 🏗 Architecture

```
chronowar/
├── src/
│   ├── engine.js              ← 3-realm chess logic (pure JS, zero deps)
│   ├── ai.js                  ← Minimax + alpha-beta across 3 boards
│   ├── narrative.js           ← Claude API narration per move
│   ├── chronicle.js           ← Post-game full battle chronicle
│   ├── audio.js               ← Procedural orchestral score
│   ├── points.jsx             ← Chronicle Points, ELO, ranking
│   ├── pieces.jsx             ← Heraldic SVG chess pieces
│   ├── App.jsx                ← Game orchestrator + state machine
│   ├── App.css                ← Parchment map design system
│   └── components/
│       ├── LandingPage.jsx    ← Cinematic hero page
│       ├── Tutorial.jsx       ← 6-step interactive guide
│       ├── ChronicleCard.jsx  ← Canvas image card generator + share
│       ├── RealmBoard.jsx     ← Map-textured realm boards (3D)
│       ├── BoardSquare.jsx    ← Squares with heraldic SVG pieces
│       ├── ChroniclePanel.jsx ← Typewriter narration + saga scroll
│       └── GameOverlay.jsx    ← Checkmate / stalemate screen
```

---

## 🗺 Roadmap

- [ ] Online multiplayer (WebSockets — two players, shared live chronicle)
- [ ] Global leaderboard
- [ ] Replay viewer — scrub through any past game
- [ ] Mobile-optimised layout (swipe between realms)
- [ ] Piece skin packs (Egyptian, Norse, Wireframe — unlock with CP)

---

<div align="center">

*"Two factions. Three realms. One eternal chronicle."*

**[▶ Play ChronoWar Now](https://chronowar.vercel.app)**

</div>

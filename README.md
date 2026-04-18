# ⚔ CHRONOWAR — The Chronicles of Three Realms

> *"Two armies stand at the precipice of eternity. The war across time awaits your command."*

**CHRONOWAR** is a narrative chess variant where every single move generates an epic, AI-narrated story verse. Not just strategy — a living saga written in real time.

---

## 🌌 The Concept

Built on [Stratovision](https://github.com/waren23greg-stack/stratovision)'s 3-realm chess variant, CHRONOWAR fuses deep strategic gameplay with **AI-powered mythic storytelling**. Every move you make becomes a verse in an immortal chronicle narrated by Claude.

---

## ⚔ The Two Factions

| Faction | Pieces | Color |
|---|---|---|
| **Luminar Order** | Monarch Auris, Lady Solenne, Chronoriders, Phase Walkers... | ⚪ Gold & Amber |
| **Umbral Conclave** | Lich-Lord Vex'rath, Void Empress Nythera, Void Riders, Shadow Phasers... | ⚫ Violet & Shadow |

---

## 🕰 Three Realms of Time

| Realm | Atmosphere | Mechanic |
|---|---|---|
| **Past Echoes** | Sepia amber — where strategies are born | Gateway to history |
| **The Living War** | Emerald — the eternal battleground | Main arena |
| **Fate's Shadow** | Violet — destiny yet unwritten | Gateway to tomorrow |

---

## ✦ Unique Pieces

| Symbol | Name | Ability |
|---|---|---|
| ✦ / ✧ | **Sage / Decay Oracle** | Slides orthogonally (rook movement) |
| ◈ / ◉ | **Phase Walker / Shadow Phaser** | Slides diagonal + phases through own pieces |
| ♔ / ♚ | **King** | 1 step any direction + cross-realm teleportation |
| ♙ / ♟ | **Pawn** | Advances forward + cross-realm jumps |

---

## 📜 The Narrative Engine

Every move triggers a **live Claude API call** generating 2–3 sentences of mythic prose:

- Characters addressed by **full lore names**
- Captures narrated as **deaths of legendary warriors**
- Cross-realm moves become **transcendences through time**
- Check moments become **doom approaching the King**
- Promotions become **apotheosis of a humble soldier**
- Each verse **builds on the previous ones** — the saga is continuous

---

## 🚀 Getting Started

```bash
git clone https://github.com/waren23greg-stack/chronowar
cd chronowar
npm install
npm run dev
```

Open `http://localhost:5173` and begin the war.

---

## 🛠 Tech Stack

| Technology | Role |
|---|---|
| React 18 + Vite | Frontend framework & build tool |
| Vanilla JS engine.js | Full chess logic — zero dependencies |
| Claude API (claude-sonnet-4-20250514) | Real-time narrative generation |
| Google Fonts — Cinzel + Crimson Text | Mythic typography |
| Pure CSS animations | Stars, glows, typewriter, piece float |

---

## 🧠 IQ-Building Mechanics

- **Multi-dimensional thinking** — plan across 3 simultaneous boards
- **Cross-realm vision** — track pieces that can teleport between time periods
- **Phantom strategy** — Phase Walkers slide through allied pieces
- **Narrative pattern recognition** — the story reflects your strategic choices
- **Emotional engagement** — narration makes you care about each piece

---

## 📁 Project Structure

```
src/
├── engine.js              # Full game logic (no dependencies)
├── narrative.js           # Claude API narration service
├── App.jsx                # Main game orchestrator
├── App.css                # Epic dark mythic design system
├── components/
│   ├── RealmBoard.jsx     # Individual 6x6 board per realm
│   ├── BoardSquare.jsx    # Single interactive square
│   ├── ChroniclePanel.jsx # Narrative display + saga scroll + legend
│   └── GameOverlay.jsx    # Checkmate / stalemate cinematic
└── main.jsx               # Entry point
```

---

## 🎮 How to Play

1. **Click any of your pieces** — valid moves appear as glowing dots
2. **Click a glowing dot** to move — the AI Chronicler narrates the moment
3. **Brighter glowing dots** = cross-realm moves that send your piece through time
4. **Kings and Pawns** can cross realms — the strategy is three-dimensional
5. **Phase Walkers** slide diagonally through your own pieces
6. Win by **checkmating** the enemy King across any of the three realms

---

*Built with fire, ambition, and the belief that chess can be more than moves — it can be myth.*

**⚔ LUMINAR ORDER vs UMBRAL CONCLAVE. Eternity awaits.**

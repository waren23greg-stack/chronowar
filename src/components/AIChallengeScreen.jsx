// ============================================================
//  CHRONOWAR — AI Challenge Screen
//  Pre-game setup: Attack or Defend, difficulty, outcome preview
// ============================================================
import { useState } from "react";
import { King, Queen, Rook, Knight } from "../pieces";
import { getRank } from "../points.jsx";

// ── AI Personas per difficulty ────────────────────────────
export const AI_PERSONAS = {
  easy: {
    name: "The Apprentice",
    title: "Void Initiate",
    piece: "Pawn",
    portrait: <Rook size={52} isWhite={false} />,
    flavor: "A novice of the Umbral Conclave, still learning the ways of temporal warfare. Beatable. Useful for honing your eye.",
    taunts: [
      "The void stirs…",
      "I am still learning these timelines…",
      "Each realm is so vast…",
      "Perhaps I miscalculated…",
    ],
    winTaunt:  "I was not ready. Return when you seek a true challenge.",
    loseTaunt: "Even an apprentice can surprise a careless foe.",
    color: "#80a040",
    cpReward: 30,
    cpDraw: -12,
    cpLoss: -20,
    eloK: 16,
  },
  medium: {
    name: "Void Rider Keth",
    title: "Shadow Commander",
    piece: "Knight",
    portrait: <Knight size={52} isWhite={false} />,
    flavor: "A seasoned Umbral commander who has crossed all three timelines. Expects a fight. Will not go easy.",
    taunts: [
      "Void Rider Keth senses your weakness…",
      "The Past realm is already mine…",
      "Your formation is exposed in the Future…",
      "Keth has seen this gambit before.",
    ],
    winTaunt:  "A worthy clash. The chronicles will remember this war.",
    loseTaunt: "The shadows swallow the unprepared.",
    color: "#8848c0",
    cpReward: 65,
    cpDraw: 15,
    cpLoss: -10,
    eloK: 24,
  },
  hard: {
    name: "Lich-Lord Vex'rath",
    title: "Eternal Sovereign of the Umbral Conclave",
    piece: "King",
    portrait: <King size={52} isWhite={false} />,
    flavor: "The supreme commander. He has never lost across three timelines. Every move is a trap laid fourteen moves earlier.",
    taunts: [
      "Lich-Lord Vex'rath pierces all three timelines…",
      "You cannot see what I already know…",
      "The future is decided. You simply haven't caught up.",
      "Your King is already surrounded. You just don't know it yet.",
    ],
    winTaunt:  "Impossible. Yet you stand. The chronicles will sing of this.",
    loseTaunt: "The Eternal War was decided before your first move.",
    color: "#ee4444",
    cpReward: 130,
    cpDraw: 40,
    cpLoss: 5,
    eloK: 32,
  },
};

// ── CP deduction for quitting ─────────────────────────────
export const QUIT_PENALTY = { easy: -8, medium: -18, hard: -5 };

// ── Stance card ───────────────────────────────────────────
function StanceCard({ label, icon, desc, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        flex: 1, padding: "18px 16px",
        background: selected ? "rgba(180,130,30,.2)" : "rgba(255,255,255,.06)",
        border: `2px solid ${selected ? "rgba(200,155,40,.7)" : "rgba(100,70,20,.2)"}`,
        borderRadius: 10, cursor: "pointer",
        transition: "all .22s",
        transform: selected ? "translateY(-3px)" : "none",
        boxShadow: selected ? "0 8px 24px rgba(0,0,0,.4)" : "none",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "2.2rem", marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".72rem", letterSpacing: "3px", color: selected ? "#e8c840" : "rgba(200,170,100,.65)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: ".82rem", color: "rgba(200,180,140,.55)", lineHeight: 1.65, fontStyle: "italic" }}>{desc}</div>
    </div>
  );
}

// ── Reward row ────────────────────────────────────────────
function RewardRow({ icon, label, value, color, negative }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(180,140,40,.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: ".95rem" }}>{icon}</span>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: ".46rem", letterSpacing: "1px", color: "rgba(180,150,80,.65)" }}>{label}</span>
      </div>
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: ".6rem", fontWeight: 700, color: color || (negative ? "#e05050" : "#c8a840") }}>
        {negative ? "" : value > 0 ? "+" : ""}{value} CP
      </span>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────
export default function AIChallengeScreen({ difficulty, setDifficulty, onBegin, onBack, playerStats }) {
  const [stance, setStance] = useState("attack"); // "attack" | "defend"
  const persona = AI_PERSONAS[difficulty] || AI_PERSONAS.medium;
  const rank = playerStats ? getRank(playerStats.cp || 0) : null;

  const isDefend = stance === "defend";
  // Defending (playing Black) gives bonus multiplier
  const defendMult  = isDefend ? 1.4 : 1.0;
  const cpWin  = Math.round(persona.cpReward  * defendMult);
  const cpDraw = persona.cpDraw > 0 ? Math.round(persona.cpDraw * defendMult) : persona.cpDraw;
  const cpLoss = persona.cpLoss;
  const cpQuit = QUIT_PENALTY[difficulty];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(2,1,8,.95)",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 150,
      fontFamily: "'Crimson Text', serif",
    }}>
      {/* Stars */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(i * 47.3 + 11) % 100}%`,
            top:  `${(i * 83.1 + 7)  % 100}%`,
            width: 1.5, height: 1.5,
            borderRadius: "50%", background: "white", opacity: 0.06,
          }} />
        ))}
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        width: "min(740px, 96vw)",
        maxHeight: "94vh", overflowY: "auto",
        padding: "32px 28px 28px",
        background: "linear-gradient(160deg, #0e0a06 0%, #1a1208 100%)",
        border: "1px solid rgba(180,138,46,.32)",
        borderRadius: 16,
        boxShadow: "0 0 100px rgba(0,0,0,.8), 0 0 40px rgba(180,138,46,.08)",
        animation: "overlayIn .45s cubic-bezier(.34,1.56,.64,1)",
      }}>

        {/* Back */}
        <button onClick={onBack} style={{
          background: "none", border: "none",
          fontFamily: "'Cinzel', serif", fontSize: ".46rem",
          letterSpacing: "3px", color: "rgba(180,140,60,.4)",
          cursor: "pointer", marginBottom: 24, padding: 0,
        }}>← BACK</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".46rem", letterSpacing: "6px", color: "rgba(180,130,40,.4)", marginBottom: 8 }}>
            CHOOSE YOUR CHALLENGE
          </div>
          <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.6rem", color: "#d4a843", letterSpacing: "4px", textShadow: "0 0 30px rgba(200,160,40,.25)" }}>
            FACE THE CONCLAVE
          </div>
        </div>

        {/* Difficulty tabs */}
        <div style={{ display: "flex", border: "1px solid rgba(100,70,20,.25)", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
          {[["easy","APPRENTICE"],["medium","COMMANDER"],["hard","LICH-LORD"]].map(([d, l]) => (
            <button key={d} onClick={() => setDifficulty(d)} style={{
              flex: 1, padding: "11px 0",
              background: difficulty === d ? "rgba(180,130,30,.2)" : "transparent",
              border: "none",
              borderRight: d !== "hard" ? "1px solid rgba(100,70,20,.25)" : "none",
              fontFamily: "'Cinzel', serif",
              fontSize: ".48rem", letterSpacing: "2px",
              color: difficulty === d ? AI_PERSONAS[d].color : "rgba(140,105,40,.45)",
              cursor: "pointer", transition: "all .2s",
            }}>{l}</button>
          ))}
        </div>

        {/* AI Persona card */}
        <div style={{
          display: "flex", gap: 20, alignItems: "flex-start",
          padding: "20px 22px",
          background: "rgba(255,255,255,.04)",
          border: `1px solid ${persona.color}30`,
          borderRadius: 10, marginBottom: 24,
          boxShadow: `0 0 30px ${persona.color}0a`,
        }}>
          <div style={{ flexShrink: 0, padding: "8px 8px 4px", background: "rgba(0,0,0,.3)", borderRadius: 8, border: `1px solid ${persona.color}25` }}>
            {persona.portrait}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".44rem", letterSpacing: "3px", color: `${persona.color}aa`, marginBottom: 4 }}>
              {persona.title.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".9rem", color: "#e8d5a3", marginBottom: 8, letterSpacing: "2px" }}>
              {persona.name}
            </div>
            <div style={{ fontSize: ".88rem", color: "rgba(200,180,140,.6)", lineHeight: 1.72, fontStyle: "italic" }}>
              "{persona.flavor}"
            </div>
            {/* Taunt preview */}
            <div style={{
              marginTop: 10, padding: "7px 10px",
              background: "rgba(0,0,0,.25)", borderRadius: 6,
              fontSize: ".78rem", color: "rgba(180,140,80,.5)", fontStyle: "italic",
            }}>
              〝{persona.taunts[0]}〟
            </div>
          </div>
        </div>

        {/* Stance selection */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".44rem", letterSpacing: "4px", color: "rgba(180,130,40,.45)", marginBottom: 12 }}>
            YOUR STANCE
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <StanceCard
              label="ATTACK"
              icon="⚔"
              desc="Play as White. Move first. Take the war to them."
              selected={stance === "attack"}
              onSelect={() => setStance("attack")}
            />
            <StanceCard
              label="DEFEND"
              icon="🛡"
              desc="Play as Black. Respond. Turn their aggression against them. +40% CP on win."
              selected={stance === "defend"}
              onSelect={() => setStance("defend")}
            />
          </div>
        </div>

        {/* Outcome preview */}
        <div style={{
          padding: "18px 20px",
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(100,70,20,.2)",
          borderRadius: 10, marginBottom: 24,
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".44rem", letterSpacing: "4px", color: "rgba(180,130,40,.45)", marginBottom: 14 }}>
            OUTCOME CONSEQUENCES
          </div>
          <RewardRow icon="🏆" label="Victory" value={cpWin} />
          <RewardRow icon="🤝" label="Draw" value={cpDraw} negative={cpDraw < 0} />
          <RewardRow icon="💀" label="Defeat" value={cpLoss} negative={cpLoss < 0} color={cpLoss >= 0 ? "#88cc88" : "#e05050"} />
          <RewardRow icon="🚪" label="Quit (penalty)" value={cpQuit} negative />
          <div style={{ marginTop: 10, fontSize: ".76rem", fontStyle: "italic", color: "rgba(150,120,60,.45)", lineHeight: 1.6 }}>
            {isDefend && cpWin > persona.cpReward
              ? `Defend bonus active — +40% CP for holding the line as Black.`
              : difficulty === "hard"
              ? "A noble loss to Vex'rath earns respect. A draw is legendary."
              : difficulty === "easy"
              ? "You should beat the Apprentice. A draw is embarrassing."
              : "A draw against Keth is respectable. Victory is expected."}
          </div>
        </div>

        {/* Player rank (if signed in) */}
        {rank && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "10px 14px", background: "rgba(255,255,255,.03)", borderRadius: 8, border: "1px solid rgba(100,70,20,.15)" }}>
            <span style={{ fontSize: "1.1rem" }}>{rank.icon}</span>
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".46rem", letterSpacing: "2px", color: rank.color }}>{rank.name.toUpperCase()}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".38rem", color: "rgba(140,110,50,.5)", letterSpacing: "1px" }}>{playerStats.cp} CHRONICLE POINTS</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".46rem", color: "rgba(140,110,50,.55)" }}>ELO {playerStats.elo}</div>
          </div>
        )}

        {/* Begin button */}
        <button
          onClick={() => onBegin({ stance, difficulty })}
          style={{
            width: "100%", padding: "16px 0",
            background: `linear-gradient(135deg, rgba(80,45,8,.97), rgba(120,68,12,.97))`,
            border: `1.5px solid ${persona.color}60`,
            borderRadius: 9, cursor: "pointer",
            fontFamily: "'Cinzel', serif",
            fontSize: ".75rem", letterSpacing: "5px",
            color: "#f0d060",
            boxShadow: `0 4px 24px rgba(0,0,0,.4), 0 0 30px ${persona.color}12`,
            transition: "all .22s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,.5), 0 0 40px ${persona.color}20`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,.4), 0 0 30px ${persona.color}12`; }}
        >
          {stance === "defend" ? "🛡 HOLD THE LINE" : "⚔ ENTER THE WAR"}
        </button>
      </div>
    </div>
  );
}

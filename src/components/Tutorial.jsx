// ============================================================
//  CHRONOWAR — Interactive Tutorial
// ============================================================
import { useState } from "react";

const STEPS = [
  {
    title: "The Three Realms",
    icon: "🌍",
    content: "ChronoWar is played across three simultaneous 6×6 boards: the amber Past, the emerald Present, and the violet Future. Each realm has its own army, but they are all part of one war.",
    visual: (
      <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "16px 0" }}>
        {[
          { name: "PAST", color: "#d4a04a", bg: "rgba(90,55,10,.35)" },
          { name: "PRESENT", color: "#44bb66", bg: "rgba(20,80,35,.35)", big: true },
          { name: "FUTURE", color: "#8855ee", bg: "rgba(50,20,100,.35)" },
        ].map((r, i) => (
          <div key={i} style={{
            background: r.bg,
            border: `1px solid ${r.color}55`,
            borderRadius: 8,
            padding: r.big ? "16px 20px" : "12px 16px",
            textAlign: "center",
            fontFamily: "'Cinzel', serif",
            fontSize: ".55rem", letterSpacing: "3px",
            color: r.color,
            boxShadow: `0 0 14px ${r.color}22`,
          }}>{r.name}</div>
        ))}
      </div>
    ),
  },
  {
    title: "Standard Chess Pieces",
    icon: "♟",
    content: "All pieces follow classical chess movement: Kings, Queens, Rooks (Sages), Bishops, Knights, and Pawns. The same rules of check, checkmate, and stalemate apply.",
    visual: (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "14px 0" }}>
        {[
          ["King ♔♚", "Moves 1 square any direction"],
          ["Queen ♕♛", "Slides any direction, any distance"],
          ["Sage ✦✧", "Slides orthogonally (like a Rook)"],
          ["Bishop ♗♝", "Slides diagonally any distance"],
          ["Knight ♘♞", "Jumps in an L-shape"],
          ["Pawn ♙♟", "Moves forward, captures diagonally"],
        ].map(([p, d], i) => (
          <div key={i} style={{
            background: "rgba(15,8,30,.7)",
            border: "1px solid rgba(100,65,150,.2)",
            borderRadius: 6, padding: "8px 10px",
          }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".55rem", color: "rgba(210,170,60,.85)", marginBottom: 4 }}>{p}</div>
            <div style={{ fontSize: ".78rem", color: "rgba(180,155,120,.7)", lineHeight: 1.4 }}>{d}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Phase Walker — Unique Piece",
    icon: "◈",
    content: "The Phase Walker (◈ / ◉) is ChronoWar's signature piece. It slides diagonally like a Bishop but can pass through allied pieces — it phases through them as if they don't exist.",
    visual: (
      <div style={{ margin: "16px auto", width: "fit-content" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4,40px)", gridTemplateRows: "repeat(4,40px)",
          border: "1px solid rgba(140,80,220,.35)", borderRadius: 6, overflow: "hidden",
        }}>
          {Array.from({ length: 16 }, (_, i) => {
            const row = Math.floor(i / 4), col = i % 4;
            const isPhantom = row === 3 && col === 0;
            const isPath = (row === 2 && col === 1) || (row === 1 && col === 2) || (row === 0 && col === 3);
            const isAlly = row === 2 && col === 1;
            const isLight = (row + col) % 2 === 0;
            return (
              <div key={i} style={{
                width: 40, height: 40,
                background: isPhantom ? "rgba(140,60,220,.55)" : isPath ? "rgba(140,60,220,.2)" : isLight ? "rgba(60,35,10,.6)" : "rgba(25,12,4,.7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem",
                border: isPath && !isAlly ? "1px solid rgba(140,60,220,.5)" : "none",
              }}>
                {isPhantom ? "◈" : isAlly ? <span style={{ opacity: .5 }}>♙</span> : isPath ? "·" : ""}
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", fontSize: ".72rem", color: "rgba(140,80,220,.7)", marginTop: 8, fontStyle: "italic" }}>
          Phase Walker passes through the allied pawn
        </div>
      </div>
    ),
  },
  {
    title: "Cross-Realm Movement",
    icon: "🌀",
    content: "Kings can move between realms (Past ↔ Present ↔ Future). Pawns that reach the opposite end of a realm can promote to a piece OR cross into an adjacent realm.",
    visual: (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "18px 0" }}>
        {["PAST", "↔", "PRESENT", "↔", "FUTURE"].map((t, i) => (
          <div key={i} style={{
            fontFamily: "'Cinzel', serif",
            fontSize: i % 2 === 0 ? ".58rem" : ".9rem",
            letterSpacing: i % 2 === 0 ? "3px" : "0",
            color: i === 0 ? "#d4a04a" : i === 2 ? "#44bb66" : i === 4 ? "#8855ee" : "rgba(150,120,80,.5)",
            padding: i % 2 === 0 ? "8px 14px" : "0",
            background: i % 2 === 0 ? "rgba(15,8,25,.7)" : "none",
            border: i % 2 === 0 ? "1px solid rgba(100,70,150,.2)" : "none",
            borderRadius: 6,
          }}>{t}</div>
        ))}
      </div>
    ),
  },
  {
    title: "The Narrative Engine",
    icon: "📖",
    content: "Every move you make is sent to Claude AI, which writes 2–3 sentences of epic mythic prose describing the moment. The story builds continuously — each move adds a verse to your unique war chronicle.",
    visual: (
      <div style={{
        background: "rgba(8,4,18,.9)",
        border: "1px solid rgba(180,130,40,.25)",
        borderRadius: 8, padding: "14px 18px", margin: "14px 0",
        fontFamily: "'Crimson Text', serif",
        fontStyle: "italic", fontSize: ".88rem",
        color: "rgba(215,190,145,.85)", lineHeight: 1.75,
      }}>
        "The Chronorider of the Luminar Order leapt across the boundary of Past and Present, its hooves echoing across fractured timelines. Lady Solenne watched from the Future, her silver eyes tracing the arcs of fate that had not yet been written…"
      </div>
    ),
  },
  {
    title: "Points & Ranking",
    icon: "🏆",
    content: "Earn Chronicle Points (CP) for every game: captures, cross-realm moves, checks, and wins all award CP. Your ELO rating climbs as you defeat harder opponents. Your stats persist across sessions.",
    visual: (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "14px 0", justifyContent: "center" }}>
        {[
          ["Win vs AI (Hard)", "+80 CP"],
          ["Cross-realm move", "+3 CP"],
          ["Capture", "+5 CP"],
          ["Check", "+8 CP"],
          ["Checkmate in <20", "+25 CP"],
        ].map(([action, pts], i) => (
          <div key={i} style={{
            background: "rgba(15,8,30,.8)",
            border: "1px solid rgba(200,160,50,.22)",
            borderRadius: 6, padding: "7px 13px",
            display: "flex", gap: 10, alignItems: "center",
          }}>
            <span style={{ fontSize: ".78rem", color: "rgba(180,155,120,.75)" }}>{action}</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: ".65rem", color: "#d4a843", letterSpacing: "1px" }}>{pts}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function Tutorial({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.88)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200,
    }}>
      <div style={{
        background: "linear-gradient(160deg, rgba(7,3,22,.99), rgba(3,1,12,.99))",
        border: "1px solid rgba(175,135,46,.42)",
        borderRadius: 16,
        width: "min(620px, 95vw)",
        maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 0 100px rgba(180,138,46,.1), 0 0 2px rgba(175,135,46,.3)",
        animation: "overlayIn .45s cubic-bezier(.34,1.56,.64,1)",
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: "rgba(100,65,15,.3)", borderRadius: "16px 16px 0 0", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${((step + 1) / STEPS.length) * 100}%`,
            background: "linear-gradient(90deg, #c49020, #f0d060)",
            transition: "width .4s ease",
          }} />
        </div>

        {/* Header */}
        <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid rgba(175,135,46,.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.8rem" }}>{current.icon}</span>
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".5rem", letterSpacing: "5px", color: "rgba(150,110,35,.6)", marginBottom: 4 }}>
                STEP {step + 1} OF {STEPS.length}
              </div>
              <h2 style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "1.1rem", color: "#d4a843", margin: 0,
                textShadow: "0 0 20px rgba(212,168,67,.35)",
              }}>{current.title}</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>
          <p style={{
            fontFamily: "'Crimson Text', serif",
            fontSize: "1.02rem", color: "rgba(218,198,158,.9)",
            lineHeight: 1.8, marginBottom: 4,
          }}>{current.content}</p>
          {current.visual}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 28px",
          borderTop: "1px solid rgba(175,135,46,.15)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          {/* Step dots */}
          <div style={{ display: "flex", gap: 7 }}>
            {STEPS.map((_, i) => (
              <div key={i} onClick={() => setStep(i)} style={{
                width: i === step ? 20 : 7, height: 7,
                borderRadius: 4,
                background: i === step ? "#d4a843" : i < step ? "rgba(212,168,67,.4)" : "rgba(100,75,30,.25)",
                cursor: "pointer",
                transition: "all .3s",
              }} />
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                background: "rgba(25,12,40,.8)", border: "1px solid rgba(100,70,150,.3)",
                color: "rgba(170,140,200,.8)", padding: "9px 20px",
                fontFamily: "'Cinzel', serif", fontSize: ".6rem", letterSpacing: "2px",
                borderRadius: 6, cursor: "pointer",
              }}>← BACK</button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} style={{
                background: "linear-gradient(135deg, rgba(75,42,8,.97), rgba(115,65,12,.97))",
                border: "1px solid rgba(200,155,46,.5)",
                color: "#d4a843", padding: "9px 22px",
                fontFamily: "'Cinzel', serif", fontSize: ".6rem", letterSpacing: "2px",
                borderRadius: 6, cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,.4)",
              }}>NEXT →</button>
            ) : (
              <button onClick={onClose} style={{
                background: "linear-gradient(135deg, rgba(75,42,8,.97), rgba(115,65,12,.97))",
                border: "1px solid rgba(200,155,46,.5)",
                color: "#d4a843", padding: "9px 22px",
                fontFamily: "'Cinzel', serif", fontSize: ".6rem", letterSpacing: "3px",
                borderRadius: 6, cursor: "pointer",
                boxShadow: "0 0 20px rgba(200,155,40,.15)",
              }}>⚔ BEGIN THE WAR</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

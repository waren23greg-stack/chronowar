// ============================================================
//  CHRONOWAR — Chronicle Panel  (Visibility Overhaul)
// ============================================================
import { LORE, SYMBOLS } from "../engine";

export default function ChroniclePanel({ narrating, displayed }) {
  return (
    <div style={{
      background: "rgba(255,252,240,.92)",
      border: "1.5px solid rgba(120,80,20,.35)",
      borderRadius: 10,
      padding: "14px 16px",
      minHeight: 170,
      boxShadow: "0 2px 12px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.6)",
    }}>
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "11px",
        letterSpacing: "3px",
        color: "rgba(90,55,15,.65)",
        marginBottom: 10,
        textTransform: "uppercase",
      }}>The Chronicle</div>

      {narrating ? (
        <div style={{
          color: "#7a4a18",
          fontStyle: "italic",
          fontSize: "15px",
          lineHeight: 1.6,
          textAlign: "center",
          paddingTop: 18,
          animation: "narrBlink 1.5s ease infinite",
          fontFamily: "'Crimson Text', serif",
        }}>
          The Chronicler writes across eternity…
        </div>
      ) : (
        <div style={{
          color: "#2a1408",
          fontSize: "15px",
          lineHeight: 1.8,
          fontStyle: "italic",
          fontFamily: "'Crimson Text', serif",
          animation: "fadeUp .4s ease",
        }}>
          {displayed}
          <span style={{ animation: "cursorBlink .75s step-end infinite", color: "#b07030" }}>|</span>
        </div>
      )}
    </div>
  );
}

export function SagaScroll({ storyLog }) {
  return (
    <div style={{
      background: "rgba(255,252,240,.9)",
      border: "1.5px solid rgba(120,80,20,.3)",
      borderRadius: 10,
      padding: "12px 13px",
      maxHeight: 220,
      overflowY: "auto",
      boxShadow: "0 2px 12px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.5)",
    }}>
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "11px",
        letterSpacing: "3px",
        color: "rgba(90,55,15,.65)",
        marginBottom: 9,
        textTransform: "uppercase",
      }}>Saga Scroll</div>

      {storyLog.length === 0 ? (
        <div style={{
          color: "rgba(80,50,20,.45)",
          fontSize: "13px",
          fontStyle: "italic",
          fontFamily: "'Crimson Text', serif",
          padding: "8px 0",
        }}>
          The saga awaits its first verse…
        </div>
      ) : storyLog.map((e, i) => (
        <div key={i} style={{
          padding: "8px 0",
          borderBottom: "1px solid rgba(120,80,20,.15)",
          lineHeight: 1.5,
        }}>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "10px",
            letterSpacing: "1.5px",
            color: e.side === "white" ? "#7a4a08" : "#4a1878",
            marginBottom: 3,
            fontWeight: 600,
          }}>
            Move {e.n} · {LORE[e.p].split(",")[0]} {SYMBOLS[e.p]}
          </div>
          <div style={{
            fontSize: "13px",
            color: i === 0 ? "#2a1408" : "rgba(55,30,10,.65)",
            fontStyle: "italic",
            fontFamily: "'Crimson Text', serif",
            lineHeight: 1.55,
          }}>
            {e.t.length > 120 ? e.t.slice(0, 120) + "…" : e.t}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PieceLegend() {
  const entries = [
    ["✦ / ✧", "Sage",         "Slides orthogonally like a Rook"],
    ["◈ / ◉", "Phase Walker", "Diagonal slides through own pieces"],
    ["♔ / ♚", "King",         "1 step any direction + realm crossing"],
    ["♙ / ♟", "Pawn",         "Advances forward + realm crossing"],
  ];
  return (
    <div style={{
      background: "rgba(255,252,240,.88)",
      border: "1.5px solid rgba(120,80,20,.28)",
      borderRadius: 10,
      padding: "12px 13px",
      boxShadow: "0 2px 8px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.5)",
    }}>
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "11px",
        letterSpacing: "3px",
        color: "rgba(90,55,15,.65)",
        marginBottom: 9,
        textTransform: "uppercase",
      }}>Realm Pieces</div>
      {entries.map(([sym, name, desc]) => (
        <div key={sym} style={{
          fontSize: "13px",
          color: "rgba(45,25,8,.75)",
          marginBottom: 5,
          lineHeight: 1.5,
          display: "flex",
          gap: 7,
          alignItems: "baseline",
        }}>
          <span style={{ color: "#8a5810", fontWeight: 600, minWidth: 36, fontSize: "14px" }}>{sym}</span>
          <span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: "#5a3010", fontWeight: 600 }}>{name}</span>
            <span style={{ color: "rgba(55,30,10,.6)", marginLeft: 5 }}>— {desc}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

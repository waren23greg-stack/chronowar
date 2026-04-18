// ============================================================
//  CHRONOWAR — Chronicle Panel
// ============================================================

import { LORE, SYMBOLS } from "../engine";

export default function ChroniclePanel({ narrating, displayed, storyLog }) {
  return (
    <div style={{
      background: "rgba(12,5,3,.96)",
      border: "1px solid rgba(178,132,40,.28)",
      borderRadius: 8,
      padding: "13px 15px",
      minHeight: 180,
      boxShadow: "0 0 20px rgba(175,132,42,.07), inset 0 0 30px rgba(0,0,0,.6)",
    }}>
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: ".5rem",
        letterSpacing: 5,
        color: "#5e3a1a",
        marginBottom: 10,
      }}>📜 THE CHRONICLE</div>

      {narrating ? (
        <div style={{
          color: "#ad7825",
          fontStyle: "italic",
          fontSize: ".88rem",
          textAlign: "center",
          paddingTop: 14,
          animation: "narrBlink 1.5s ease infinite",
        }}>
          ✦ &nbsp; The Chronicler writes across eternity… &nbsp; ✦
        </div>
      ) : (
        <div style={{
          color: "#e5d09c",
          fontSize: ".92rem",
          lineHeight: 1.85,
          fontStyle: "italic",
          animation: "fadeUp .5s ease",
        }}>
          {displayed}
          <span style={{ animation: "cursorBlink .75s step-end infinite", color: "#d4a843" }}>|</span>
        </div>
      )}
    </div>
  );
}

export function SagaScroll({ storyLog }) {
  return (
    <div style={{
      background: "rgba(4,2,14,.96)",
      border: "1px solid rgba(110,33,190,.22)",
      borderRadius: 8,
      padding: "9px 10px",
      maxHeight: 240,
      overflowY: "auto",
    }}>
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: ".5rem",
        letterSpacing: 4,
        color: "#482558",
        marginBottom: 7,
      }}>⏳ SAGA SCROLL</div>

      {storyLog.length === 0 ? (
        <div style={{ color: "#28162e", fontSize: ".72rem", fontStyle: "italic" }}>
          The saga awaits its first verse…
        </div>
      ) : storyLog.map((e, i) => (
        <div key={i} style={{
          padding: "6px 4px",
          borderBottom: "1px solid rgba(255,255,255,.04)",
          fontSize: ".7rem",
          color: i === 0 ? "#c09060" : "#503028",
          lineHeight: 1.45,
        }}>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: ".48rem",
            color: e.side === "white" ? "#b07c28" : "#7628b0",
            marginBottom: 2,
          }}>
            #{e.n} · {LORE[e.p].split(",")[0].split(" ").slice(0, 3).join(" ")} {SYMBOLS[e.p]}
          </div>
          {e.t.length > 110 ? e.t.slice(0, 110) + "…" : e.t}
        </div>
      ))}
    </div>
  );
}

export function PieceLegend() {
  const entries = [
    ["✦", "Sage", "Slides orthogonally (Rook)"],
    ["◈ / ◉", "Phantom", "Slides diagonal, phases allies"],
    ["♔ / ♚", "King", "1 step any dir + crosses realms"],
    ["♙ / ♟", "Pawn", "Forward advance + crosses realms"],
  ];
  return (
    <div style={{
      background: "rgba(4,6,16,.92)",
      border: "1px solid rgba(38,76,156,.22)",
      borderRadius: 8,
      padding: "8px 10px",
    }}>
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: ".5rem",
        letterSpacing: 3,
        color: "#2e3e5a",
        marginBottom: 7,
      }}>✦ REALM PIECES</div>
      {entries.map(([sym, name, desc]) => (
        <div key={sym} style={{ fontSize: ".65rem", color: "#3c4c60", marginBottom: 3, lineHeight: 1.4 }}>
          <span style={{ color: "#9a7828" }}>{sym}</span>
          {" "}<span style={{ color: "#5c6c80" }}>{name}</span>
          {" — "}{desc}
        </div>
      ))}
    </div>
  );
}

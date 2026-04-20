// ============================================================
//  CHRONOWAR — Quit Confirmation + Outcome Toasts
// ============================================================
import { useState, useEffect } from "react";
import { QUIT_PENALTY } from "./AIChallengeScreen";

// ── Quit confirmation dialog ──────────────────────────────
export function QuitConfirmation({ difficulty, mode, onConfirm, onCancel }) {
  const penalty = mode === "vs-ai" ? (QUIT_PENALTY[difficulty] || -15) : 0;
  const [countdown, setCountdown] = useState(null);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.85)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 300,
    }}>
      <div style={{
        background: "linear-gradient(160deg, #120e08, #1c1610)",
        border: "1px solid rgba(180,50,20,.4)",
        borderRadius: 14,
        padding: "32px 36px",
        width: "min(420px, 92vw)",
        textAlign: "center",
        boxShadow: "0 0 80px rgba(0,0,0,.7)",
        animation: "overlayIn .35s cubic-bezier(.34,1.56,.64,1)",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠</div>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.2rem", color: "#e05050", marginBottom: 8, letterSpacing: "2px" }}>
          ABANDON THE WAR?
        </div>
        <div style={{ fontFamily: "'Crimson Text', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(200,170,120,.65)", lineHeight: 1.75, marginBottom: 22 }}>
          A warrior who flees the field is remembered by the chronicles — but not with honour.
        </div>

        {/* Penalty preview */}
        <div style={{
          background: "rgba(255,50,20,.08)",
          border: "1px solid rgba(200,50,20,.25)",
          borderRadius: 8, padding: "14px 18px", marginBottom: 24,
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".44rem", letterSpacing: "3px", color: "rgba(220,80,50,.55)", marginBottom: 8 }}>
            CONSEQUENCES OF RETREAT
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: ".52rem", color: "rgba(200,160,100,.6)" }}>Chronicle Points</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: ".6rem", color: "#e05050", fontWeight: 700 }}>{penalty} CP</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: ".52rem", color: "rgba(200,160,100,.6)" }}>Win Streak</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: ".6rem", color: "#e05050", fontWeight: 700 }}>BROKEN</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: ".52rem", color: "rgba(200,160,100,.6)" }}>Recorded as</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: ".6rem", color: "#e05050", fontWeight: 700 }}>RETREAT</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "12px 0",
            background: "rgba(180,140,40,.12)",
            border: "1.5px solid rgba(180,140,40,.4)",
            borderRadius: 8, cursor: "pointer",
            fontFamily: "'Cinzel', serif", fontSize: ".55rem",
            letterSpacing: "2px", color: "#d4a843",
          }}>
            FIGHT ON
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "12px 0",
            background: "rgba(160,30,20,.85)",
            border: "1.5px solid rgba(200,50,30,.4)",
            borderRadius: 8, cursor: "pointer",
            fontFamily: "'Cinzel', serif", fontSize: ".55rem",
            letterSpacing: "2px", color: "#f07060",
            transition: "all .18s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(200,40,25,.9)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(160,30,20,.85)"}
          >
            RETREAT
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Floating outcome toast (win/loss/draw/quit) ───────────
export function OutcomeToast({ result, cpDelta, reason, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 400); }, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  const CONFIG = {
    win:   { color: "#4caf50", bg: "rgba(20,60,20,.95)", icon: "⚔", label: "VICTORY",  glow: "rgba(60,200,60,.2)"  },
    loss:  { color: "#f05050", bg: "rgba(50,10,10,.95)", icon: "☠", label: "DEFEATED",  glow: "rgba(200,40,40,.2)"  },
    draw:  { color: "#ffc107", bg: "rgba(40,30,8,.95)",  icon: "⚖", label: "STALEMATE", glow: "rgba(220,180,30,.2)" },
    quit:  { color: "#e07050", bg: "rgba(40,15,10,.95)", icon: "🚪", label: "RETREAT",   glow: "rgba(200,80,40,.2)"  },
  };
  const c = CONFIG[result] || CONFIG.draw;

  return (
    <div style={{
      position: "fixed",
      top: 80, left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : -20}px)`,
      opacity: visible ? 1 : 0,
      transition: "all .4s cubic-bezier(.34,1.56,.64,1)",
      zIndex: 250,
      background: c.bg,
      border: `1.5px solid ${c.color}55`,
      borderRadius: 12,
      padding: "16px 28px",
      display: "flex", alignItems: "center", gap: 16,
      boxShadow: `0 8px 40px rgba(0,0,0,.6), 0 0 30px ${c.glow}`,
      minWidth: 260,
    }}>
      <span style={{ fontSize: "2rem" }}>{c.icon}</span>
      <div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".65rem", letterSpacing: "4px", color: c.color, marginBottom: 4 }}>
          {c.label}
        </div>
        {reason && (
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".44rem", letterSpacing: "2px", color: `${c.color}80`, marginBottom: 4 }}>
            {reason}
          </div>
        )}
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: ".65rem", fontWeight: 700, color: cpDelta >= 0 ? "#4caf50" : "#f05050" }}>
          {cpDelta >= 0 ? "+" : ""}{cpDelta} CP
        </div>
      </div>
    </div>
  );
}

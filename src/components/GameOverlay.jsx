// ============================================================
//  CHRONOWAR — GameOverlay Component
// ============================================================

export default function GameOverlay({ status, loserTurn, lastNarr, onReset }) {
  if (status !== "checkmate" && status !== "stalemate") return null;

  const isCheckmate = status === "checkmate";
  const winner = loserTurn === "white" ? "Umbral Conclave" : "Luminar Order";

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.9)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        textAlign: "center",
        padding: "42px 56px",
        background: "rgba(5,2,18,.98)",
        border: "2px solid rgba(175,134,44,.5)",
        borderRadius: 14,
        animation: "fadeUp .6s ease",
        maxWidth: 500,
        boxShadow: "0 0 60px rgba(175,134,44,.15), inset 0 0 40px rgba(0,0,0,.6)",
      }}>
        <div style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "1.9rem",
          color: "#d4a843",
          marginBottom: 14,
          textShadow: "0 0 20px rgba(212,168,67,.4)",
        }}>
          {isCheckmate ? "☠ THE WAR ENDS" : "⚖ ETERNAL STALEMATE"}
        </div>

        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: ".85rem",
          color: "#806040",
          lineHeight: 1.7,
          marginBottom: 14,
        }}>
          {isCheckmate
            ? `The ${winner} claims dominion across all three realms of time! Their enemy is vanquished — body, spirit, and timeline.`
            : "Neither order can advance. The rivers of time stand frozen. The war exists outside of eternity itself."}
        </div>

        {lastNarr && (
          <div style={{
            color: "#4a3020",
            fontStyle: "italic",
            fontFamily: "'Crimson Text', serif",
            fontSize: ".88rem",
            lineHeight: 1.65,
            borderTop: "1px solid rgba(180,130,40,.2)",
            paddingTop: 14,
            marginBottom: 22,
          }}>
            "{lastNarr.slice(0, 180)}{lastNarr.length > 180 ? "…" : ""}"
          </div>
        )}

        <button
          onClick={onReset}
          style={{
            background: "rgba(65,45,12,.88)",
            border: "1px solid rgba(195,154,44,.56)",
            color: "#d4a843",
            padding: "12px 28px",
            fontFamily: "'Cinzel', serif",
            fontSize: ".75rem",
            letterSpacing: 4,
            borderRadius: 5,
            cursor: "pointer",
            transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(95,65,18,.92)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(65,45,12,.88)"; }}
        >
          BEGIN A NEW WAR
        </button>
      </div>
    </div>
  );
}

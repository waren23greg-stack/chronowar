import { useState } from "react";

const REWRITE_COST = 20;
const F = "'Cinzel', serif";

export default function HistoryRewritePanel({ isOpen, onClose, currentCP, historyLength, onExecuteRewrite }) {
  const [picked, setPicked] = useState(null);
  if (!isOpen) return null;

  // Default to one move back, never to the Genesis by accident.
  const selectedTurn = picked ?? Math.max(0, historyLength - 2);
  const canAfford = currentCP >= REWRITE_COST;
  const hasHistory = historyLength >= 2;
  const isShattering = hasHistory && selectedTurn < historyLength - 1;
  const ready = canAfford && isShattering;

  const close = () => { setPicked(null); onClose(); };
  const rewrite = () => {
    if (!ready) return;
    onExecuteRewrite(selectedTurn);
    close();
  };

  return (
    <div onClick={close} style={{
      position: "fixed", inset: 0, zIndex: 120, padding: 16,
      background: "rgba(5,3,12,.82)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 420, boxSizing: "border-box",
        background: "linear-gradient(160deg,#1c1409,#0e0c08)",
        border: "1px solid rgba(168,120,255,.55)", borderRadius: 14, padding: "22px 20px",
        boxShadow: "0 0 40px rgba(140,80,240,.3), 0 20px 50px rgba(0,0,0,.6)",
        fontFamily: "'Crimson Text', Georgia, serif", color: "#e8d5a3",
      }}>
        <div style={{ fontFamily: F, fontSize: 18, letterSpacing: 4, color: "#c9a8ff", textTransform: "uppercase", marginBottom: 10 }}>
          Shatter Timeline
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.55, fontStyle: "italic", color: "rgba(225,205,165,.82)", margin: "0 0 16px" }}>
          Spend Chronicle Points to collapse this reality and branch a new one from an earlier move. The abandoned future is erased for good.
        </p>

        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(168,120,255,.2)", borderRadius: 10, padding: "14px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F, fontSize: 12, letterSpacing: 1.5 }}>
            <span style={{ color: "rgba(200,170,110,.8)" }}>CHRONICLE POINTS</span>
            <span style={{ color: canAfford ? "#7fd18a" : "#f08a7a", fontWeight: 700 }}>{currentCP} / {REWRITE_COST} CP</span>
          </div>

          {hasHistory ? (
            <>
              <div style={{ fontFamily: F, fontSize: 12, letterSpacing: 1.5, color: "rgba(200,170,110,.8)", margin: "16px 0 8px" }}>
                REWIND TO MOVE {selectedTurn} OF {historyLength - 1}
              </div>
              <input
                type="range" min="0" max={historyLength - 1} value={selectedTurn}
                onChange={(e) => setPicked(parseInt(e.target.value, 10))}
                style={{ width: "100%", accentColor: "#a878ff" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(200,170,110,.6)" }}>
                <span>Genesis</span><span>Now</span>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 14, fontSize: 14, fontStyle: "italic", color: "rgba(200,170,110,.7)" }}>
              Play a few moves first. There is no earlier moment to return to yet.
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={close} style={{
            flex: 1, padding: "11px 8px", cursor: "pointer", borderRadius: 8,
            fontFamily: F, fontSize: 11, letterSpacing: 1.5,
            background: "rgba(255,255,255,.08)", color: "#e8d5a3", border: "1px solid rgba(200,170,110,.35)",
          }}>MAINTAIN REALITY</button>
          <button onClick={rewrite} disabled={!ready} style={{
            flex: 1, padding: "11px 8px", borderRadius: 8,
            fontFamily: F, fontSize: 11, letterSpacing: 1.5, fontWeight: 700,
            cursor: ready ? "pointer" : "not-allowed",
            background: ready ? "rgba(110,60,210,.95)" : "rgba(255,255,255,.06)",
            color: ready ? "#fff" : "rgba(200,170,110,.35)",
            border: `1px solid ${ready ? "rgba(190,150,255,.8)" : "rgba(200,170,110,.2)"}`,
            boxShadow: ready ? "0 0 16px rgba(140,80,240,.55)" : "none",
          }}>REWRITE HISTORY</button>
        </div>
      </div>
    </div>
  );
}

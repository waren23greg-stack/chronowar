// ============================================================
//  CHRONOWAR — BoardSquare Component
// ============================================================

import { SYMBOLS } from "../engine";

export default function BoardSquare({ piece, isLight, isSel, move, isLastFrom, isLastTo, cfg, sqSize, onClick }) {
  let bg = isLight ? cfg.light : cfg.dark;
  if (isLastFrom || isLastTo) bg = cfg.glow + "40";
  if (isSel) bg = cfg.glow + "5c";

  const isCross = move?.cross;
  const isCapture = move && !!piece;
  const isValid = !!move;

  const white = piece && piece[0] === "W";

  return (
    <div
      onClick={onClick}
      style={{
        width: sqSize, height: sqSize,
        background: bg,
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        transition: "filter .1s, background .15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.3)")}
      onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
    >
      {/* Selection ring */}
      {isSel && (
        <div style={{
          position: "absolute", inset: 0,
          border: `2px solid ${cfg.glow}`,
          borderRadius: 2,
          boxShadow: `0 0 12px ${cfg.glow}`,
          animation: "selGlow .9s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* Valid move dot */}
      {isValid && !isCapture && (
        <div style={{
          position: "absolute",
          width: "34%", height: "34%",
          borderRadius: "50%",
          background: isCross ? cfg.glow + "ff" : cfg.glow + "b0",
          boxShadow: isCross ? `0 0 10px ${cfg.glow}, 0 0 20px ${cfg.glow}60` : "none",
          animation: "dotPulse 1.2s ease infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* Capture ring */}
      {isCapture && (
        <div style={{
          position: "absolute", inset: 2,
          border: `2px solid ${cfg.glow}`,
          borderRadius: 2,
          animation: "capPulse 1.2s ease infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* Piece */}
      {piece && (
        <span style={{
          fontSize: sqSize > 40 ? "2.1rem" : "1.4rem",
          lineHeight: 1,
          zIndex: 2,
          userSelect: "none",
          pointerEvents: "none",
          color: white ? "#f4e5b8" : "#080012",
          textShadow: white
            ? "0 0 6px rgba(215,165,32,.5), 0 1px 3px #000"
            : "0 0 6px rgba(140,28,200,.5), 0 1px 3px #000",
          filter: white
            ? "drop-shadow(0 0 3px rgba(190,140,22,.65))"
            : "drop-shadow(0 0 3px rgba(128,24,190,.65))",
          animation: isSel ? "pieceFloat 1.2s ease-in-out infinite" : "none",
        }}>
          {SYMBOLS[piece]}
        </span>
      )}
    </div>
  );
}

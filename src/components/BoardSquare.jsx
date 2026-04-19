// ============================================================
//  CHRONOWAR — BoardSquare v3  (SVG pieces, no emoji)
// ============================================================
import { PIECE_COMPONENTS } from "../pieces";

export default function BoardSquare({
  piece, isLight, isSel, move, isLastFrom, isLastTo, cfg, sqSize, onClick,
}) {
  const isCapture   = move && !!piece;
  const isValid     = !!move;
  const isCross     = move?.cross;
  const isWhite     = piece && piece[0] === "W";
  const PieceComp   = piece ? PIECE_COMPONENTS[piece] : null;

  // Square background
  let bgColor = isLight ? cfg.light : cfg.dark;
  if (isLastFrom) bgColor = cfg.glow + "28";
  if (isLastTo)   bgColor = cfg.glow + "42";
  if (isSel)      bgColor = cfg.glow + "55";

  return (
    <div
      onClick={onClick}
      style={{
        width: sqSize, height: sqSize,
        background: bgColor,
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        transition: "background .15s, filter .12s",
      }}
      onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.28)"; }}
      onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
    >
      {/* Last-move highlight bar */}
      {(isLastFrom || isLastTo) && (
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${cfg.glow}1a 0%, ${cfg.glow}35 100%)`,
          pointerEvents: "none",
        }} />
      )}

      {/* Selection ring */}
      {isSel && (
        <div style={{
          position: "absolute", inset: 0,
          border: `2px solid ${cfg.glow}`,
          boxShadow: `0 0 14px ${cfg.glow}99, inset 0 0 8px ${cfg.glow}44`,
          animation: "selGlow .9s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* Valid move indicator */}
      {isValid && !isCapture && (
        <div style={{
          position: "absolute",
          width: isCross ? "44%" : "32%",
          height: isCross ? "44%" : "32%",
          borderRadius: "50%",
          background: isCross
            ? `radial-gradient(circle, ${cfg.glow}ff 0%, ${cfg.glow}88 60%, transparent 100%)`
            : `radial-gradient(circle, ${cfg.glow}cc 0%, ${cfg.glow}55 100%)`,
          boxShadow: isCross ? `0 0 18px ${cfg.glow}cc, 0 0 36px ${cfg.glow}55` : "none",
          animation: "dotPulse 1.3s ease infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* Capture indicator */}
      {isCapture && (
        <div style={{
          position: "absolute", inset: 2,
          border: `2px solid ${cfg.glow}cc`,
          borderRadius: 2,
          boxShadow: `inset 0 0 10px ${cfg.glow}44`,
          animation: "capPulse 1.2s ease infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* SVG Piece */}
      {PieceComp && (
        <div style={{
          position: "relative", zIndex: 2,
          pointerEvents: "none",
          userSelect: "none",
          transform: isSel ? "translateY(-3px) scale(1.08)" : "none",
          transition: "transform .18s cubic-bezier(.34,1.56,.64,1)",
          filter: isWhite
            ? `drop-shadow(0 2px 6px rgba(0,0,0,.7)) drop-shadow(0 0 8px rgba(215,160,30,.45))`
            : `drop-shadow(0 2px 6px rgba(0,0,0,.9)) drop-shadow(0 0 8px rgba(140,40,210,.5))`,
        }}>
          <PieceComp size={sqSize * 0.82} isWhite={isWhite} />
        </div>
      )}
    </div>
  );
}

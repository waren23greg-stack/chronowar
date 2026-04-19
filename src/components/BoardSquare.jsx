// ============================================================
//  CHRONOWAR — BoardSquare v4  clean visibility
// ============================================================
import { PIECE_COMPONENTS } from "../pieces";

export default function BoardSquare({
  piece, isLight, isSel, move, isLastFrom, isLastTo, cfg, sqSize, onClick,
}) {
  const isCapture = move && !!piece;
  const isValid   = !!move;
  const isCross   = move?.cross;
  const isWhite   = piece && piece[0] === "W";
  const PieceComp = piece ? PIECE_COMPONENTS[piece] : null;

  // Square colour — muted, parchment-map palette
  let bg = isLight ? cfg.light : cfg.dark;
  if (isLastTo)   bg = cfg.lastTo;
  if (isLastFrom) bg = cfg.lastFrom;
  if (isSel)      bg = cfg.selBg;

  return (
    <div
      onClick={onClick}
      style={{
        width: sqSize, height: sqSize,
        background: bg,
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        transition: "background .12s",
        boxSizing: "border-box",
      }}
      onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.18)"}
      onMouseLeave={e => e.currentTarget.style.filter = "none"}
    >
      {/* Selected border */}
      {isSel && (
        <div style={{
          position: "absolute", inset: 0,
          outline: `2px solid ${cfg.selRing}`,
          outlineOffset: "-2px",
          zIndex: 4, pointerEvents: "none",
        }} />
      )}

      {/* Valid-move dot */}
      {isValid && !isCapture && (
        <div style={{
          position: "absolute",
          width: isCross ? "42%" : "28%",
          height: isCross ? "42%" : "28%",
          borderRadius: "50%",
          background: isCross ? cfg.crossDot : cfg.moveDot,
          zIndex: 3, pointerEvents: "none",
          opacity: 0.82,
        }} />
      )}

      {/* Capture ring */}
      {isCapture && (
        <div style={{
          position: "absolute", inset: 2,
          border: `2px solid ${cfg.capRing}`,
          borderRadius: 2,
          zIndex: 3, pointerEvents: "none",
          opacity: 0.8,
        }} />
      )}

      {/* SVG Piece */}
      {PieceComp && (
        <div style={{
          position: "relative", zIndex: 2,
          pointerEvents: "none", userSelect: "none",
          transform: isSel ? "translateY(-2px) scale(1.06)" : "none",
          transition: "transform .15s cubic-bezier(.34,1.56,.64,1)",
        }}>
          <PieceComp size={sqSize * 0.84} isWhite={isWhite} />
        </div>
      )}
    </div>
  );
}

// ============================================================
//  CHRONOWAR — SVG Chess Pieces
//  Keys match engine: W_K W_Q W_R W_B W_N W_P W_S W_X
//  White = Luminar Order (gold/ivory)
//  Black = Umbral Conclave (void purple)
// ============================================================

function PieceSVG({ size = 40, isWhite, children }) {
  const id   = isWhite ? "w" : "b";
  const glow = isWhite ? "#ffc84a" : "#cc55ff";
  const g1   = isWhite ? "#fff8e8" : "#2e0a4a";
  const g2   = isWhite ? "#c89020" : "#0a0018";
  const st   = isWhite ? "#c89028" : "#9930cc";

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 40 40"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`rg${id}`} cx="38%" cy="28%" r="65%">
          <stop offset="0%" stopColor={g1} />
          <stop offset="100%" stopColor={g2} />
        </radialGradient>
        <filter id={`gl${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id={`sh${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.0)" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="20" cy="38" rx="11" ry="2" fill={glow} opacity="0.15" />
      <g filter={`url(#gl${id})`}>
        {children({ fill: `url(#rg${id})`, stroke: st, glow, id })}
      </g>
      {/* Sheen overlay */}
      <g opacity="0.6" filter={`url(#gl${id})`}>
        {children({ fill: `url(#sh${id})`, stroke: "none", glow, id })}
      </g>
    </svg>
  );
}

// Helper — base + collar shared by most pieces
function Base({ fill, stroke, wide = false }) {
  return <>
    <rect x={wide ? 7 : 9} y="31" width={wide ? 26 : 22} height="5" rx="2.5" fill={fill} stroke={stroke} strokeWidth="1" />
    <rect x="11" y="27" width="18" height="5" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
  </>;
}

// ── KING ────────────────────────────────────────────────
export function King({ size, isWhite }) {
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      {({ fill, stroke, glow }) => <>
        <Base fill={fill} stroke={stroke} wide />
        <rect x="13" y="20" width="14" height="8" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
        <rect x="15" y="13" width="10" height="8" rx="3" fill={fill} stroke={stroke} strokeWidth="1" />
        {/* Cross */}
        <rect x="18.5" y="4" width="3" height="12" rx="1.2" fill={stroke} />
        <rect x="13.5" y="7.5" width="13" height="3" rx="1.2" fill={stroke} />
        <circle cx="20" cy="4.5" r="1.8" fill={glow} opacity="0.9" />
      </>}
    </PieceSVG>
  );
}

// ── QUEEN ────────────────────────────────────────────────
export function Queen({ size, isWhite }) {
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      {({ fill, stroke, glow }) => <>
        <Base fill={fill} stroke={stroke} wide />
        <ellipse cx="20" cy="24" rx="7" ry="4.5" fill={fill} stroke={stroke} strokeWidth="1" />
        <rect x="14" y="14" width="12" height="11" rx="3" fill={fill} stroke={stroke} strokeWidth="1" />
        <rect x="16" y="11" width="8" height="5" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
        {/* Crown points */}
        {[10, 14.5, 20, 25.5, 30].map((x, i) => (
          <polygon key={i} points={`${x},11 ${x + 2},5 ${x + 4},11`} fill={fill} stroke={stroke} strokeWidth="0.7" />
        ))}
        {[11, 17.5, 20, 22.5, 29].map((x, i) => (
          <circle key={i} cx={x + 1} cy="5.5" r="1.3" fill={glow} opacity="0.85" />
        ))}
      </>}
    </PieceSVG>
  );
}

// ── ROOK (W_R / B_R) ────────────────────────────────────
export function Rook({ size, isWhite }) {
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      {({ fill, stroke }) => <>
        <Base fill={fill} stroke={stroke} wide />
        <rect x="12" y="14" width="16" height="14" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
        <rect x="10" y="13" width="20" height="3" rx="1" fill={fill} stroke={stroke} strokeWidth="0.8" />
        {/* Battlements */}
        {[10, 15.5, 21].map((x, i) => (
          <rect key={i} x={x} y="6" width="5" height="8" rx="1" fill={fill} stroke={stroke} strokeWidth="1" />
        ))}
      </>}
    </PieceSVG>
  );
}

// ── BISHOP (W_B / B_B) ───────────────────────────────────
export function Bishop({ size, isWhite }) {
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      {({ fill, stroke, glow }) => <>
        <Base fill={fill} stroke={stroke} />
        <ellipse cx="20" cy="24" rx="8" ry="4" fill={fill} stroke={stroke} strokeWidth="1" />
        <path d="M13 24 Q20 6 27 24" fill={fill} stroke={stroke} strokeWidth="1" />
        <ellipse cx="20" cy="16" rx="5" ry="1.5" fill="none" stroke={stroke} strokeWidth="0.9" />
        <circle cx="20" cy="7.5" r="3.5" fill={fill} stroke={stroke} strokeWidth="1" />
        <circle cx="20" cy="7.5" r="1.6" fill={glow} opacity="0.8" />
        <circle cx="20" cy="7.5" r="0.7" fill={glow} />
      </>}
    </PieceSVG>
  );
}

// ── KNIGHT (W_N / B_N) ───────────────────────────────────
export function Knight({ size, isWhite }) {
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      {({ fill, stroke, glow }) => <>
        <Base fill={fill} stroke={stroke} />
        <rect x="12" y="24" width="14" height="5" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
        {/* Horse head */}
        <path
          d="M11 28 L12 20 Q12 13 17 11 L24 10 Q27 10 27 13 L26 17 Q28 18 27 21 L26 23 L23 21 Q22 25 18 26 L13 27 Z"
          fill={fill} stroke={stroke} strokeWidth="1"
        />
        {/* Mane */}
        <path d="M17 11 Q15.5 15 15.5 21" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
        {/* Eye */}
        <circle cx="23.5" cy="13.5" r="1.3" fill={glow} opacity="0.9" />
        <circle cx="23.5" cy="13.5" r="0.5" fill={stroke} />
        {/* Nostril */}
        <circle cx="26.5" cy="18" r="0.7" fill={stroke} opacity="0.4" />
      </>}
    </PieceSVG>
  );
}

// ── PAWN (W_P / B_P) ────────────────────────────────────
export function Pawn({ size, isWhite }) {
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      {({ fill, stroke, glow }) => <>
        <rect x="11" y="30" width="18" height="5" rx="2.5" fill={fill} stroke={stroke} strokeWidth="1" />
        <rect x="13" y="25" width="14" height="6" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
        <rect x="15" y="21" width="10" height="5" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1" />
        <circle cx="20" cy="14.5" r="7" fill={fill} stroke={stroke} strokeWidth="1" />
        <circle cx="20" cy="14.5" r="3" fill={glow} opacity="0.28" />
        <circle cx="18" cy="12.5" r="1.2" fill={glow} opacity="0.45" />
      </>}
    </PieceSVG>
  );
}

// ── SAGE / ORACLE (W_S / B_S) — Rook-movement ───────────
export function Sage({ size, isWhite }) {
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      {({ fill, stroke, glow }) => <>
        <Base fill={fill} stroke={stroke} wide />
        <rect x="13" y="16" width="14" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
        {/* Wizard hat */}
        <path d="M13 16 L20 4 L27 16 Z" fill={fill} stroke={stroke} strokeWidth="1" />
        <ellipse cx="20" cy="16" rx="8" ry="2.2" fill={fill} stroke={stroke} strokeWidth="1" />
        {/* Star on hat */}
        <polygon
          points="20,7 20.9,9.5 23.5,9.5 21.5,11 22.2,13.5 20,12 17.8,13.5 18.5,11 16.5,9.5 19.1,9.5"
          fill={glow} opacity="0.9"
        />
      </>}
    </PieceSVG>
  );
}

// ── PHASE WALKER / PHANTOM (W_X / B_X) ──────────────────
export function PhaseWalker({ size, isWhite }) {
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      {({ fill, stroke, glow }) => <>
        <Base fill={fill} stroke={stroke} />
        {/* Flowing robe */}
        <path
          d="M10 35 Q11 26 13 24 Q14 18 13 13 Q16 7 20 7 Q24 7 27 13 Q26 18 27 24 Q29 26 30 35"
          fill={fill} stroke={stroke} strokeWidth="1" opacity="0.9"
        />
        {/* Orb / core */}
        <circle cx="20" cy="13" r="6.5" fill={fill} stroke={stroke} strokeWidth="1" />
        <circle cx="20" cy="13" r="3.5" fill={glow} opacity="0.55" />
        <circle cx="20" cy="13" r="1.5" fill={glow} opacity="0.92" />
        {/* Wisps */}
        <path d="M13 28 Q11 31 10 35" fill="none" stroke={stroke} strokeWidth="0.9" opacity="0.45" />
        <path d="M27 28 Q29 31 30 35" fill="none" stroke={stroke} strokeWidth="0.9" opacity="0.45" />
        <path d="M15.5 32 Q14 33.5 13 35" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.3" />
        <path d="M24.5 32 Q26 33.5 27 35" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.3" />
      </>}
    </PieceSVG>
  );
}

// ── PIECE MAP — keys match engine.js exactly ────────────
export const PIECE_COMPONENTS = {
  W_K: King,   B_K: King,
  W_Q: Queen,  B_Q: Queen,
  W_R: Rook,   B_R: Rook,
  W_B: Bishop, B_B: Bishop,
  W_N: Knight, B_N: Knight,
  W_P: Pawn,   B_P: Pawn,
  W_S: Sage,   B_S: Sage,
  W_X: PhaseWalker, B_X: PhaseWalker,
};

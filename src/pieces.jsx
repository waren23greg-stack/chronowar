// ============================================================
//  CHRONOWAR — SVG Chess Piece Designs
//  White = Luminar Order (gold/ivory)
//  Black = Umbral Conclave (void purple)
// ============================================================

const W_FILL   = "#f5e8c0";
const W_STROKE = "#c8a832";
const W_GLOW   = "#ffd060";
const B_FILL   = "#1a0a2e";
const B_STROKE = "#8b30d0";
const B_GLOW   = "#c060ff";

function PieceSVG({ size = 36, isWhite, children, glow }) {
  const glowColor = isWhite ? W_GLOW : B_GLOW;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ overflow: "visible", display: "block" }}>
      <defs>
        <filter id={`glow-${isWhite ? "w" : "b"}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id={`rg-${isWhite ? "w" : "b"}`} cx="40%" cy="30%">
          <stop offset="0%" stopColor={isWhite ? "#fff8e0" : "#3a1060"} />
          <stop offset="100%" stopColor={isWhite ? "#c8a832" : "#0a0018"} />
        </radialGradient>
        <radialGradient id={`rg2-${isWhite ? "w" : "b"}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Ambient glow underneath */}
      <ellipse cx="18" cy="34" rx="11" ry="2.2" fill={glowColor} opacity="0.18" />
      <g filter={`url(#glow-${isWhite ? "w" : "b"})`}>
        {children}
      </g>
    </svg>
  );
}

// ── KING ─────────────────────────────────────────────────
export function King({ size, isWhite }) {
  const fill   = isWhite ? `url(#rg-w)` : `url(#rg-b)`;
  const stroke = isWhite ? W_STROKE : B_STROKE;
  const sw = 1.1;
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      {/* Base */}
      <ellipse cx="18" cy="31.5" rx="10" ry="2.2" fill={stroke} opacity="0.45"/>
      <rect x="9" y="28" width="18" height="4" rx="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="11" y="24" width="14" height="5" rx="1.5" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Body */}
      <path d="M12 24 Q18 20 24 24" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="13" y="12" width="10" height="13" rx="3" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Neck */}
      <rect x="15" y="9" width="6" height="5" rx="1.5" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Crown cross */}
      <rect x="16.5" y="3" width="3" height="10" rx="1" fill={isWhite ? W_STROKE : B_STROKE}/>
      <rect x="13" y="6" width="10" height="3" rx="1" fill={isWhite ? W_STROKE : B_STROKE}/>
      {/* Crown tips */}
      <circle cx="18" cy="3" r="1.4" fill={isWhite ? W_GLOW : B_GLOW} opacity="0.9"/>
    </PieceSVG>
  );
}

// ── QUEEN ────────────────────────────────────────────────
export function Queen({ size, isWhite }) {
  const fill   = isWhite ? `url(#rg-w)` : `url(#rg-b)`;
  const stroke = isWhite ? W_STROKE : B_STROKE;
  const sw = 1.1;
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      <ellipse cx="18" cy="31.5" rx="10" ry="2.2" fill={stroke} opacity="0.4"/>
      <rect x="9" y="28" width="18" height="4" rx="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="11" y="24" width="14" height="5" rx="1.5" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Ball of body */}
      <ellipse cx="18" cy="21" rx="6.5" ry="4" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="13.5" y="13" width="9" height="9" rx="3" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Neck */}
      <rect x="15.5" y="10" width="5" height="5" rx="1.5" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Crown points */}
      {[11, 15, 18, 21, 25].map((x, i) => (
        <polygon key={i} points={`${x},10 ${x+2},4 ${x+4},10`} fill={fill} stroke={stroke} strokeWidth={0.8}/>
      ))}
      {/* Crown jewels */}
      {[12, 18, 24].map((x, i) => (
        <circle key={i} cx={x} cy="4.5" r="1.2" fill={isWhite ? W_GLOW : B_GLOW} opacity="0.85"/>
      ))}
    </PieceSVG>
  );
}

// ── ROOK (SAGE) ──────────────────────────────────────────
export function Rook({ size, isWhite }) {
  const fill   = isWhite ? `url(#rg-w)` : `url(#rg-b)`;
  const stroke = isWhite ? W_STROKE : B_STROKE;
  const sw = 1.1;
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      <ellipse cx="18" cy="31.5" rx="10" ry="2.2" fill={stroke} opacity="0.4"/>
      <rect x="8.5" y="28" width="19" height="4" rx="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="11" y="24" width="14" height="5" rx="1" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="12" y="12" width="12" height="13" rx="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Battlements */}
      <rect x="11" y="7" width="4" height="7" rx="1" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="16" y="7" width="4" height="7" rx="1" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="21" y="7" width="4" height="7" rx="1" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="11" y="12" width="14" height="2.5" fill={fill} stroke={stroke} strokeWidth={0.6}/>
    </PieceSVG>
  );
}

// ── BISHOP (CHRONORIDER) ─────────────────────────────────
export function Bishop({ size, isWhite }) {
  const fill   = isWhite ? `url(#rg-w)` : `url(#rg-b)`;
  const stroke = isWhite ? W_STROKE : B_STROKE;
  const sw = 1.1;
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      <ellipse cx="18" cy="31.5" rx="9" ry="2.2" fill={stroke} opacity="0.4"/>
      <rect x="10" y="28" width="16" height="4" rx="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <ellipse cx="18" cy="25" rx="7" ry="3.5" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <path d="M13 25 Q18 8 23 25" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Orb at top */}
      <circle cx="18" cy="7.5" r="3.2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="18" cy="7.5" r="1.4" fill={isWhite ? W_GLOW : B_GLOW} opacity="0.8"/>
      {/* Band */}
      <ellipse cx="18" cy="16" rx="4.5" ry="1.4" fill="none" stroke={stroke} strokeWidth={0.9}/>
    </PieceSVG>
  );
}

// ── KNIGHT (CHRONORIDER) ─────────────────────────────────
export function Knight({ size, isWhite }) {
  const fill   = isWhite ? `url(#rg-w)` : `url(#rg-b)`;
  const stroke = isWhite ? W_STROKE : B_STROKE;
  const sw = 1.1;
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      <ellipse cx="18" cy="31.5" rx="9.5" ry="2.2" fill={stroke} opacity="0.4"/>
      <rect x="10" y="28" width="16" height="4" rx="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="12" y="24" width="12" height="5" rx="1.5" fill={fill} stroke={stroke} strokeWidth={sw}/>
      {/* Horse head silhouette */}
      <path
        d="M11 24 L11 18 Q11 12 16 10 L22 9 Q25 9 25 12 L24 15 Q26 16 25 18 L24 20 L22 18 Q21 22 17 23 L13 24 Z"
        fill={fill} stroke={stroke} strokeWidth={sw}
      />
      {/* Eye */}
      <circle cx="21.5" cy="12.5" r="1.2" fill={isWhite ? W_GLOW : B_GLOW} opacity="0.85"/>
      {/* Mane detail */}
      <path d="M16 10 Q14 13 14 18" fill="none" stroke={stroke} strokeWidth={0.7} opacity="0.6"/>
    </PieceSVG>
  );
}

// ── PAWN ─────────────────────────────────────────────────
export function Pawn({ size, isWhite }) {
  const fill   = isWhite ? `url(#rg-w)` : `url(#rg-b)`;
  const stroke = isWhite ? W_STROKE : B_STROKE;
  const sw = 1.1;
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      <ellipse cx="18" cy="31.5" rx="8.5" ry="2.1" fill={stroke} opacity="0.35"/>
      <rect x="11" y="28" width="14" height="4" rx="2" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="13" y="24" width="10" height="5" rx="1.5" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <rect x="15" y="20" width="6" height="5" rx="1" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="18" cy="14.5" r="5.5" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="18" cy="14.5" r="2.2" fill={isWhite ? W_GLOW : B_GLOW} opacity="0.35"/>
    </PieceSVG>
  );
}

// ── PHANTOM (special piece) ──────────────────────────────
export function Phantom({ size, isWhite }) {
  const fill   = isWhite ? `url(#rg-w)` : `url(#rg-b)`;
  const stroke = isWhite ? W_STROKE : B_STROKE;
  const glow   = isWhite ? W_GLOW   : B_GLOW;
  const sw = 1.1;
  return (
    <PieceSVG size={size} isWhite={isWhite}>
      <ellipse cx="18" cy="31.5" rx="9" ry="2.1" fill={stroke} opacity="0.3"/>
      {/* Ghostly flowing robe */}
      <path
        d="M9 32 Q10 26 12 24 Q14 18 13 12 Q16 8 18 8 Q20 8 23 12 Q22 18 24 24 Q26 26 27 32"
        fill={fill} stroke={stroke} strokeWidth={sw} opacity="0.9"
      />
      {/* Phantom core / orb */}
      <circle cx="18" cy="12" r="5" fill={fill} stroke={stroke} strokeWidth={sw}/>
      <circle cx="18" cy="12" r="2.5" fill={glow} opacity="0.6"/>
      <circle cx="18" cy="12" r="1.2" fill={glow} opacity="0.9"/>
      {/* Flowing tendrils */}
      <path d="M12 26 Q11 29 10 32" fill="none" stroke={stroke} strokeWidth={0.8} opacity="0.5"/>
      <path d="M24 26 Q25 29 26 32" fill="none" stroke={stroke} strokeWidth={0.8} opacity="0.5"/>
      <path d="M15 30 Q14 31 13 32" fill="none" stroke={stroke} strokeWidth={0.7} opacity="0.4"/>
      <path d="M21 30 Q22 31 23 32" fill="none" stroke={stroke} strokeWidth={0.7} opacity="0.4"/>
    </PieceSVG>
  );
}

// ── PIECE MAP ────────────────────────────────────────────
export const PIECE_COMPONENTS = {
  WK: King,   BK: King,
  WQ: Queen,  BQ: Queen,
  WR: Rook,   BR: Rook,
  WB: Bishop, BB: Bishop,
  WN: Knight, BN: Knight,
  WP: Pawn,   BP: Pawn,
  WX: Phantom, BX: Phantom,
};

// ============================================================
//  CHRONOWAR — SVG Chess Pieces v2
//  Clean heraldic style — no bloom/glow filters
//  High contrast against map-textured boards
//  White = warm ivory/gold   Black = deep charcoal/bronze
// ============================================================

// ── Palette ──────────────────────────────────────────────
const W = {
  body:   "#f0e4c0",   // warm ivory
  shade:  "#c8a040",   // gold shadow
  stroke: "#7a5a10",   // dark amber outline
  accent: "#d4a020",   // gold details
  eye:    "#8b4513",   // warm brown
};
const B = {
  body:   "#2a2018",   // dark charcoal-brown
  shade:  "#4a3828",   // slightly lighter shadow
  stroke: "#c8a050",   // bronze/gold outline (high contrast on dark)
  accent: "#a07830",   // bronze details
  eye:    "#e8c060",   // gold eye
};

function Piece({ size = 38, isWhite, d: draw }) {
  const p = isWhite ? W : B;
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" style={{ display:"block" }}>
      <defs>
        {/* Crisp drop shadow only — no blur glow */}
        <filter id={`ds${isWhite?"w":"b"}`} x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor={isWhite?"#00000060":"#00000088"} />
        </filter>
        <linearGradient id={`lg${isWhite?"w":"b"}`} x1="25%" y1="10%" x2="75%" y2="90%">
          <stop offset="0%" stopColor={isWhite ? "#fdf6e0" : "#3a3020"} />
          <stop offset="100%" stopColor={isWhite ? "#c09830" : "#1a1008"} />
        </linearGradient>
      </defs>
      <g filter={`url(#ds${isWhite?"w":"b"})`}>
        {draw(p, `url(#lg${isWhite?"w":"b"})`)}
      </g>
    </svg>
  );
}

const sw = 1.2;  // stroke width — consistent all pieces

// ── KING ─────────────────────────────────────────────────
export function King({ size, isWhite }) {
  return <Piece size={size} isWhite={isWhite} d={(p, fill) => <>
    {/* Base */}
    <rect x="8"  y="29" width="22" height="5"  rx="2.5" fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="11" y="25" width="16" height="5"  rx="2"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    {/* Body */}
    <rect x="13" y="17" width="12" height="9"  rx="2"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="15" y="12" width="8"  height="6"  rx="2"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    {/* Cross */}
    <rect x="17.5" y="3"  width="3" height="12" rx="1.2" fill={p.accent} stroke={p.stroke} strokeWidth="0.8"/>
    <rect x="12.5" y="7"  width="13" height="3" rx="1.2" fill={p.accent} stroke={p.stroke} strokeWidth="0.8"/>
    {/* Crown jewel */}
    <circle cx="19" cy="3.8" r="1.5" fill={isWhite?"#fff0a0":"#e8c050"} stroke={p.stroke} strokeWidth="0.7"/>
  </>}/>;
}

// ── QUEEN ────────────────────────────────────────────────
export function Queen({ size, isWhite }) {
  return <Piece size={size} isWhite={isWhite} d={(p, fill) => <>
    <rect x="8"  y="29" width="22" height="5"  rx="2.5" fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <ellipse cx="19" cy="25.5" rx="8"  ry="4"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="13" y="14" width="12" height="12" rx="3"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="15" y="11" width="8"  height="5"  rx="2"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    {/* Crown spikes */}
    {[9, 13.5, 19, 24.5, 29].map((x,i)=>(
      <polygon key={i} points={`${x},12 ${x+2},5 ${x+4},12`} fill={fill} stroke={p.stroke} strokeWidth="0.8"/>
    ))}
    {/* Jewels */}
    {[10,19,28].map((x,i)=>(
      <circle key={i} cx={x+1} cy="5.5" r="1.2" fill={isWhite?"#ffe060":"#e8c050"} stroke={p.stroke} strokeWidth="0.6"/>
    ))}
  </>}/>;
}

// ── ROOK ────────────────────────────────────────────────
export function Rook({ size, isWhite }) {
  return <Piece size={size} isWhite={isWhite} d={(p, fill) => <>
    <rect x="7"  y="29" width="24" height="5"  rx="2.5" fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="10" y="25" width="18" height="5"  rx="1.5" fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="11" y="13" width="16" height="13" rx="2"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="9"  y="12" width="20" height="3.5" rx="1"  fill={fill}  stroke={p.stroke} strokeWidth="0.8"/>
    {/* Battlements */}
    {[9, 15, 21].map((x,i)=>(
      <rect key={i} x={x} y="5" width="5.5" height="8.5" rx="1" fill={fill} stroke={p.stroke} strokeWidth={sw}/>
    ))}
    {/* Loop window */}
    <rect x="16" y="17" width="6" height="5" rx="1" fill={p.shade} stroke={p.stroke} strokeWidth="0.7" opacity="0.6"/>
  </>}/>;
}

// ── BISHOP ────────────────────────────────────────────────
export function Bishop({ size, isWhite }) {
  return <Piece size={size} isWhite={isWhite} d={(p, fill) => <>
    <rect x="9"  y="29" width="20" height="5"  rx="2.5" fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <ellipse cx="19" cy="24.5" rx="8.5" ry="4"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <path d="M12 25 Q19 7 26 25" fill={fill} stroke={p.stroke} strokeWidth={sw}/>
    <ellipse cx="19" cy="16" rx="5" ry="1.5" fill="none" stroke={p.accent} strokeWidth="1"/>
    {/* Top orb */}
    <circle cx="19" cy="7.5" r="3.8" fill={fill}   stroke={p.stroke} strokeWidth={sw}/>
    <circle cx="19" cy="7.5" r="1.8" fill={p.accent} stroke={p.stroke} strokeWidth="0.7"/>
    <circle cx="17.8" cy="6.3" r="0.7" fill={isWhite?"#fffce0":"#f0d860"} opacity="0.8"/>
  </>}/>;
}

// ── KNIGHT ────────────────────────────────────────────────
export function Knight({ size, isWhite }) {
  return <Piece size={size} isWhite={isWhite} d={(p, fill) => <>
    <rect x="9"  y="29" width="20" height="5"  rx="2.5" fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="11" y="24" width="15" height="6"  rx="2"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    {/* Horse head profile */}
    <path d="M11 29 L12 20 Q12 12 17 10 L24 9 Q27 9 27 12.5 L25.5 16.5 Q28 18 26.5 21 L25 23.5 L22 21 Q21 25 17 26 L12 28 Z"
      fill={fill} stroke={p.stroke} strokeWidth={sw}/>
    {/* Mane */}
    <path d="M17 10 Q15 14 15 20" fill="none" stroke={p.shade} strokeWidth="1.2" opacity="0.5"/>
    <path d="M15 12 Q13.5 16 13.8 21" fill="none" stroke={p.shade} strokeWidth="0.9" opacity="0.35"/>
    {/* Eye */}
    <circle cx="23.5" cy="13" r="1.4" fill={p.eye} stroke={p.stroke} strokeWidth="0.6"/>
    <circle cx="23.8" cy="12.7" r="0.4" fill={isWhite?"#fffce0":"#f0d860"}/>
    {/* Nostril */}
    <circle cx="26.2" cy="18" r="0.6" fill={p.stroke} opacity="0.5"/>
  </>}/>;
}

// ── PAWN ────────────────────────────────────────────────
export function Pawn({ size, isWhite }) {
  return <Piece size={size} isWhite={isWhite} d={(p, fill) => <>
    <rect x="9"  y="29" width="20" height="5"  rx="2.5" fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="12" y="25" width="14" height="5"  rx="2"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="14.5" y="21" width="9" height="5" rx="1.5" fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <circle cx="19" cy="14.5" r="7.5" fill={fill} stroke={p.stroke} strokeWidth={sw}/>
    {/* Face detail — subtle cross engraving */}
    <circle cx="19" cy="14.5" r="2.5" fill="none" stroke={p.shade} strokeWidth="0.8" opacity="0.4"/>
    <circle cx="17.2" cy="12.8" r="0.8" fill={p.shade} opacity="0.3"/>
  </>}/>;
}

// ── SAGE / ORACLE — Rook movement ───────────────────────
export function Sage({ size, isWhite }) {
  return <Piece size={size} isWhite={isWhite} d={(p, fill) => <>
    <rect x="8"  y="29" width="22" height="5"  rx="2.5" fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="10" y="25" width="18" height="5"  rx="2"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    <rect x="12" y="15" width="14" height="11" rx="2"   fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    {/* Wizard hat */}
    <path d="M12 16 L19 3 L26 16 Z" fill={fill} stroke={p.stroke} strokeWidth={sw}/>
    <ellipse cx="19" cy="16" rx="8" ry="2.2" fill={fill} stroke={p.stroke} strokeWidth={sw}/>
    {/* Star on hat */}
    <polygon points="19,6 20,9 23,9 20.5,11 21.5,14 19,12 16.5,14 17.5,11 15,9 18,9"
      fill={p.accent} stroke={p.stroke} strokeWidth="0.6"/>
    {/* Robe belt */}
    <rect x="12" y="19.5" width="14" height="2" rx="1" fill={p.accent} opacity="0.5"/>
  </>}/>;
}

// ── PHASE WALKER / PHANTOM ───────────────────────────────
export function PhaseWalker({ size, isWhite }) {
  return <Piece size={size} isWhite={isWhite} d={(p, fill) => <>
    <rect x="9"  y="29" width="20" height="5"  rx="2.5" fill={fill}  stroke={p.stroke} strokeWidth={sw}/>
    {/* Flowing cloak */}
    <path d="M10 34 Q11 25 13 23 Q14 17 13 12 Q16 6 19 6 Q22 6 25 12 Q24 17 25 23 Q27 25 28 34"
      fill={fill} stroke={p.stroke} strokeWidth={sw}/>
    {/* Orb */}
    <circle cx="19" cy="12" r="6" fill={fill} stroke={p.stroke} strokeWidth={sw}/>
    {/* Inner orb ring */}
    <circle cx="19" cy="12" r="3.5" fill="none" stroke={p.accent} strokeWidth="1" opacity="0.7"/>
    <circle cx="19" cy="12" r="1.5" fill={p.accent} opacity="0.85"/>
    {/* Highlight */}
    <circle cx="17.2" cy="10.2" r="1.1" fill={isWhite?"#fffce0":"#f0d880"} opacity="0.45"/>
    {/* Wisp tendrils */}
    {[[13,26,11,31],[25,26,27,31],[15,31,13,34],[23,31,25,34]].map(([x1,y1,x2,y2],i)=>(
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={p.stroke} strokeWidth="0.8" opacity="0.35"/>
    ))}
  </>}/>;
}

// ── PIECE MAP ────────────────────────────────────────────
export const PIECE_COMPONENTS = {
  W_K: King,       B_K: King,
  W_Q: Queen,      B_Q: Queen,
  W_R: Rook,       B_R: Rook,
  W_B: Bishop,     B_B: Bishop,
  W_N: Knight,     B_N: Knight,
  W_P: Pawn,       B_P: Pawn,
  W_S: Sage,       B_S: Sage,
  W_X: PhaseWalker, B_X: PhaseWalker,
};

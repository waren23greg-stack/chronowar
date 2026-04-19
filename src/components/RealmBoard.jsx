// ============================================================
//  CHRONOWAR — RealmBoard v4
//  Map-textured board panels, per-realm parchment skin
// ============================================================
import { COLS } from "../engine";
import BoardSquare from "./BoardSquare";

// SVG map texture patterns — inline, no external files
function MapPattern({ realm, id }) {
  if (realm === "past") return (
    <pattern id={id} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      {/* Aged parchment lines */}
      <rect width="40" height="40" fill="rgba(160,110,40,.04)"/>
      <line x1="0" y1="10" x2="40" y2="10" stroke="rgba(100,65,20,.06)" strokeWidth="0.5"/>
      <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(100,65,20,.06)" strokeWidth="0.5"/>
      <line x1="0" y1="30" x2="40" y2="30" stroke="rgba(100,65,20,.06)" strokeWidth="0.5"/>
      <line x1="10" y1="0" x2="10" y2="40" stroke="rgba(100,65,20,.04)" strokeWidth="0.5"/>
      <line x1="20" y1="0" x2="20" y2="40" stroke="rgba(100,65,20,.04)" strokeWidth="0.5"/>
      <line x1="30" y1="0" x2="30" y2="40" stroke="rgba(100,65,20,.04)" strokeWidth="0.5"/>
      {/* Parchment age spots */}
      <circle cx="8"  cy="8"  r="1.5" fill="rgba(120,80,20,.07)"/>
      <circle cx="28" cy="18" r="1"   fill="rgba(120,80,20,.06)"/>
      <circle cx="15" cy="35" r="2"   fill="rgba(120,80,20,.05)"/>
    </pattern>
  );
  if (realm === "present") return (
    <pattern id={id} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      {/* Military grid map */}
      <rect width="40" height="40" fill="rgba(60,100,30,.03)"/>
      <line x1="0" y1="8"  x2="40" y2="8"  stroke="rgba(40,80,20,.07)" strokeWidth="0.4"/>
      <line x1="0" y1="16" x2="40" y2="16" stroke="rgba(40,80,20,.07)" strokeWidth="0.4"/>
      <line x1="0" y1="24" x2="40" y2="24" stroke="rgba(40,80,20,.07)" strokeWidth="0.4"/>
      <line x1="0" y1="32" x2="40" y2="32" stroke="rgba(40,80,20,.07)" strokeWidth="0.4"/>
      <line x1="8"  y1="0" x2="8"  y2="40" stroke="rgba(40,80,20,.05)" strokeWidth="0.4"/>
      <line x1="16" y1="0" x2="16" y2="40" stroke="rgba(40,80,20,.05)" strokeWidth="0.4"/>
      <line x1="24" y1="0" x2="24" y2="40" stroke="rgba(40,80,20,.05)" strokeWidth="0.4"/>
      <line x1="32" y1="0" x2="32" y2="40" stroke="rgba(40,80,20,.05)" strokeWidth="0.4"/>
      {/* Contour curves (military topo) */}
      <ellipse cx="20" cy="20" rx="15" ry="10" fill="none" stroke="rgba(50,90,25,.06)" strokeWidth="0.5"/>
    </pattern>
  );
  // future — blueprint/star chart
  return (
    <pattern id={id} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="rgba(60,30,120,.04)"/>
      {/* Blueprint grid */}
      <line x1="0" y1="10" x2="40" y2="10" stroke="rgba(100,60,200,.07)" strokeWidth="0.4"/>
      <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(100,60,200,.09)" strokeWidth="0.5"/>
      <line x1="0" y1="30" x2="40" y2="30" stroke="rgba(100,60,200,.07)" strokeWidth="0.4"/>
      <line x1="10" y1="0" x2="10" y2="40" stroke="rgba(100,60,200,.07)" strokeWidth="0.4"/>
      <line x1="20" y1="0" x2="20" y2="40" stroke="rgba(100,60,200,.09)" strokeWidth="0.5"/>
      <line x1="30" y1="0" x2="30" y2="40" stroke="rgba(100,60,200,.07)" strokeWidth="0.4"/>
      {/* Star dots */}
      <circle cx="5"  cy="5"  r="0.7" fill="rgba(200,180,255,.25)"/>
      <circle cx="20" cy="15" r="1"   fill="rgba(200,180,255,.2)"/>
      <circle cx="35" cy="30" r="0.8" fill="rgba(200,180,255,.22)"/>
      <circle cx="12" cy="32" r="0.6" fill="rgba(200,180,255,.18)"/>
    </pattern>
  );
}

export default function RealmBoard({ realm, cfg, board, sel, moves, lastMove, onClick, sqSize }) {
  const isPresent = realm === "present";
  const patId = `map-${realm}`;
  const boardPx = sqSize * 6;

  return (
    <div style={{
      position: "relative",
      background: cfg.bg,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: isPresent ? 10 : 7,
      padding: isPresent ? "11px 13px 9px" : "7px 9px 6px",
      boxShadow: [
        `0 4px 24px rgba(0,0,0,.55)`,
        `0 1px 0 rgba(255,255,255,.04) inset`,
        `0 0 0 1px rgba(0,0,0,.4)`,
      ].join(", "),
    }}>

      {/* Realm header */}
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: isPresent ? "14px" : "11px",
        letterSpacing: isPresent ? 4 : 2,
        color: cfg.text,
        textAlign: "center",
        marginBottom: isPresent ? 8 : 5,
        fontWeight: 700,
        lineHeight: 1.3,
        textShadow: "0 1px 2px rgba(0,0,0,.4)",
      }}>
        <span style={{ opacity: 0.75, marginRight: 6, fontSize: isPresent ? "16px" : "13px" }}>{cfg.icon}</span>
        {cfg.name}
      </div>

      {/* Board container */}
      <div style={{
        position: "relative",
        border: `1.5px solid ${cfg.border}`,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "inset 0 1px 4px rgba(0,0,0,.35)",
      }}>
        {/* Map texture SVG overlay */}
        <svg
          width={boardPx} height={boardPx}
          style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:5 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs><MapPattern realm={realm} id={patId}/></defs>
          <rect width={boardPx} height={boardPx} fill={`url(#${patId})`}/>
          {/* Vignette */}
          <radialGradient id={`vig-${realm}`} cx="50%" cy="50%" r="70%">
            <stop offset="55%" stopColor="transparent"/>
            <stop offset="100%" stopColor="rgba(0,0,0,.22)"/>
          </radialGradient>
          <rect width={boardPx} height={boardPx} fill={`url(#vig-${realm})`}/>
        </svg>

        {/* Squares */}
        {board.map((rowArr, row) => (
          <div key={row} style={{ display: "flex" }}>
            {rowArr.map((piece, col) => {
              const isSel      = sel?.realm === realm && sel?.row === row && sel?.col === col;
              const mv         = moves.find(m => m.realm === realm && m.row === row && m.col === col);
              const isLastFrom = lastMove?.fRealm === realm && lastMove?.fRow === row && lastMove?.fCol === col;
              const isLastTo   = lastMove?.tRealm === realm && lastMove?.tRow === row && lastMove?.tCol === col;
              return (
                <BoardSquare
                  key={col}
                  piece={piece}
                  isLight={(row + col) % 2 === 0}
                  isSel={isSel}
                  move={mv}
                  isLastFrom={isLastFrom}
                  isLastTo={isLastTo}
                  cfg={cfg}
                  sqSize={sqSize}
                  onClick={() => onClick(realm, row, col)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Coordinate labels */}
      <div style={{ display: "flex", marginTop: 3 }}>
        {COLS.map(l => (
          <div key={l} style={{
            width: sqSize, textAlign: "center",
            fontSize: "10px",
            color: cfg.inkColor,
            fontFamily: "'Cinzel', serif",
            letterSpacing: 1,
            opacity: 0.55,
          }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
//  CHRONOWAR — RealmBoard v3  (3D depth, atmospheric)
// ============================================================
import { COLS } from "../engine";
import BoardSquare from "./BoardSquare";

export default function RealmBoard({ realm, cfg, board, sel, moves, lastMove, onClick, sqSize }) {
  const isPresent = realm === "present";

  return (
    <div style={{
      position: "relative",
      background: `radial-gradient(ellipse at 30% 20%, ${cfg.glow}18 0%, transparent 70%), ${cfg.bg}`,
      border: `1px solid ${cfg.border}`,
      borderRadius: isPresent ? 10 : 8,
      padding: isPresent ? "12px 14px 10px" : "8px 10px 7px",
      boxShadow: [
        `0 0 40px ${cfg.glow}14`,
        `0 0 2px ${cfg.border}`,
        `inset 0 0 30px rgba(0,0,0,.65)`,
        `0 8px 32px rgba(0,0,0,.55)`,
      ].join(", "),
      // Subtle 3D tilt for side boards
      transform: isPresent ? "none"
        : realm === "past"
          ? "perspective(600px) rotateX(3deg) rotateY(1.5deg)"
          : "perspective(600px) rotateX(3deg) rotateY(-1.5deg)",
      transformOrigin: "center top",
    }}>
      {/* Realm header */}
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: isPresent ? ".75rem" : ".55rem",
        letterSpacing: isPresent ? 5 : 3,
        color: cfg.text,
        textAlign: "center",
        marginBottom: isPresent ? 8 : 5,
        fontWeight: 700,
        textShadow: `0 0 16px ${cfg.glow}88, 0 1px 3px #000`,
        lineHeight: 1.4,
      }}>
        <span style={{ opacity: 0.7, marginRight: 6 }}>{cfg.icon}</span>
        {cfg.name}
      </div>

      {/* Atmosphere glow overlay */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "40%",
        background: `linear-gradient(to bottom, ${cfg.glow}0c, transparent)`,
        borderRadius: "8px 8px 0 0",
        pointerEvents: "none",
      }} />

      {/* Board grid with 3D inset */}
      <div style={{
        border: `1px solid ${cfg.border}`,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: [
          `0 0 20px ${cfg.glow}22`,
          `inset 0 0 12px rgba(0,0,0,.5)`,
          `inset 0 2px 4px rgba(0,0,0,.4)`,
        ].join(", "),
        position: "relative",
      }}>
        {/* Subtle inner vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.35) 100%)`,
          pointerEvents: "none", zIndex: 10,
        }} />

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

      {/* Column labels */}
      <div style={{ display: "flex", marginTop: 4 }}>
        {COLS.map(l => (
          <div key={l} style={{
            width: sqSize, textAlign: "center",
            fontSize: ".38rem", color: cfg.text + "50",
            fontFamily: "'Cinzel', serif", letterSpacing: 1,
          }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

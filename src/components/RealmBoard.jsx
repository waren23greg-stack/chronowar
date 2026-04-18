// ============================================================
//  CHRONOWAR — RealmBoard Component
// ============================================================

import { COLS } from "../engine";
import BoardSquare from "./BoardSquare";

export default function RealmBoard({ realm, cfg, board, sel, moves, lastMove, onClick, sqSize }) {
  return (
    <div style={{
      background: cfg.bg,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: 8,
      padding: "8px 10px",
      boxShadow: `0 0 22px ${cfg.glow}18, inset 0 0 24px rgba(0,0,0,.55)`,
      flexShrink: 0,
    }}>
      {/* Realm header */}
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: sqSize > 40 ? ".72rem" : ".55rem",
        letterSpacing: 3,
        color: cfg.text,
        textAlign: "center",
        marginBottom: 5,
        fontWeight: 700,
        textShadow: `0 0 12px ${cfg.glow}55`,
        lineHeight: 1.3,
      }}>
        {cfg.icon} {cfg.name}
      </div>

      {/* Board grid */}
      <div style={{
        border: `1px solid ${cfg.border}`,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: `0 0 14px ${cfg.glow}28`,
      }}>
        {board.map((rowArr, row) => (
          <div key={row} style={{ display: "flex" }}>
            {rowArr.map((piece, col) => {
              const isSel = sel?.realm === realm && sel?.row === row && sel?.col === col;
              const mv = moves.find(m => m.realm === realm && m.row === row && m.col === col);
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
      <div style={{ display: "flex", marginTop: 3 }}>
        {COLS.map(l => (
          <div key={l} style={{
            width: sqSize, textAlign: "center",
            fontSize: ".4rem", color: cfg.text + "45",
            fontFamily: "'Cinzel', serif",
          }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

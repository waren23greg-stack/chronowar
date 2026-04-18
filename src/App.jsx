// ============================================================
//  CHRONOWAR — Main App
//  The Chronicles of Three Realms
// ============================================================

import { useState, useEffect, useRef } from "react";
import {
  REALMS, REALM_CFG, SYMBOLS, LORE,
  isW, isB, pt, initBoards, legalMoves, applyMove,
  inCheck, hasAnyLegal,
} from "./engine";
import { generateNarration } from "./narrative";
import RealmBoard from "./components/RealmBoard";
import ChroniclePanel, { SagaScroll, PieceLegend } from "./components/ChroniclePanel";
import GameOverlay from "./components/GameOverlay";
import "./App.css";

const STARS = Array.from({ length: 65 }, (_, i) => ({
  x: (i * 41.37 + 7.11) % 100,
  y: (i * 67.91 + 3.55) % 100,
  sz: i % 7 === 0 ? 2 : 1,
  dur: 2 + (i % 4),
  del: (i % 5) * 0.65,
}));

const INTRO_NARR =
  "The war across time awaits your command. Two armies stand at the precipice of eternity — the radiant Luminar Order and the shadowed Umbral Conclave. Move a piece to begin the chronicles, and let the saga be written across all three realms of time.";

export default function App() {
  const [boards, setBoards] = useState(initBoards);
  const [sel, setSel] = useState(null);
  const [moves, setMoves] = useState([]);
  const [turn, setTurn] = useState("white");
  const [status, setStatus] = useState("playing");
  const [captured, setCaptured] = useState({ white: [], black: [] });
  const [moveNum, setMoveNum] = useState(0);
  const [lastMove, setLastMove] = useState(null);

  const [narr, setNarr] = useState(INTRO_NARR);
  const [displayed, setDisplayed] = useState("");
  const [narrating, setNarrating] = useState(false);

  const [storyLog, setStoryLog] = useState([]);
  const storyCtx = useRef([]);
  const twTimer = useRef(null);

  useEffect(() => {
    if (twTimer.current) clearInterval(twTimer.current);
    if (!narr) { setDisplayed(""); return; }
    let i = 0; setDisplayed("");
    twTimer.current = setInterval(() => {
      if (i < narr.length) { setDisplayed(s => s + narr[i]); i++; }
      else clearInterval(twTimer.current);
    }, 18);
    return () => clearInterval(twTimer.current);
  }, [narr]);

  const doNarration = async (info) => {
    setNarrating(true);
    const ctx = storyCtx.current.slice(-3).join(" ");
    const text = await generateNarration(info, ctx);
    const final = text || `${LORE[info.piece]}, ${info.side === "white" ? "champion of the Luminar Order" : "harbinger of the Umbral Conclave"}, advances through the ${info.trRealm} realm.`;
    storyCtx.current = [...storyCtx.current.slice(-4), final];
    setStoryLog(prev => [{ t: final, p: info.piece, n: info.num, side: info.side }, ...prev.slice(0, 14)]);
    setNarr(final);
    setNarrating(false);
  };

  const handleClick = (realm, row, col) => {
    if (status === "checkmate" || status === "stalemate") return;
    const piece = boards[realm][row][col];

    if (sel) {
      const mv = moves.find(m => m.realm === realm && m.row === row && m.col === col);
      if (mv) {
        const capPiece = boards[realm][row][col];
        const movPiece = boards[sel.realm][sel.row][sel.col];
        const nb = applyMove(boards, sel.realm, sel.row, sel.col, realm, row, col);
        const promo = pt(movPiece) === "P" && ((isW(movPiece) && row === 0) || (isB(movPiece) && row === 5));

        if (capPiece)
          setCaptured(prev => ({ ...prev, [isW(capPiece) ? "white" : "black"]: [...prev[isW(capPiece) ? "white" : "black"], capPiece] }));

        const newTurn   = turn === "white" ? "black" : "white";
        const num       = moveNum + 1;
        const newCheck  = inCheck(nb, newTurn === "white");
        const hasLegal  = hasAnyLegal(nb, newTurn === "white");
        const newStatus = !hasLegal ? (newCheck ? "checkmate" : "stalemate") : newCheck ? "check" : "playing";

        const info = {
          piece: movPiece, num, side: isW(movPiece) ? "white" : "black",
          fr: sel.row, fc: sel.col, frRealm: sel.realm,
          tr: row, tc: col, trRealm: realm,
          cap: capPiece || null, chk: newCheck, cross: mv.cross, promo,
        };

        setLastMove({ fRealm: sel.realm, fRow: sel.row, fCol: sel.col, tRealm: realm, tRow: row, tCol: col });
        setBoards(nb);
        setSel(null); setMoves([]);
        setTurn(newTurn); setMoveNum(num); setStatus(newStatus);
        doNarration(info);
        return;
      }
      setSel(null); setMoves([]);
    }

    if (piece && (turn === "white" ? isW(piece) : isB(piece))) {
      setSel({ realm, row, col });
      setMoves(legalMoves(boards, realm, row, col));
    }
  };

  const reset = () => {
    if (twTimer.current) clearInterval(twTimer.current);
    setBoards(initBoards()); setSel(null); setMoves([]);
    setTurn("white"); setStatus("playing");
    setCaptured({ white: [], black: [] });
    setMoveNum(0); setLastMove(null);
    setStoryLog([]); storyCtx.current = [];
    setNarr("A new war begins across the three realms of time. The Luminar Order and the Umbral Conclave assume their eternal positions once more. Let the chronicles be written anew…");
    setNarrating(false);
  };

  const wTurn = turn === "white";
  const statusLabel =
    status === "checkmate" ? "☠ CHECKMATE!" :
    status === "check"     ? "⚠ CHECK!" :
    status === "stalemate" ? "⚖ STALEMATE" :
    `Move ${moveNum}`;

  return (
    <div className="cw-root">
      <div className="cw-stars">
        {STARS.map((s, i) => (
          <div key={i} className="cw-star" style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.sz, height: s.sz,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.del}s`,
          }} />
        ))}
      </div>

      <div className="cw-content">
        <header className="cw-header">
          <h1 className="cw-title">CHRONOWAR</h1>
          <div className="cw-subtitle">THE CHRONICLES OF THREE REALMS</div>
          <div className="cw-status-bar">
            <span className={`cw-faction ${wTurn ? "active" : ""}`}>
              {wTurn ? "▶ " : ""}⚪ LUMINAR ORDER
            </span>
            <span className={`cw-status-label status-${status}`}>{statusLabel}</span>
            <span className={`cw-faction ${!wTurn ? "active-dark" : ""}`}>
              UMBRAL CONCLAVE ⚫{!wTurn ? " ◀" : ""}
            </span>
          </div>
        </header>

        <main className="cw-main">
          <div className="cw-side-boards">
            <RealmBoard realm="past" cfg={REALM_CFG.past} board={boards.past}
              sel={sel} moves={moves} lastMove={lastMove} onClick={handleClick} sqSize={28} />
            <div className="cw-portal-label">— TIME PORTAL —</div>
            <RealmBoard realm="future" cfg={REALM_CFG.future} board={boards.future}
              sel={sel} moves={moves} lastMove={lastMove} onClick={handleClick} sqSize={28} />
          </div>

          <div className="cw-center">
            <RealmBoard realm="present" cfg={REALM_CFG.present} board={boards.present}
              sel={sel} moves={moves} lastMove={lastMove} onClick={handleClick} sqSize={46} />
            <div className="cw-captured">
              <div className="cw-captured-side cw-captured-w">
                {captured.white.length > 0 ? captured.white.map(p => SYMBOLS[p]).join("") : "—"}
              </div>
              <div className="cw-captured-label">captured</div>
              <div className="cw-captured-side cw-captured-b">
                {captured.black.length > 0 ? captured.black.map(p => SYMBOLS[p]).join("") : "—"}
              </div>
            </div>
          </div>

          <div className="cw-right-panel">
            <ChroniclePanel narrating={narrating} displayed={displayed} />
            <SagaScroll storyLog={storyLog} />
            <PieceLegend />
            <button onClick={reset} className="cw-reset-btn">↺ NEW CHRONICLE</button>
          </div>
        </main>
      </div>

      <GameOverlay status={status} loserTurn={turn} lastNarr={storyLog[0]?.t} onReset={reset} />
    </div>
  );
}

// ============================================================
//  CHRONOWAR — Main App v2  (AI + Battle Chronicle)
// ============================================================
import { useState, useEffect, useRef, useCallback } from "react";
import {
  REALMS, REALM_CFG, SYMBOLS, LORE,
  isW, isB, pt, initBoards, legalMoves, applyMove,
  inCheck, hasAnyLegal,
} from "./engine";
import { generateNarration } from "./narrative";
import { getBestMove, getEasyMove } from "./ai";
import { generateBattleChronicle } from "./chronicle";
import RealmBoard from "./components/RealmBoard";
import ChroniclePanel, { SagaScroll, PieceLegend } from "./components/ChroniclePanel";
import "./App.css";

const STARS = Array.from({ length: 65 }, (_, i) => ({
  x: (i * 41.37 + 7.11) % 100, y: (i * 67.91 + 3.55) % 100,
  sz: i % 7 === 0 ? 2 : 1, dur: 2 + (i % 4), del: (i % 5) * 0.65,
}));

const INTRO = "The war across time awaits your command. Two armies stand at the precipice of eternity — the radiant Luminar Order and the shadowed Umbral Conclave. Move a piece to begin the chronicles.";

const AI_TAUNTS = {
  easy:   ["The void stirs…", "Lich-Lord Vex'rath deliberates…", "Shadows shift…"],
  medium: ["The Umbral Conclave calculates your doom…", "Void Empress Nythera sees your weakness…", "Dark forces converge…"],
  hard:   ["Lich-Lord Vex'rath pierces all three timelines…", "The Conclave has foreseen your end…", "Time bends to shadow's will…"],
};

export default function App() {
  // ── Game state ──
  const [boards, setBoards]       = useState(initBoards);
  const [sel, setSel]             = useState(null);
  const [moves, setMoves]         = useState([]);
  const [turn, setTurn]           = useState("white");
  const [status, setStatus]       = useState("playing");
  const [captured, setCaptured]   = useState({ white: [], black: [] });
  const [moveNum, setMoveNum]     = useState(0);
  const [lastMove, setLastMove]   = useState(null);

  // ── Mode & difficulty ──
  const [mode, setMode]           = useState("vs-ai");   // "vs-ai" | "vs-player"
  const [difficulty, setDifficulty] = useState("medium");
  const [aiThinking, setAiThinking] = useState(false);
  const [aiTaunt, setAiTaunt]     = useState("");

  // ── Narrative ──
  const [narr, setNarr]           = useState(INTRO);
  const [displayed, setDisplayed] = useState("");
  const [narrating, setNarrating] = useState(false);
  const [storyLog, setStoryLog]   = useState([]);
  const storyCtx                  = useRef([]);
  const twTimer                   = useRef(null);

  // ── Battle Chronicle overlay ──
  const [showChronicle, setShowChronicle]         = useState(false);
  const [chronicleData, setChronicleData]         = useState(null);
  const [chronicleLoading, setChronicleLoading]   = useState(false);

  // ── Game over overlay ──
  const [showOver, setShowOver]   = useState(false);

  // ── Refs to avoid stale closures ──
  const boardsRef     = useRef(boards);
  const turnRef       = useRef(turn);
  const statusRef     = useRef(status);
  const modeRef       = useRef(mode);
  const difficultyRef = useRef(difficulty);
  const moveNumRef    = useRef(moveNum);
  const storyLogRef   = useRef(storyLog);
  useEffect(() => { boardsRef.current = boards; }, [boards]);
  useEffect(() => { turnRef.current = turn; }, [turn]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { moveNumRef.current = moveNum; }, [moveNum]);
  useEffect(() => { storyLogRef.current = storyLog; }, [storyLog]);

  // ── Typewriter ──
  useEffect(() => {
    if (twTimer.current) clearInterval(twTimer.current);
    if (!narr) { setDisplayed(""); return; }
    let i = 0; setDisplayed("");
    twTimer.current = setInterval(() => {
      if (i < narr.length) { setDisplayed(s => s + narr[i]); i++; }
      else clearInterval(twTimer.current);
    }, 16);
    return () => clearInterval(twTimer.current);
  }, [narr]);

  // ── Narration ──
  const doNarration = useCallback(async (info) => {
    setNarrating(true);
    const ctx = storyCtx.current.slice(-3).join(" ");
    const text = await generateNarration(info, ctx);
    const final = text || `${LORE[info.piece]}, ${info.side === "white" ? "champion of the Luminar Order" : "harbinger of the Umbral Conclave"}, advances through the ${info.trRealm} realm.`;
    storyCtx.current = [...storyCtx.current.slice(-4), final];
    const entry = { t: final, p: info.piece, n: info.num, side: info.side };
    setStoryLog(prev => [entry, ...prev.slice(0, 19)]);
    setNarr(final);
    setNarrating(false);
  }, []);

  // ── Commit a move (shared by human + AI) ──
  const commitMove = useCallback((currentBoards, movePiece, fromRealm, fromRow, fromCol, toRealm, toRow, toCol, currentTurn, currentMoveNum) => {
    const capPiece = currentBoards[toRealm][toRow][toCol];
    const nb = applyMove(currentBoards, fromRealm, fromRow, fromCol, toRealm, toRow, toCol);
    const promo = pt(movePiece) === "P" && ((isW(movePiece) && toRow === 0) || (isB(movePiece) && toRow === 5));

    if (capPiece)
      setCaptured(prev => ({ ...prev, [isW(capPiece) ? "white" : "black"]: [...prev[isW(capPiece) ? "white" : "black"], capPiece] }));

    const newTurn   = currentTurn === "white" ? "black" : "white";
    const num       = currentMoveNum + 1;
    const newCheck  = inCheck(nb, newTurn === "white");
    const hasLegal  = hasAnyLegal(nb, newTurn === "white");
    const newStatus = !hasLegal ? (newCheck ? "checkmate" : "stalemate") : newCheck ? "check" : "playing";
    const cross     = fromRealm !== toRealm;

    const info = {
      piece: movePiece, num, side: isW(movePiece) ? "white" : "black",
      fr: fromRow, fc: fromCol, frRealm: fromRealm,
      tr: toRow, tc: toCol, trRealm: toRealm,
      cap: capPiece || null, chk: newCheck, cross, promo,
    };

    setLastMove({ fRealm: fromRealm, fRow: fromRow, fCol: fromCol, tRealm: toRealm, tRow: toRow, tCol: toCol });
    setBoards(nb);
    setTurn(newTurn);
    setMoveNum(num);
    setStatus(newStatus);
    doNarration(info);

    if (newStatus === "checkmate" || newStatus === "stalemate") {
      setTimeout(() => setShowOver(true), 1800);
    }

    return { nb, newTurn, num, newStatus };
  }, [doNarration]);

  // ── AI move trigger ──
  useEffect(() => {
    if (modeRef.current !== "vs-ai") return;
    if (turnRef.current !== "black") return;
    if (statusRef.current !== "playing" && statusRef.current !== "check") return;

    const taunts = AI_TAUNTS[difficultyRef.current] || AI_TAUNTS.medium;
    setAiTaunt(taunts[Math.floor(Math.random() * taunts.length)]);
    setAiThinking(true);

    const delay = difficulty === "easy" ? 700 : difficulty === "medium" ? 1200 : 1800;

    const timer = setTimeout(() => {
      const b = boardsRef.current;
      const m = difficultyRef.current === "easy" ? getEasyMove(b) : getBestMove(b, difficultyRef.current);
      setAiThinking(false);
      setAiTaunt("");
      if (!m) return;
      const movePiece = b[m.fromRealm][m.fromRow][m.fromCol];
      commitMove(b, movePiece, m.fromRealm, m.fromRow, m.fromCol, m.realm, m.row, m.col, "black", moveNumRef.current);
    }, delay);

    return () => clearTimeout(timer);
  }, [turn, status, mode]); // eslint-disable-line

  // ── Human click ──
  const handleClick = (realm, row, col) => {
    if (status === "checkmate" || status === "stalemate") return;
    if (mode === "vs-ai" && turn === "black") return;
    const piece = boards[realm][row][col];

    if (sel) {
      const mv = moves.find(m => m.realm === realm && m.row === row && m.col === col);
      if (mv) {
        const movePiece = boards[sel.realm][sel.row][sel.col];
        setSel(null); setMoves([]);
        commitMove(boards, movePiece, sel.realm, sel.row, sel.col, realm, row, col, turn, moveNum);
        return;
      }
      setSel(null); setMoves([]);
    }
    if (piece && (turn === "white" ? isW(piece) : isB(piece))) {
      setSel({ realm, row, col });
      setMoves(legalMoves(boards, realm, row, col));
    }
  };

  // ── Open Battle Chronicle ──
  const openChronicle = async () => {
    setShowChronicle(true);
    setChronicleLoading(true);
    const winner = status === "checkmate" ? (turn === "white" ? "black" : "white") : "none";
    const data = await generateBattleChronicle(storyLogRef.current, winner, moveNum);
    setChronicleData(data);
    setChronicleLoading(false);
  };

  // ── Reset ──
  const reset = () => {
    if (twTimer.current) clearInterval(twTimer.current);
    setBoards(initBoards()); setSel(null); setMoves([]);
    setTurn("white"); setStatus("playing");
    setCaptured({ white: [], black: [] });
    setMoveNum(0); setLastMove(null);
    setStoryLog([]); storyCtx.current = [];
    setNarr("A new war begins. The armies assume their eternal positions once more — let the chronicles be written anew…");
    setNarrating(false); setAiThinking(false); setAiTaunt("");
    setShowOver(false); setShowChronicle(false); setChronicleData(null);
  };

  const wTurn = turn === "white";
  const statusLabel =
    status === "checkmate" ? "☠ CHECKMATE!" :
    status === "check"     ? "⚠ CHECK!" :
    status === "stalemate" ? "⚖ STALEMATE" :
    aiThinking             ? aiTaunt || "…" :
    `Move ${moveNum}`;

  return (
    <div className="cw-root">
      <div className="cw-stars">
        {STARS.map((s, i) => (
          <div key={i} className="cw-star" style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.sz, height:s.sz, animationDuration:`${s.dur}s`, animationDelay:`${s.del}s` }} />
        ))}
      </div>

      <div className="cw-content">
        {/* ── Header ── */}
        <header className="cw-header">
          <h1 className="cw-title">CHRONOWAR</h1>
          <div className="cw-subtitle">THE CHRONICLES OF THREE REALMS</div>

          {/* Mode + difficulty controls */}
          <div className="cw-controls">
            <div className="cw-mode-tabs">
              {[["vs-ai","⚔ vs AI"],["vs-player","👥 2 Player"]].map(([m,l]) => (
                <button key={m} onClick={() => { setMode(m); reset(); }}
                  className={`cw-tab ${mode===m?"active":""}`}>{l}</button>
              ))}
            </div>
            {mode === "vs-ai" && (
              <div className="cw-diff-tabs">
                {[["easy","EASY"],["medium","MEDIUM"],["hard","HARD"]].map(([d,l]) => (
                  <button key={d} onClick={() => { setDifficulty(d); reset(); }}
                    className={`cw-diff ${difficulty===d?"active":""} diff-${d}`}>{l}</button>
                ))}
              </div>
            )}
          </div>

          <div className="cw-status-bar">
            <span className={`cw-faction ${wTurn && !aiThinking ? "active" : ""}`}>
              {wTurn && !aiThinking ? "▶ " : ""}⚪ LUMINAR ORDER
            </span>
            <span className={`cw-status-label status-${aiThinking?"thinking":status}`}>{statusLabel}</span>
            <span className={`cw-faction ${!wTurn && !aiThinking ? "active-dark" : ""}`}>
              UMBRAL CONCLAVE ⚫{!wTurn && !aiThinking ? " ◀" : ""}
            </span>
          </div>
        </header>

        {/* ── Boards ── */}
        <main className="cw-main">
          <div className="cw-side-boards">
            <RealmBoard realm="past" cfg={REALM_CFG.past} board={boards.past} sel={sel} moves={moves} lastMove={lastMove} onClick={handleClick} sqSize={28} />
            <div className="cw-portal-label">— TIME PORTAL —</div>
            <RealmBoard realm="future" cfg={REALM_CFG.future} board={boards.future} sel={sel} moves={moves} lastMove={lastMove} onClick={handleClick} sqSize={28} />
          </div>

          <div className="cw-center">
            <RealmBoard realm="present" cfg={REALM_CFG.present} board={boards.present} sel={sel} moves={moves} lastMove={lastMove} onClick={handleClick} sqSize={46} />
            <div className="cw-captured">
              <div className="cw-captured-side cw-captured-w">{captured.white.length ? captured.white.map(p=>SYMBOLS[p]).join("") : "—"}</div>
              <div className="cw-captured-label">captured</div>
              <div className="cw-captured-side cw-captured-b">{captured.black.length ? captured.black.map(p=>SYMBOLS[p]).join("") : "—"}</div>
            </div>
          </div>

          <div className="cw-right-panel">
            <ChroniclePanel narrating={narrating || aiThinking} displayed={aiThinking ? aiTaunt : displayed} />
            <SagaScroll storyLog={storyLog} />
            <PieceLegend />
            <button onClick={reset} className="cw-reset-btn">↺ NEW CHRONICLE</button>
          </div>
        </main>
      </div>

      {/* ── Game Over Overlay ── */}
      {showOver && (
        <div className="cw-overlay">
          <div className="cw-overlay-box">
            <div className="cw-over-icon">
              {status === "checkmate" ? "☠" : "⚖"}
            </div>
            <div className="cw-over-title">
              {status === "checkmate" ? "THE WAR ENDS" : "ETERNAL STALEMATE"}
            </div>
            <div className="cw-over-msg">
              {status === "checkmate"
                ? `${turn === "white" ? "The Umbral Conclave" : "The Luminar Order"} claims dominion across all three realms of time!`
                : "Neither order can advance. The rivers of time stand frozen."}
            </div>
            {storyLog[0] && (
              <div className="cw-over-last">
                "{storyLog[0].t.slice(0, 160)}{storyLog[0].t.length > 160 ? "…" : ""}"
              </div>
            )}
            <div className="cw-over-actions">
              <button onClick={openChronicle} className="cw-chronicle-btn">
                📖 READ THE FULL CHRONICLE
              </button>
              <button onClick={reset} className="cw-reset-btn" style={{marginTop:10}}>
                ↺ FIGHT AGAIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Battle Chronicle Modal ── */}
      {showChronicle && (
        <div className="cw-overlay" onClick={() => setShowChronicle(false)}>
          <div className="cw-chronicle-box" onClick={e => e.stopPropagation()}>
            <div className="cw-chronicle-header">
              {chronicleLoading ? (
                <>
                  <div className="cw-chronicle-loading-title">⏳ The Grand Chronicler writes…</div>
                  <div className="cw-chronicle-loading-sub">Weaving {storyLog.length} verses into one eternal saga</div>
                </>
              ) : (
                <div className="cw-chronicle-title">{chronicleData?.title}</div>
              )}
            </div>
            <div className="cw-chronicle-body">
              {chronicleLoading
                ? <div className="cw-chronicle-spinner">✦ &nbsp; Ink flows across the pages of eternity… &nbsp; ✦</div>
                : chronicleData?.body?.split("\n\n").map((para, i) => (
                    <p key={i} className="cw-chronicle-para">{para}</p>
                  ))
              }
            </div>
            <div className="cw-chronicle-footer">
              <button onClick={() => { setShowChronicle(false); reset(); }} className="cw-chronicle-close">
                Close & Fight Again
              </button>
              {!chronicleLoading && (
                <button
                  onClick={() => navigator.clipboard?.writeText(`${chronicleData?.title}\n\n${chronicleData?.body}`).catch(()=>{})}
                  className="cw-chronicle-copy">
                  Copy Chronicle
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

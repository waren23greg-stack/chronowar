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
import {
  bootAudio, sfxMove, sfxCapture, sfxRealmTranscend,
  sfxCheck, sfxCheckmate, sfxGameStart, sfxPromotion,
  sfxAiThinking, updateMusicFromGame, setMasterVolume,
} from "./audio";
import {
  hashBoards, checkRepetition, isFatigued, tickFatigue,
  shouldResetClock, calcCP, getConvergenceWarnings,
  applyConvergenceRemovals, CROSS_REALM_BUDGET,
} from "./gameRules";
import RealmBoard from "./components/RealmBoard";
import ChroniclePanel, { SagaScroll, PieceLegend } from "./components/ChroniclePanel";
import LandingPage from "./components/LandingPage";
import Tutorial from "./components/Tutorial";
import ChronicleCard from "./components/ChronicleCard";
import MobileLayout from "./components/MobileLayout";
import { PointsHUD, loadStats, awardGameEnd, awardMoveEvent } from "./points.jsx";
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
  const [activeRealm, setActiveRealm] = useState("present");

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

  // ── Audio ──
  const [audioReady, setAudioReady] = useState(false);
  const [muted, setMuted]           = useState(false);
  const totalCaptures               = useRef(0);

  const ensureAudio = useCallback(() => {
    if (!audioReady) { bootAudio(); setAudioReady(true); }
  }, [audioReady]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMasterVolume(next ? 0 : 0.82);
  };
  const [showChronicle, setShowChronicle]         = useState(false);
  const [chronicleData, setChronicleData]         = useState(null);
  const [chronicleLoading, setChronicleLoading]   = useState(false);
  const [showCard, setShowCard]                   = useState(false);

  // Game stat trackers for the card
  const captureCount    = useRef(0);
  const crossRealmCount = useRef(0);
  const checkCount      = useRef(0);

  // ── Advanced Rules state ──
  const [fatigueMap, setFatigueMap]           = useState({});
  const [posHistory, setPosHistory]           = useState([]);
  const [clock50, setClock50]                 = useState(0);
  const [crossCount, setCrossCount]           = useState({ white: 0, black: 0 });
  const [drawReason, setDrawReason]           = useState(null);
  const [convergenceWarn, setConvergenceWarn] = useState([]);
  const [lastMoveByPiece, setLastMoveByPiece] = useState({});
  const fatigueRef    = useRef({});
  const posHistRef    = useRef([]);
  const clock50Ref    = useRef(0);
  const crossCountRef = useRef({ white: 0, black: 0 });
  const lmbpRef       = useRef({});
  useEffect(() => { fatigueRef.current    = fatigueMap; },    [fatigueMap]);
  useEffect(() => { posHistRef.current    = posHistory; },    [posHistory]);
  useEffect(() => { clock50Ref.current    = clock50; },       [clock50]);
  useEffect(() => { crossCountRef.current = crossCount; },    [crossCount]);
  useEffect(() => { lmbpRef.current       = lastMoveByPiece; }, [lastMoveByPiece]);

  // ── Game over overlay ──
  const [showOver, setShowOver]   = useState(false);

  // ── Responsive ──
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  const [screen, setScreen]         = useState("landing"); // "landing" | "game"
  const [showTutorial, setShowTutorial] = useState(false);

  // ── Points ──
  const [stats, setStats]         = useState(() => loadStats());
  const [lastAward, setLastAward] = useState(null);
  const awardFlash = (pts) => { setLastAward(pts); setTimeout(() => setLastAward(null), 1600); };

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

    const isCrossRealm = fromRealm !== toRealm;

    // ── Advanced Rules ──
    // Convergence removals first
    const { boards: nbClean, removed: convRemoved } =
      applyConvergenceRemovals(nb, currentMoveNum + 1, lmbpRef.current);
    const finalNb = convRemoved.length ? nbClean : nb;

    // Fatigue update
    const newFatigue = tickFatigue(fatigueRef.current, isCrossRealm, toRealm, toRow, toCol);
    setFatigueMap(newFatigue);

    // Cross-realm budget
    const side0 = isW(movePiece) ? "white" : "black";
    if (isCrossRealm) setCrossCount(prev => ({ ...prev, [side0]: prev[side0] + 1 }));

    // 50-move temporal clock
    const newClock = shouldResetClock(movePiece, capPiece, isCrossRealm) ? 0 : clock50Ref.current + 1;
    setClock50(newClock);

    // Position history (threefold)
    const hash = hashBoards(finalNb);
    const newPosHist = [...posHistRef.current, hash];
    setPosHistory(newPosHist);

    // LastMoveByPiece tracking
    const pieceKey = `${toRealm}_${toRow}_${toCol}`;
    const newLmbp = { ...lmbpRef.current, [pieceKey]: currentMoveNum + 1 };
    setLastMoveByPiece(newLmbp);

    // Audio ──
    if (capPiece) {
      totalCaptures.current += 1;
      captureCount.current  += 1;
      if (isCrossRealm) sfxRealmTranscend(); else sfxCapture();
    } else if (isCrossRealm) {
      sfxRealmTranscend();
    } else {
      sfxMove(false, false);
    }
    if (isCrossRealm) crossRealmCount.current += 1;

    if (capPiece)
      setCaptured(prev => ({ ...prev, [isW(capPiece) ? "white" : "black"]: [...prev[isW(capPiece) ? "white" : "black"], capPiece] }));

    const newTurn   = currentTurn === "white" ? "black" : "white";
    const num       = currentMoveNum + 1;
    const newCheck  = inCheck(nb, newTurn === "white");
    const hasLegal  = hasAnyLegal(nb, newTurn === "white");
    // Draw detection
    const isRepetition = checkRepetition(newPosHist);
    const isClockDraw  = newClock >= 50;
    const newStatus = !hasLegal
      ? (newCheck ? "checkmate" : "stalemate")
      : isRepetition ? "draw"
      : isClockDraw  ? "draw"
      : newCheck     ? "check"
      : "playing";
    if (isRepetition) setDrawReason("repetition");
    if (isClockDraw)  setDrawReason("clock-50");
    const cross = isCrossRealm;

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

    // ── Status audio ──
    if (newStatus === "checkmate" || newStatus === "stalemate" || newStatus === "draw") {
      setTimeout(() => sfxCheckmate(), 200);
      setTimeout(() => setShowOver(true), 1800);
      // Award game-end points
      const result = newStatus === "stalemate" ? "draw"
                   : (isW(movePiece) ? "white" : "black") === currentTurn ? "win" : "loss";
      const endStats = awardGameEnd(stats, { result, difficulty, moveCount: num, mode });
      const endGain = endStats.cp - stats.cp;
      setStats(endStats);
      if (endGain > 0) awardFlash(endGain);
    } else if (newStatus === "check") {
      sfxCheck();
      checkCount.current += 1;
    }
    if (promo) setTimeout(() => sfxPromotion(), 150);

    // ── Update music phase ──
    updateMusicFromGame(num, newStatus, totalCaptures.current);

    // ── Award move points ──
    const awardedStats = awardMoveEvent(stats, {
      captures: capPiece ? 1 : 0,
      crossRealm: isCrossRealm,
      check: newCheck,
      promotion: promo,
    });
    const gained =
      (capPiece ? 5 : 0) +
      (isCrossRealm ? 3 : 0) +
      (newCheck ? 8 : 0) +
      (promo ? 12 : 0);
    if (gained > 0) { setStats(awardedStats); awardFlash(gained); }

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
    sfxAiThinking();

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
    ensureAudio();
    setActiveRealm(realm);
    if (!audioReady && moveNum === 0) { bootAudio(); setAudioReady(true); sfxGameStart(); }
    if (status === "checkmate" || status === "stalemate") return;
    if (mode === "vs-ai" && turn === "black") return;
    const piece = boards[realm][row][col];

    if (sel) {
      const mv = moves.find(m => m.realm === realm && m.row === row && m.col === col);
      if (mv) {
        const isCross = sel.realm !== realm;
        // Cross-realm budget check
        if (isCross && crossCount[turn] >= CROSS_REALM_BUDGET) {
          setNarr(`The ${turn === "white" ? "Luminar Order" : "Umbral Conclave"} has exhausted their 18 cross-realm transcendences. No more realm crossings permitted.`);
          setSel(null); setMoves([]); return;
        }
        // Temporal fatigue check
        if (isCross && isFatigued(fatigueMap, sel.realm, sel.row, sel.col)) {
          setNarr(`This piece is temporally fatigued — it must rest 2 more turns before crossing realms again.`);
          setSel(null); setMoves([]); return;
        }
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
    totalCaptures.current   = 0;
    captureCount.current    = 0;
    crossRealmCount.current = 0;
    checkCount.current      = 0;
    setFatigueMap({}); setPosHistory([]); setClock50(0);
    setCrossCount({ white: 0, black: 0 }); setDrawReason(null);
    setConvergenceWarn([]); setLastMoveByPiece({});
    updateMusicFromGame(0, "playing", 0);
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

  if (screen === "landing") {
    return <LandingPage onPlay={() => setScreen("game")} />;
  }

  // ── Mobile layout ──
  if (isMobile) {
    return (
      <div className="cw-root" data-realm={activeRealm}>
        <MobileLayout
          boards={boards} sel={sel} moves={moves} lastMove={lastMove}
          turn={turn} status={status} moveNum={moveNum}
          aiThinking={aiThinking} aiTaunt={aiTaunt}
          narrating={narrating} displayed={displayed} storyLog={storyLog}
          stats={stats} lastAward={lastAward} captured={captured}
          activeRealm={activeRealm} setActiveRealm={setActiveRealm}
          handleClick={handleClick} reset={reset} openChronicle={openChronicle}
          mode={mode} difficulty={difficulty}
          setMode={setMode} setDifficulty={setDifficulty}
          muted={muted} toggleMute={toggleMute}
          setShowTutorial={setShowTutorial} setScreen={setScreen}
        />
        {showOver && (
          <div className="cw-overlay">
            <div className="cw-overlay-box" style={{ margin:"0 16px", padding:"28px 24px" }}>
              <div className="cw-over-title" style={{ fontSize:"1.3rem" }}>
                {status === "checkmate" ? "THE WAR ENDS" : "STALEMATE"}
              </div>
              <div className="cw-over-msg">
                {status === "checkmate"
                  ? `${turn === "white" ? "Umbral Conclave" : "Luminar Order"} claims dominion!`
                  : "The rivers of time stand frozen."}
              </div>
              {storyLog[0] && (
                <div className="cw-over-last" style={{ fontSize:".8rem" }}>
                  "{storyLog[0].t.slice(0,120)}{storyLog[0].t.length>120?"…":""}"
                </div>
              )}
              <div className="cw-over-actions">
                <button onClick={openChronicle} className="cw-chronicle-btn">READ THE FULL CHRONICLE</button>
                <button onClick={reset} className="cw-reset-btn" style={{marginTop:8}}>FIGHT AGAIN</button>
              </div>
            </div>
          </div>
        )}
        {showChronicle && (
          <div className="cw-overlay" onClick={() => setShowChronicle(false)}>
            <div className="cw-chronicle-box" style={{ margin:"12px", maxHeight:"90dvh" }} onClick={e=>e.stopPropagation()}>
              <div className="cw-chronicle-header">
                {chronicleLoading
                  ? <div className="cw-chronicle-loading-title">The Grand Chronicler writes…</div>
                  : <div className="cw-chronicle-title">{chronicleData?.title}</div>}
              </div>
              <div className="cw-chronicle-body">
                {chronicleLoading
                  ? <div className="cw-chronicle-spinner">Ink flows across the pages of eternity…</div>
                  : chronicleData?.body?.split("\n\n").map((p,i)=><p key={i} className="cw-chronicle-para">{p}</p>)}
              </div>
              <div className="cw-chronicle-footer">
                <button onClick={() => { setShowChronicle(false); reset(); }} className="cw-chronicle-close">Close</button>
                {!chronicleLoading && (
                  <button onClick={() => setShowCard(true)} className="cw-chronicle-btn" style={{ fontSize:".55rem", padding:"8px 14px", letterSpacing:"1px" }}>
                    CREATE CARD
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {showCard && chronicleData && (
          <ChronicleCard
            data={{ title:chronicleData.title, winner:turn==="white"?"Umbral Conclave":"Luminar Order",
              moveCount:moveNum, captures:captureCount.current, crossRealm:crossRealmCount.current,
              checks:checkCount.current, cpEarned:stats.cp, moments:storyLog.slice(0,5).map(e=>e.t) }}
            onClose={() => setShowCard(false)}
          />
        )}
        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      </div>
    );
  }

  return (
    <div className="cw-root" data-realm={activeRealm}>
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
            <button className={`cw-mute-btn ${muted ? "muted" : ""}`} onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
              {muted ? "🔇" : "🔊"}
            </button>
            <button className="cw-tutorial-btn" onClick={() => setShowTutorial(true)} title="How to Play">
              ? HOW TO PLAY
            </button>
            <button className="cw-home-btn" onClick={() => setScreen("landing")} title="Home">⌂</button>
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
            <PointsHUD stats={stats} lastAward={lastAward} />
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
              <button onClick={reset} className="cw-reset-btn" style={{marginTop:6}}>
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
                <>
                  <button
                    onClick={() => navigator.clipboard?.writeText(`${chronicleData?.title}\n\n${chronicleData?.body}`).catch(()=>{})}
                    className="cw-chronicle-copy">
                    Copy Chronicle
                  </button>
                  <button
                    onClick={() => setShowCard(true)}
                    className="cw-chronicle-btn"
                    style={{ fontSize: ".6rem", padding: "9px 18px", letterSpacing: "2px" }}>
                    🖼 CREATE SHARE CARD
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {showCard && chronicleData && (
        <ChronicleCard
          data={{
            title:      chronicleData.title,
            winner:     turn === "white" ? "Umbral Conclave" : "Luminar Order",
            moveCount:  moveNum,
            captures:   captureCount.current,
            crossRealm: crossRealmCount.current,
            checks:     checkCount.current,
            cpEarned:   stats.cp,
            moments:    storyLog.slice(0, 5).map(e => e.t),
          }}
          onClose={() => setShowCard(false)}
        />
      )}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
    </div>
  );
}

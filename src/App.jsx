// ============================================================
//  CHRONOWAR — Main App v2  (AI + Battle Chronicle)
// ============================================================
import { useState, useEffect, useRef, useCallback } from "react";
import {
  REALMS, REALM_CFG, SYMBOLS, LORE,
  isW, isB, pt, initBoards, legalMoves, applyMove,
  inCheck, hasAnyLegal, KING_FLANK_BUDGET,
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
import ProTour, { TOUR_CHALLENGES } from "./components/ProTour";
import { AuthModal, ProfileBar, getSession, getProfile, updateAccountStats, clearSession } from "./accounts.jsx";
import {
  PointsHUD, RankUpToast, PostGameReport,
  detectRankUp, getRank, POINTS,
  loadStats, awardGameEnd, awardMoveEvent,
} from "./points.jsx";
import "./App.css";
import ChronowarLogo from "./components/ChronowarLogo";

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

// ── King Flank Budget HUD ──────────────────────────────────────
function KingBudgetHUD({ kingFlankMoves, turn }) {
  const F = "'Cinzel', serif";
  const wUsed = kingFlankMoves.white, bUsed = kingFlankMoves.black;

  const PipRow = ({ used, label, color, isActive }) => {
    const left = KING_FLANK_BUDGET - used;
    const critical = left <= 3;
    const pipColor = critical ? (left <= 1 ? "#f44336" : "#ff9800") : color;
    return (
      <div style={{ marginBottom: 7 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:9, letterSpacing:1.5, fontFamily:F, textTransform:"uppercase",
            color: isActive ? color : "rgba(130,100,45,.45)", fontWeight: isActive ? 700 : 400 }}>
            {isActive ? "▶ " : ""}{label}
          </span>
          <span style={{ fontSize:11, fontFamily:F, fontWeight:700, color: pipColor }}>
            {left}/{KING_FLANK_BUDGET}
          </span>
        </div>
        <div style={{ display:"flex", gap:2 }}>
          {Array.from({ length: KING_FLANK_BUDGET }).map((_, i) => {
            const spent = i < used;
            const c = spent ? "rgba(80,55,20,.2)" : pipColor;
            return (
              <div key={i} style={{
                flex:1, height:8, borderRadius:2,
                background: c,
                border: spent ? "1px solid rgba(100,70,20,.15)" : `1px solid ${pipColor}55`,
                opacity: spent ? 0.3 : 1,
                transition: "all .35s",
                boxShadow: (!spent && i === used) ? `0 0 5px ${pipColor}80` : "none",
              }} />
            );
          })}
        </div>
        {critical && left > 0 && (
          <div style={{ fontSize:9, color:pipColor, marginTop:3, fontFamily:F, letterSpacing:.5 }}>
            ⚠ {left} move{left === 1 ? "" : "s"} remaining in flank realms
          </div>
        )}
        {left === 0 && (
          <div style={{ fontSize:9, color:"#f44336", marginTop:3, fontFamily:F, letterSpacing:.5 }}>
            ✕ King is bound — flank budget exhausted
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background:"rgba(5,2,14,.92)",
      border:"1px solid rgba(180,140,50,.2)",
      borderRadius:8, padding:"10px 12px",
    }}>
      <div style={{ fontSize:9, letterSpacing:3, color:"rgba(140,105,40,.55)",
        fontFamily:F, textTransform:"uppercase", marginBottom:9 }}>
        ♔ King Flank Budget
      </div>
      <PipRow used={wUsed} label="Luminar (White)" color="#c8a840" isActive={turn==="white"} />
      <PipRow used={bUsed} label="Umbral (Black)"  color="#9055cc" isActive={turn==="black"} />
      <div style={{ fontSize:9, color:"rgba(110,85,35,.38)", marginTop:5,
        fontFamily:F, lineHeight:1.6, letterSpacing:.4 }}>
        King moves in Past Echoes &amp; Fate's Shadow count toward the 13-move limit.
        At 0, the King is immovable in flank realms — temporal checkmate may follow.
      </div>
    </div>
  );
}

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
  const [kingFlankMoves, setKingFlankMoves]   = useState({ white: 0, black: 0 });
  const [temporalCheckmate, setTemporalCheckmate] = useState(false);
  const [drawReason, setDrawReason]           = useState(null);
  const [convergenceWarn, setConvergenceWarn] = useState([]);
  const [lastMoveByPiece, setLastMoveByPiece] = useState({});
  const fatigueRef    = useRef({});
  const posHistRef    = useRef([]);
  const clock50Ref    = useRef(0);
  const crossCountRef = useRef({ white: 0, black: 0 });
  const kingFlankRef  = useRef({ white: 0, black: 0 });
  const lmbpRef       = useRef({});
  useEffect(() => { fatigueRef.current    = fatigueMap; },     [fatigueMap]);
  useEffect(() => { posHistRef.current    = posHistory; },     [posHistory]);
  useEffect(() => { clock50Ref.current    = clock50; },        [clock50]);
  useEffect(() => { crossCountRef.current = crossCount; },     [crossCount]);
  useEffect(() => { kingFlankRef.current  = kingFlankMoves; }, [kingFlankMoves]);
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
  const [screen, setScreen]             = useState("landing"); // "landing"|"game"|"tour"
  const [showTutorial, setShowTutorial] = useState(false);

  // ── Accounts ──
  const [profile, setProfile]       = useState(() => {
    const sess = getSession();
    return sess ? getProfile(sess) : null;
  });
  const [showAuth, setShowAuth]     = useState(false);

  // Sync account stats on game end
  const syncAccountStats = (newStats) => {
    if (profile) {
      updateAccountStats(profile.username, newStats);
      setProfile(prev => prev ? { ...prev, stats: { ...prev.stats, ...newStats } } : null);
    }
  };

  // ── Pro Tour ──
  const [tourProgress, setTourProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cw_tour_v1") || "{}"); } catch { return {}; }
  });
  const [activeTourChallenge, setActiveTourChallenge] = useState(null);

  const startTourChallenge = (challenge) => {
    setActiveTourChallenge(challenge);
    setDifficulty(challenge.difficulty);
    reset();
    if (challenge.setup) {
      const custom = challenge.setup(initBoards());
      setBoards(custom);
    }
    setScreen("game");
  };

  const completeTourChallenge = (challengeId) => {
    const next = { ...tourProgress, [challengeId]: true };
    setTourProgress(next);
    try { localStorage.setItem("cw_tour_v1", JSON.stringify(next)); } catch {}
  };

  // ── Points ──
  const [stats, setStats]         = useState(() => loadStats());
  const [lastAward, setLastAward] = useState(null);
  const [rankUpData, setRankUpData] = useState(null);
  const [gameReport, setGameReport] = useState(null);
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);
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
    // Strip any "undefined" that crept into context from previous bugs
    const ctx = storyCtx.current
      .filter(s => typeof s === "string" && !s.includes("undefined") && s.length > 10)
      .slice(-3)
      .join(" ");
    const text = await generateNarration(info, ctx);
    // Sanitize API response — strip "undefined" if echoed back
    const cleanText = (text || "")
      .replace(/undefined/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    const fallback = `${LORE[info.piece] || "A warrior"}, ${
      info.side === "white" ? "champion of the Luminar Order" : "harbinger of the Umbral Conclave"
    }, moves through the ${info.trRealm || info.frRealm || "present"} realm.`;
    const final = (cleanText && cleanText.length > 20) ? cleanText : fallback;
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

    // ── King Flank Budget tracking ──
    const movingSide = isW(movePiece) ? "white" : "black";
    const isKingFlankMove = pt(movePiece) === "K" && (fromRealm === "past" || fromRealm === "future");
    const newKingFlank = isKingFlankMove
      ? { ...kingFlankRef.current, [movingSide]: kingFlankRef.current[movingSide] + 1 }
      : kingFlankRef.current;
    if (isKingFlankMove) setKingFlankMoves(newKingFlank);
    const kingBudget = {
      white: KING_FLANK_BUDGET - newKingFlank.white,
      black: KING_FLANK_BUDGET - newKingFlank.black,
    };

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

    // newTurn must be declared before the hash that includes it
    const newTurn   = currentTurn === "white" ? "black" : "white";

    // Position history (threefold) — include side-to-move in hash
    const hash = hashBoards(finalNb) + ":" + newTurn[0];
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

    const num       = currentMoveNum + 1;
    const newCheck  = inCheck(finalNb, newTurn === "white");  // ← was nb
    const hasLegal  = hasAnyLegal(finalNb, newTurn === "white", kingBudget);
    // Draw detection
    const isRepetition = checkRepetition(newPosHist);
    const isClockDraw  = newClock >= 50;
    // Temporal checkmate: King budget exhausted + no legal moves + not in traditional check
    const isTemporalMate = !hasLegal && !newCheck && kingBudget[newTurn] <= 0;
    if (isTemporalMate) setTemporalCheckmate(true);
    const newStatus = !hasLegal
      ? (newCheck || isTemporalMate ? "checkmate" : "stalemate")
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
    setBoards(finalNb);  // ← was nb — convergence removals now actually applied
    setTurn(newTurn);
    setMoveNum(num);
    setStatus(newStatus);
    doNarration(info);

    // ── Status audio ──
    // Snapshot stats at move start (fixes stale closure)
    let _ws = statsRef.current;

    if (newStatus === "checkmate" || newStatus === "stalemate" || newStatus === "draw") {
      setTimeout(() => sfxCheckmate(), 200);
      setTimeout(() => setShowOver(true), 1800);
      // Award game-end points
      const result = newStatus === "stalemate" ? "draw"
                   : (isW(movePiece) ? "white" : "black") === currentTurn ? "win" : "loss";
      const endStats = awardGameEnd(_ws, {
        result,
        difficulty: difficultyRef.current,
        moveCount: num, mode,
        gameStats: {
          captures:   captureCount.current,
          crossRealm: crossRealmCount.current,
          checks:     checkCount.current,
        },
      });
      const endGain = endStats.cp - _ws.cp;
      setStats(endStats);
      syncAccountStats(endStats);
      // Tour challenge completion
      if (activeTourChallenge && result === "win") {
        completeTourChallenge(activeTourChallenge.id);
        setActiveTourChallenge(null);
      }
      // Rank-up detection
      const _rankUp = detectRankUp(_ws.cp, endStats.cp);
      if (_rankUp) setTimeout(() => setRankUpData(_rankUp), 2400);
      // Store report for PostGameReport overlay
      setGameReport({
        result,
        difficulty: difficultyRef.current,
        moveCount: num,
        prevElo:   _ws.elo,
        newElo:    endStats.elo,
        eloDelta:  endStats.elo - _ws.elo,
        cpGained:  Math.max(0, endGain),
        rankBefore: getRank(_ws.cp),
        rankAfter:  getRank(endStats.cp),
        promoted:  !!_rankUp,
        captures:   captureCount.current,
        crossRealm: crossRealmCount.current,
        checks:     checkCount.current,
        temporalCheckmate: isTemporalMate,
      });
      // Use endStats as base for move-event awards below
      _ws = endStats;
    } else if (newStatus === "check") {
      sfxCheck();
      checkCount.current += 1;
    }
    if (promo) setTimeout(() => sfxPromotion(), 150);

    // ── Update music phase ──
    updateMusicFromGame(num, newStatus, totalCaptures.current);

    // ── Award move points (capture type-aware) ──
    const _capType = capPiece
      ? (pt(capPiece) === "Q" ? "queen" : pt(capPiece) === "R" ? "rook" : "regular")
      : "none";
    const awardedStats = awardMoveEvent(_ws, {
      captures:    capPiece ? 1 : 0,
      crossRealm:  isCrossRealm,
      check:       newCheck,
      promotion:   promo,
      captureType: _capType,
    });
    const gained =
      (capPiece ? (_capType==="queen" ? POINTS.captureQueen : _capType==="rook" ? POINTS.captureRook : POINTS.capture) : 0) +
      (isCrossRealm ? POINTS.crossRealm : 0) +
      (newCheck     ? POINTS.check      : 0) +
      (promo        ? POINTS.promotion  : 0);
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
      const _kb = { white: KING_FLANK_BUDGET - kingFlankRef.current.white, black: KING_FLANK_BUDGET - kingFlankRef.current.black };
      const m = difficultyRef.current === "easy" ? getEasyMove(b, _kb) : getBestMove(b, difficultyRef.current, _kb);
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
    if (status === "checkmate" || status === "stalemate" || status === "draw") return;
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
      const budget = { white: KING_FLANK_BUDGET - kingFlankMoves.white, black: KING_FLANK_BUDGET - kingFlankMoves.black };
      // King flank budget warning when selected with critically low budget
      if (pt(piece) === "K" && (realm === "past" || realm === "future")) {
        const left = budget[turn];
        if (left <= 0) {
          setNarr(`${turn === "white" ? "Monarch Auris the Eternal" : "Lich-Lord Vex'rath"} has exhausted all 13 temporal movements in the flank realms. The King is bound — their fate sealed by the laws of time.`);
          return;
        }
        if (left <= 3) {
          setNarr(`⚠ ${turn === "white" ? "Monarch Auris" : "Lich-Lord Vex'rath"} has only ${left} flank move${left === 1 ? "" : "s"} remaining in the temporal realms. Use them wisely — the clock of eternity runs short.`);
        }
      }
      setSel({ realm, row, col });
      setMoves(legalMoves(boards, realm, row, col, budget));
    }
  };

  // ── Open Battle Chronicle ──
  const openChronicle = async () => {
    setShowChronicle(true);
    setChronicleLoading(true);
    const winner = status === "checkmate" ? (turn === "white" ? "black" : "white") : "none";
    const data = await generateBattleChronicle(storyLogRef.current, winner, moveNum, { captures: captureCount.current, crossRealm: crossRealmCount.current, checks: checkCount.current });
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
    setKingFlankMoves({ white: 0, black: 0 }); kingFlankRef.current = { white: 0, black: 0 };
    setTemporalCheckmate(false);
    setConvergenceWarn([]); setLastMoveByPiece({});
    updateMusicFromGame(0, "playing", 0);
    setNarr("A new war begins. The armies assume their eternal positions once more — let the chronicles be written anew…");
    setNarrating(false); setAiThinking(false); setAiTaunt("");
    setShowOver(false); setShowChronicle(false); setChronicleData(null);
    setGameReport(null); setRankUpData(null);
  };

  const wTurn = turn === "white";
  const wBudgetLeft = KING_FLANK_BUDGET - kingFlankMoves.white;
  const bBudgetLeft = KING_FLANK_BUDGET - kingFlankMoves.black;
  const currentBudgetLeft = wTurn ? wBudgetLeft : bBudgetLeft;
  const budgetWarning = currentBudgetLeft <= 3 && currentBudgetLeft > 0 && status === "playing";

  const statusLabel =
    status === "checkmate" && temporalCheckmate
                           ? "⏳ TEMPORAL CHECKMATE!" :
    status === "checkmate" ? "☠ CHECKMATE!" :
    status === "check"     ? "⚠ CHECK!" :
    status === "stalemate" ? "⚖ STALEMATE" :
    status === "draw"      ? `⚖ DRAW${drawReason === "repetition" ? " — REPETITION" : drawReason === "clock-50" ? " — 50 MOVES" : ""}` :
    aiThinking             ? aiTaunt || "…" :
    budgetWarning          ? `⚠ KING: ${currentBudgetLeft} FLANK MOVE${currentBudgetLeft === 1 ? "" : "S"} LEFT` :
    `Move ${moveNum}`;

  if (screen === "landing") {
    return <LandingPage onPlay={() => setScreen("game")} onTour={() => setScreen("tour")} />;
  }

  if (screen === "tour") {
    return <ProTour tourProgress={tourProgress} onStartChallenge={startTourChallenge} onBack={() => setScreen("game")} />;
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
          ensureAudio={ensureAudio}
          setShowTutorial={setShowTutorial} setScreen={setScreen}
        />
        {showOver && (
          <PostGameReport
            reportData={gameReport}
            lastNarr={storyLog[0]?.t}
            onNewGame={reset}
            onChronicle={openChronicle}
          />
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
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14 }}>
            <ChronowarLogo size={48} showText={false} animate={false} />
            <div>
              <h1 className="cw-title">CHRONOWAR</h1>
              <div className="cw-subtitle">THE CHRONICLES OF THREE REALMS</div>
            </div>
          </div>

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
            <button className="cw-tutorial-btn" onClick={() => setScreen("tour")} title="Pro Tour">
              ⚔ PRO TOUR
            </button>
            <button className={`cw-mute-btn ${muted ? "muted" : ""}`} onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
              {muted ? "🔇" : "🔊"}
            </button>
            <button className="cw-tutorial-btn" onClick={() => setShowTutorial(true)} title="How to Play">
              ? HOW TO PLAY
            </button>
            <button className="cw-home-btn" onClick={() => setScreen("landing")} title="Home">⌂</button>
            <ProfileBar profile={profile} onLogout={() => { clearSession(); setProfile(null); }} onShowAuth={() => setShowAuth(true)} />
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

        {/* ── Tour Challenge Banner ── */}
        {activeTourChallenge && (
          <div style={{
            background: "rgba(180,130,30,.15)", borderBottom: "1px solid rgba(180,130,30,.25)",
            padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
            fontFamily: "'Cinzel', serif",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: ".42rem", letterSpacing: "4px", color: "rgba(130,90,20,.6)" }}>PRO TOUR · CHALLENGE {activeTourChallenge.num}</span>
              <span style={{ fontSize: ".62rem", color: "#2a1004", letterSpacing: "2px", fontWeight: 700 }}>{activeTourChallenge.title}</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: ".42rem", color: "rgba(130,90,20,.55)", letterSpacing: "2px" }}>+{activeTourChallenge.cpReward} CP on win</span>
              <button onClick={() => { setActiveTourChallenge(null); reset(); }} style={{
                background: "rgba(0,0,0,.1)", border: "1px solid rgba(100,70,20,.2)",
                borderRadius: 5, padding: "3px 10px", cursor: "pointer",
                fontFamily: "'Cinzel', serif", fontSize: ".4rem", letterSpacing: "2px",
                color: "rgba(80,55,20,.6)",
              }}>ABANDON</button>
            </div>
          </div>
        )}

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
            <KingBudgetHUD kingFlankMoves={kingFlankMoves} turn={turn} />
            <ChroniclePanel narrating={narrating || aiThinking} displayed={aiThinking ? aiTaunt : displayed} />
            <SagaScroll storyLog={storyLog} />
            <PieceLegend />
            <button onClick={reset} className="cw-reset-btn">↺ NEW CHRONICLE</button>
          </div>
        </main>
      </div>

      {/* ── Game Over — Post-Game Report ── */}
      {showOver && (
        <PostGameReport
          reportData={gameReport}
          lastNarr={storyLog[0]?.t}
          onNewGame={reset}
          onChronicle={openChronicle}
        />
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
      {showAuth && <AuthModal onLogin={(p) => { setProfile(p); setShowAuth(false); }} onClose={() => setShowAuth(false)} />}
      <RankUpToast rankUpData={rankUpData} onDismiss={() => setRankUpData(null)} />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  RealmBoard, 
  ChroniclePanel, 
  HistoryRewritePanel, 
  AuthModal, 
  ProfileBar, 
  AIChallengeScreen, 
  Tutorial, 
  PostGameReport, 
  RankUpToast,
  ChronowarLogo,
  PointsHUD,
  KingBudgetHUD
} from "./components"; // Adjust path if your components are in the same folder or subfolder
import { temporalEngine } from "./temporalEngine"; // Adjust path if needed

const REALMS = {
  past: { name: "The Past (Epoch I)" },
  present: { name: "The Present (Epoch II)" },
  future: { name: "The Future (Epoch III)" }
};

const SYMBOLS = {
  P: "♟", N: "♞", B: "♝", R: "♜", Q: "♛", K: "♚",
  p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔"
};

const STARS = Array.from({ length: 40 }).map(() => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  sz: Math.random() * 2 + 1,
  dur: Math.random() * 3 + 2,
  del: Math.random() * 2
}));

export default function App() {
  const [activeRealm, setActiveRealm] = useState("present");
  const [screen, setScreen] = useState("playing"); // landing, tour, playing
  const [mode, setMode] = useState("vs-ai");
  const [difficulty, setDifficulty] = useState("medium");
  const [wTurn, setWTurn] = useState(true);
  const [status, setStatus] = useState("playing");
  const [statusLabel, setStatusLabel] = useState("Battle Commenced");
  
  const [boards, setBoards] = useState({
    past: temporalEngine.getInitialBoard("past"),
    present: temporalEngine.getInitialBoard("present"),
    future: temporalEngine.getInitialBoard("future")
  });
  
  const [sel, setSel] = useState(null);
  const [moves, setMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [captured, setCaptured] = useState({ white: [], black: [] });
  const [storyLog, setStoryLog] = useState([]);
  const [turn, setTurn] = useState(1);
  const [kingFlankMoves, setKingFlankMoves] = useState({ white: 0, black: 0 });

  const [profile, setProfile] = useState(null);
  const [muted, setMuted] = useState(false);
  const [isRewritePanelOpen, setIsRewritePanelOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showChronicle, setShowChronicle] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [gameReport, setGameReport] = useState(null);
  const [rankUpData, setRankUpData] = useState(null);
  
  const [chronicleData, setChronicleData] = useState(null);
  const [chronicleLoading, setChronicleLoading] = useState(false);
  const [lastAward, setLastAward] = useState(null);
  const [stats, setStats] = useState({ cp: 100, wins: 0, losses: 0 });
  const [displayed, setDisplayed] = useState("The timeline fractures. Choose your initial move across the temporal epochs.");
  const [narrating, setNarrating] = useState(false);

  // Audio / Helper handlers
  const toggleMute = () => setMuted(!muted);
  const ensureAudio = () => {};
  const clearSession = () => localStorage.removeItem("chronowar_session");
  const getProfile = () => ({ username: "Chronomancer", rank: "Adept" });

  const handleClick = (realmKey, r, c) => {
    ensureAudio();
    if (status !== "playing") return;

    if (!sel) {
      const piece = boards[realmKey][r][c];
      if (!piece) return;
      const isWhitePiece = piece === piece.toUpperCase();
      if (isWhitePiece !== wTurn) return;

      setSel({ realm: realmKey, r, c });
      setMoves(temporalEngine.getLegalMoves(boards, realmKey, r, c));
    } else {
      if (sel.realm === realmKey && sel.r === r && sel.c === c) {
        setSel(null);
        setMoves([]);
        return;
      }

      const isValid = moves.some(m => m.realm === realmKey && m.r === r && m.c === c);
      if (isValid) {
        executeMove(sel, { realm: realmKey, r, c });
      } else {
        setSel(null);
        setMoves([]);
      }
    }
  };

  const executeMove = (from, to) => {
    const result = temporalEngine.applyMove(boards, from, to);
    if (!result.success) return;

    setBoards(result.newBoards);
    setLastMove({ fRealm: from.realm, fr: from.r, fc: from.c, tRealm: to.realm, tr: to.r, tc: to.c });
    setCaptured(result.captured);
    setStoryLog(prev => [{ n: prev.length + 1, t: result.narrative }, ...prev]);
    setDisplayed(result.narrative);

    setSel(null);
    setMoves([]);
    setWTurn(!wTurn);
    setTurn(t => t + 1);
  };

  const openChronicle = () => {
    setShowChronicle(true);
    setChronicleLoading(true);
    setTimeout(() => {
      setChronicleData({ saga: "The chronicles record a fierce struggle across past, present, and future epochs." });
      setChronicleLoading(false);
    }, 1000);
  };

  const executeTimelineRewrite = (branchId) => {
    setIsRewritePanelOpen(false);
    setDisplayed(`Timeline successfully branched to reality cluster #${branchId}.`);
  };

  const beginChallenge = (config) => {
    setShowChallenge(false);
    setStatus("playing");
    setStatusLabel(`Challenge Started: ${config.title || "Custom Trial"}`);
  };

  const reset = () => {
    setBoards({
      past: temporalEngine.getInitialBoard("past"),
      present: temporalEngine.getInitialBoard("present"),
      future: temporalEngine.getInitialBoard("future")
    });
    setWTurn(true);
    setStatus("playing");
    setStatusLabel("New Timeline Initialized");
    setStoryLog([]);
    setSel(null);
    setMoves([]);
  };

  const globalTimeline = [{ id: 1, name: "Alpha Timeline", active: true }];

  return (
    <div className="cw-root" data-realm={activeRealm}>
      {/* Background Starfield */}
      <div className="cw-stars">
        {STARS.map((s, i) => (
          <div key={i} className="cw-star" style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.sz}px`, height: `${s.sz}px`,
            animationDuration: `${s.dur}s`, animationDelay: `${s.del}s`
          }} />
        ))}
      </div>

      {/* Top Navigation / Header */}
      <header className="cw-header flex justify-between items-center p-4 bg-black/60 border-b border-amber-600/30">
        <div className="flex items-center gap-4">
          <ChronowarLogo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScreen("landing")}
              className="px-3 py-1 bg-amber-950/40 border border-amber-600/40 rounded text-amber-200 text-xs hover:bg-amber-900/50 transition"
            >
              Lobby
            </button>
            <button
              onClick={() => setScreen("tour")}
              className="px-3 py-1 bg-amber-950/40 border border-amber-600/40 rounded text-amber-200 text-xs hover:bg-amber-900/50 transition"
            >
              Pro Tour
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              className="px-3 py-1 bg-amber-950/40 border border-amber-600/40 rounded text-amber-200 text-xs hover:bg-amber-900/50 transition"
            >
              Codex
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <PointsHUD stats={stats} lastAward={lastAward} />
          {profile ? (
            <ProfileBar profile={profile} onLogout={() => { clearSession(); setProfile(null); }} />
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="px-3 py-1 bg-amber-600/80 hover:bg-amber-500 text-black font-bold text-xs rounded transition"
            >
              Sign In
            </button>
          )}
          <button
            onClick={toggleMute}
            className="p-2 bg-black/40 border border-amber-600/30 rounded text-amber-300 text-xs hover:bg-amber-950/40 transition"
            title={muted ? "Unmute Audio" : "Mute Audio"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          {status === "playing" && (
            <button
              onClick={() => setIsRewritePanelOpen(true)}
              className="px-3 py-1 bg-purple-950/60 border border-purple-500/60 text-purple-200 rounded text-xs hover:bg-purple-900/60 transition shadow-[0_0_10px_rgba(168,85,247,0.3)]"
            >
              ⚡ Shatter Timeline
            </button>
          )}
        </div>
      </header>

      {/* Main Game Arena */}
      <div className="cw-main-grid p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Sidebar */}
        <div className="cw-sidebar-left flex flex-col gap-4">
          <div className="cw-card p-4 rounded-lg bg-black/60 border border-amber-600/30">
            <h3 className="text-amber-400 font-cinzel text-sm mb-3 tracking-widest uppercase">Match Parameters</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-amber-200/70 block mb-1">Game Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-black/80 border border-amber-600/40 rounded px-2 py-1 text-xs text-amber-100"
                >
                  <option value="vs-ai">Versus AI</option>
                  <option value="vs-player">Local PvP</option>
                </select>
              </div>
              {mode === "vs-ai" && (
                <div>
                  <label className="text-xs text-amber-200/70 block mb-1">AI Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-black/80 border border-amber-600/40 rounded px-2 py-1 text-xs text-amber-100"
                  >
                    <option value="easy">Easy (Lich-Lord Vex'rath)</option>
                    <option value="medium">Medium (Void Empress)</option>
                    <option value="hard">Hard (Master Timeline)</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={reset}
                  className="flex-1 py-1.5 bg-amber-900/40 hover:bg-amber-800/50 border border-amber-600/50 rounded text-amber-200 text-xs font-cinzel transition"
                >
                  New Game
                </button>
                <button
                  onClick={() => setShowChallenge(true)}
                  className="flex-1 py-1.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/50 rounded text-purple-200 text-xs font-cinzel transition"
                >
                  AI Challenge
                </button>
              </div>
            </div>
          </div>

          <KingBudgetHUD kingFlankMoves={kingFlankMoves} turn={turn} />

          {/* Captured Pieces Panel */}
          <div className="cw-card p-4 rounded-lg bg-black/60 border border-amber-600/30">
            <h3 className="text-amber-400 font-cinzel text-sm mb-2 tracking-widest uppercase">Captured Relics</h3>
            <div className="flex flex-col gap-2 text-xs">
              <div>
                <span className="text-amber-300/70">Luminar Lost:</span>
                <div className="flex flex-wrap gap-1 mt-1 min-h-[24px]">
                  {captured.white.map((p, i) => (
                    <span key={i} className="text-amber-200 px-1 bg-amber-950/40 border border-amber-600/30 rounded">{SYMBOLS[p] || p}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-purple-300/70">Umbral Lost:</span>
                <div className="flex flex-wrap gap-1 mt-1 min-h-[24px]">
                  {captured.black.map((p, i) => (
                    <span key={i} className="text-purple-200 px-1 bg-purple-950/40 border border-purple-600/30 rounded">{SYMBOLS[p] || p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Realm Boards */}
        <div className="cw-center-stage lg:col-span-2 flex flex-col gap-6 items-center">
          <div className="w-full max-w-4xl flex justify-between items-center bg-black/80 border border-amber-600/40 px-4 py-2 rounded-lg">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${wTurn ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]" : "bg-purple-500 shadow-[0_0_8px_#a855f7]"}`} />
              <span className="text-amber-100 font-cinzel text-sm font-bold">
                {wTurn ? "Luminar Order's Turn" : "Umbral Conclave's Turn"}
              </span>
            </div>
            <div className="text-amber-300 font-cinzel text-sm tracking-wider font-semibold">
              {statusLabel}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {["past", "present", "future"].map((realmKey) => (
              <div
                key={realmKey}
                onClick={() => setActiveRealm(realmKey)}
                className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
                  activeRealm === realmKey
                    ? "border-amber-400 bg-amber-950/20 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                    : "border-amber-600/20 bg-black/50 hover:border-amber-600/40"
                }`}
              >
                <div className="text-center font-cinzel text-xs text-amber-300 mb-2 uppercase tracking-widest">
                  {REALMS[realmKey]?.name || realmKey}
                </div>
                <RealmBoard
                  realm={realmKey}
                  board={boards[realmKey]}
                  sel={sel && sel.realm === realmKey ? sel : null}
                  moves={moves.filter(m => m.realm === realmKey)}
                  lastMove={lastMove && lastMove.tRealm === realmKey ? lastMove : null}
                  onSquareClick={(r, c) => handleClick(realmKey, r, c)}
                />
              </div>
            ))}
          </div>

          <div className="w-full bg-black/70 border border-amber-600/30 p-4 rounded-lg">
            <div className="text-xs font-cinzel text-amber-400/70 uppercase tracking-widest mb-1">Chronicle Narrative</div>
            <p className="text-amber-100 font-serif text-sm italic min-h-[40px]">
              {displayed}
              {narrating && <span className="animate-pulse">▊</span>}
            </p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="cw-sidebar-right flex flex-col gap-4">
          <div className="cw-card p-4 rounded-lg bg-black/60 border border-amber-600/30 flex-1 flex flex-col">
            <h3 className="text-amber-400 font-cinzel text-sm mb-3 tracking-widest uppercase">Chronicle Log</h3>
            <div className="flex-1 overflow-y-auto max-h-[350px] flex flex-col gap-2 text-xs font-serif text-amber-200/80 pr-1">
              {storyLog.length === 0 ? (
                <div className="text-amber-500/50 italic">No movements recorded in this timeline yet...</div>
              ) : (
                storyLog.map((entry, idx) => (
                  <div key={idx} className="border-b border-amber-600/10 pb-2">
                    <span className="text-amber-400 font-bold">#{entry.n}:</span> {entry.t}
                  </div>
                ))
              )}
            </div>
            <button
              onClick={openChronicle}
              className="mt-4 w-full py-2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 font-cinzel text-xs font-bold rounded border border-amber-500/40 shadow transition"
            >
              Generate Battle Saga
            </button>
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      {isRewritePanelOpen && (
        <HistoryRewritePanel
          timeline={globalTimeline}
          currentCP={stats.cp}
          onRewrite={executeTimelineRewrite}
          onClose={() => setIsRewritePanelOpen(false)}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={(sess) => {
            const prof = getProfile(sess);
            setProfile(prof);
            setShowAuth(false);
          }}
        />
      )}

      {showChallenge && (
        <AIChallengeScreen
          onClose={() => setShowChallenge(false)}
          onStart={beginChallenge}
        />
      )}

      {showChronicle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-amber-600/60 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ChroniclePanel data={chronicleData} loading={chronicleLoading} onClose={() => setShowChronicle(false)} />
          </div>
        </div>
      )}

      {showTutorial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-amber-600/60 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <Tutorial onClose={() => setShowTutorial(false)} />
          </div>
        </div>
      )}

      {gameReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-amber-600/60 rounded-xl p-6 max-w-xl w-full">
            <PostGameReport report={gameReport} onClose={() => setGameReport(null)} />
          </div>
        </div>
      )}

      {rankUpData && (
        <RankUpToast rankUp={rankUpData} onClose={() => setRankUpData(null)} />
      )}
    </div>
  );
}

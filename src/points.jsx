// ============================================================
//  CHRONOWAR — Points, ELO & Ranking System v3
//  Chess.com-grade: Glicko K-decay · Per-diff tracking ·
//  Rank-up toast · Post-game report card · Live HUD
// ============================================================
import { useState, useEffect } from "react";

const KEY = "cw_stats_v3";

// ── Rank tiers ──────────────────────────────────────────────
export const RANK_TIERS = [
  { name: "Timewarden",    min: 0,    max: 199,      color: "#8a7255", icon: "🛡" },
  { name: "Chronorider",   min: 200,  max: 499,      color: "#80a040", icon: "🏇" },
  { name: "Realm Knight",  min: 500,  max: 999,      color: "#5599cc", icon: "⚔" },
  { name: "Sage of Ages",  min: 1000, max: 1999,     color: "#cc9922", icon: "✦" },
  { name: "Phase Walker",  min: 2000, max: 3999,     color: "#aa44ee", icon: "◈" },
  { name: "Time Sovereign",min: 4000, max: 7999,     color: "#ee8822", icon: "♛" },
  { name: "Eternal Lord",  min: 8000, max: Infinity, color: "#ff4488", icon: "♔" },
];

// ── Storage ──────────────────────────────────────────────────
export function loadStats() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultStats(), ...JSON.parse(raw) };
  } catch {}
  return defaultStats();
}

export function saveStats(stats) {
  try { localStorage.setItem(KEY, JSON.stringify(stats)); } catch {}
}

function defaultStats() {
  return {
    cp: 0,
    gamesPlayed: 0,
    wins: 0, losses: 0, draws: 0,
    elo: 1000,
    totalCaptures: 0, totalCrossRealm: 0, totalChecks: 0, totalPromotions: 0,
    fastestWin: null, longestGame: 0,
    streak: 0, bestStreak: 0,
    highestElo: 1000,
    winsPerDiff:   { easy: 0, medium: 0, hard: 0 },
    lossesPerDiff: { easy: 0, medium: 0, hard: 0 },
    recentGames: [],  // last 10
  };
}

// ── Points table ──────────────────────────────────────────────
export const POINTS = {
  // Move events
  capture:         5,
  captureRook:    12,
  captureQueen:   22,
  crossRealm:      8,
  check:          10,
  promotion:      15,
  brilliant_game: 30,

  // Win rewards
  win_easy:       30,
  win_medium:     65,
  win_hard:      130,
  win_2player:    45,
  fast_win:       35,       // win ≤15 moves bonus
  streak_bonus:   20,       // every 3-win streak

  // Draw outcomes (varies by difficulty)
  draw_easy:     -12,       // draw vs easy = bad
  draw_medium:    15,       // respectable
  draw_hard:      40,       // excellent
  draw_2player:   10,

  // Loss penalties
  loss_easy:     -20,       // should beat easy
  loss_medium:   -10,       // learning experience
  loss_hard:      +5,       // noble loss
  loss_2player:  -8,

  // Resign / quit penalty
  resign:        -35,
  resign_early:  -55,       // quit before move 10
};

// ── AI Personalities ───────────────────────────────────────────
export const AI_PERSONA = {
  easy: {
    name:     "The Apprentice",
    faction:  "Shade of the Fallen",
    icon:     "🌑",
    color:    "#7a8a9a",
    eloRating: 900,
    thinking: [
      "The Apprentice stirs in the shadows…",
      "An uncertain hand moves across time…",
      "The Shade considers its next step…",
    ],
    opening: [
      "The war begins. Even an apprentice can surprise you.",
      "I have studied the old chronicles. Let us write a new one.",
      "Do not underestimate the shadows.",
    ],
    losing: [
      "You fight with grace. The chronicles will remember this.",
      "My pieces fall, but the war teaches me still.",
      "A worthy demonstration. I shall study my defeat.",
    ],
    winning: [
      "Perhaps the apprentice has learned something after all.",
      "The timelines bend — even veterans can be humbled.",
    ],
    check: [
      "Your King trembles. Yield.",
      "The shadows close in around your throne.",
      "A warning — heed it.",
    ],
    onResign: "The Shade watches you retreat. Learn from this. The realms demand more.",
    description: "A novice spirit learning the dark arts. Forgiving errors, slow to punish.",
  },

  medium: {
    name:     "Void Empress Nythera",
    faction:  "Harbinger of the Conclave",
    icon:     "♛",
    color:    "#9030cc",
    eloRating: 1250,
    thinking: [
      "Void Empress Nythera reads the threads of fate…",
      "Nythera's void-sight pierces the veil of time…",
      "The Empress calculates across three timelines…",
    ],
    opening: [
      "Monarch Auris. Your throne is borrowed time.",
      "Three realms, three fronts, one inevitable outcome. Begin.",
      "The chronicles already know how this ends. Do you?",
      "I have watched a thousand wars. This one is mine.",
    ],
    losing: [
      "Unexpected. The void recalculates.",
      "You have disrupted my convergence. I am… intrigued.",
      "A warrior worth remembering. Do not mistake this for mercy.",
    ],
    winning: [
      "Your Past is ashes. Your Present, rubble. Your Future — mine.",
      "The void does not forgive hesitation.",
      "Kneel before the Umbral Conclave. Your saga is over.",
    ],
    check: [
      "CHECK. Feel the void close around your King.",
      "Your King runs. There is nowhere left.",
      "Nythera whispers — your King has no escape.",
    ],
    onResign: "Running already? The Void Empress expected more. Your name will be forgotten in the chronicles — if it was ever written at all.",
    description: "A cunning strategist who punishes every mistake. Dangerous in all three realms.",
  },

  hard: {
    name:     "Lich-Lord Vex'rath",
    faction:  "Eternal Sovereign of the Umbral Conclave",
    icon:     "☠",
    color:    "#cc2020",
    eloRating: 1600,
    thinking: [
      "Lich-Lord Vex'rath peers across all timelines simultaneously…",
      "The Lich-Lord has played this war ten thousand times…",
      "Vex'rath sees not your move — but your next twelve…",
      "The eternal sovereign calculates your obliteration…",
    ],
    opening: [
      "I have ended civilizations in the time it takes you to consider a move.",
      "The Luminar Order. How quaint. How doomed.",
      "Every piece you move, I have already countered in seventeen possible futures.",
      "I have waited centuries for a worthy challenger. I doubt you are one.",
    ],
    losing: [
      "…Impossible. The timelines do not show this outcome.",
      "You have achieved what no mortal has in three hundred years. I am angered.",
      "This is not over. No war against Vex'rath is ever truly over.",
    ],
    winning: [
      "As the stars ordained. As the void always knew.",
      "CHECKMATE. The Luminar Order is extinguished. The eternal war is mine.",
      "Pathetic. Your King weeps alone across three abandoned realms.",
    ],
    check: [
      "CHECK. Your King is already dead — it simply hasn't been told.",
      "The trap was set twelve moves ago. You are only now realizing.",
      "Feel that? That is inevitability.",
      "Run, little King. Every square leads to darkness.",
    ],
    onResign: "COWARD. Ten thousand years of war and you cannot stomach defeat? The chronicles will record your shame for eternity.",
    description: "An ancient, merciless intelligence. Masters all three realms simultaneously. Shows no mercy.",
  },
};

// ── Rank helpers ──────────────────────────────────────────────
export function getRank(cp) {
  let rank = RANK_TIERS[0];
  for (const t of RANK_TIERS) { if (cp >= t.min) rank = t; }
  return rank;
}

export function getNextRank(cp) {
  for (const t of RANK_TIERS) { if (cp < t.min) return t; }
  return null;
}

export function getProgressToNext(cp) {
  const rank = getRank(cp);
  const next = getNextRank(cp);
  if (!next) return 1;
  return Math.min((cp - rank.min) / (next.min - rank.min), 1);
}

export function detectRankUp(prevCp, newCp) {
  const a = getRank(prevCp), b = getRank(newCp);
  return a.name !== b.name ? { from: a, to: b } : null;
}

// ── ELO — Glicko-style K-factor decay ─────────────────────────
function kFactor(games) {
  if (games < 20) return 40;
  if (games < 80) return 20;
  return 10;
}

export function calcElo(playerElo, opponentElo, result, games = 30) {
  const K  = kFactor(games);
  const E  = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const d  = Math.round(K * (result - E));
  return { newElo: Math.max(400, playerElo + d), delta: d };
}

export const AI_ELO = { easy: 900, medium: 1200, hard: 1500 };

// ── Accuracy heuristic ────────────────────────────────────────
function computeAccuracy({ captures = 0, crossRealm = 0, checks = 0, promotions = 0, totalMoves = 1, result }) {
  let s = 52;
  s += Math.min(22, (captures   / totalMoves) * 75);
  s += Math.min(12, (crossRealm / totalMoves) * 60);
  s += Math.min(8,  (checks     / totalMoves) * 55);
  s += promotions * 3;
  if (result === "win")  s += 8;
  if (result === "loss") s -= 8;
  return Math.round(Math.min(100, Math.max(0, s)));
}

function classifyAccuracy(pct) {
  if (pct >= 92) return { label: "Brilliant",  color: "#00bcd4", glyph: "💎" };
  if (pct >= 80) return { label: "Excellent",  color: "#4caf50", glyph: "✨" };
  if (pct >= 68) return { label: "Good",       color: "#8bc34a", glyph: "👍" };
  if (pct >= 55) return { label: "Fair",       color: "#ffc107", glyph: "⚡" };
  if (pct >= 42) return { label: "Inaccurate", color: "#ff9800", glyph: "⚠" };
  return             { label: "Blundering", color: "#f44336", glyph: "💀" };
}

// ── Award game end ─────────────────────────────────────────────
export function awardGameEnd(stats, { result, difficulty, moveCount, mode, gameStats = {} }) {
  const s = {
    ...defaultStats(), ...stats,
    winsPerDiff:   { easy:0,medium:0,hard:0, ...(stats.winsPerDiff   || {}) },
    lossesPerDiff: { easy:0,medium:0,hard:0, ...(stats.lossesPerDiff || {}) },
    recentGames:   stats.recentGames || [],
    highestElo:    stats.highestElo  || stats.elo,
    totalPromotions: stats.totalPromotions || 0,
  };
  s.gamesPlayed += 1;

  const eloRes = calcElo(s.elo, AI_ELO[difficulty] || 1200, result === "win" ? 1 : result === "draw" ? 0.5 : 0, s.gamesPlayed);
  const accuracy = computeAccuracy({ ...gameStats, totalMoves: moveCount, result });

  let cpGained = 0;
  if (result === "win") {
    s.wins += 1;
    s.streak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.streak);
    if (s.winsPerDiff[difficulty] !== undefined) s.winsPerDiff[difficulty]++;
    const winKey = mode === "vs-ai" ? `win_${difficulty}` : "win_2player";
    cpGained += POINTS[winKey] || POINTS.win_medium;
    if (moveCount <= 15) cpGained += POINTS.fast_win;
    if (moveCount > s.longestGame) s.longestGame = moveCount;
    if (!s.fastestWin || moveCount < s.fastestWin) s.fastestWin = moveCount;
    if (s.streak > 0 && s.streak % 3 === 0) cpGained += POINTS.streak_bonus;
    if ((gameStats.blunders || 0) === 0 && moveCount > 4) cpGained += POINTS.brilliant_game;
    if (mode === "vs-ai") { s.elo = eloRes.newElo; }
  } else if (result === "draw") {
    s.draws += 1;
    s.streak = 0;
    cpGained += POINTS.draw;
    if (mode === "vs-ai") s.elo = eloRes.newElo;
  } else {
    s.losses += 1;
    s.streak = 0;
    cpGained += POINTS.loss;
    if (s.lossesPerDiff[difficulty] !== undefined) s.lossesPerDiff[difficulty]++;
    if (mode === "vs-ai") s.elo = eloRes.newElo;
  }

  s.cp += cpGained;
  s.highestElo = Math.max(s.highestElo, s.elo);
  s.recentGames = [
    { result, difficulty, moveCount, accuracy, eloDelta: eloRes.delta, cpGained, date: Date.now() },
    ...s.recentGames,
  ].slice(0, 10);

  saveStats(s);
  return s;
}

// ── Award move event ───────────────────────────────────────────
export function awardMoveEvent(stats, { captures = 0, crossRealm = false, check = false, promotion = false, captureType = "regular" }) {
  const s = { ...stats };
  if (captures > 0) {
    s.cp += captureType === "queen" ? POINTS.captureQueen
           : captureType === "rook"  ? POINTS.captureRook
           : POINTS.capture;
    s.totalCaptures = (s.totalCaptures || 0) + captures;
  }
  if (crossRealm) { s.cp += POINTS.crossRealm; s.totalCrossRealm = (s.totalCrossRealm||0) + 1; }
  if (check)      { s.cp += POINTS.check;      s.totalChecks     = (s.totalChecks    ||0) + 1; }
  if (promotion)  { s.cp += POINTS.promotion;  s.totalPromotions = (s.totalPromotions||0) + 1; }
  saveStats(s);
  return s;
}

// ═══ COMPONENTS ═════════════════════════════════════════════

// ── PointsHUD — live chess.com-style sidebar panel ────────────
export function PointsHUD({ stats, lastAward = null }) {
  const [open, setOpen] = useState(false);
  const rank    = getRank(stats.cp);
  const next    = getNextRank(stats.cp);
  const prog    = getProgressToNext(stats.cp);
  const last    = stats.recentGames?.[0];
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  const F = "'Cinzel', serif";

  return (
    <div style={{ position: "relative", fontFamily: F }}>

      {/* ── Main HUD card ── */}
      <div onClick={() => setOpen(o => !o)} style={{
        background: "rgba(6,3,16,.93)",
        border: `1px solid ${rank.color}42`,
        borderRadius: 10, padding: "12px 14px",
        cursor: "pointer", transition: "border-color .25s",
        boxShadow: `0 0 22px ${rank.color}16`,
      }}>

        {/* Row 1 – ELO + W/L/D */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:10, letterSpacing:2, color:"rgba(150,110,45,.6)", textTransform:"uppercase" }}>Rating</span>
            <span style={{ fontSize:19, fontWeight:700, color:"#e8d5a3", letterSpacing:.5 }}>{stats.elo}</span>
            {last && (
              <span style={{ fontSize:11, fontWeight:700, color: last.eloDelta >= 0 ? "#4caf50" : "#f44336" }}>
                {last.eloDelta >= 0 ? "▲" : "▼"}{Math.abs(last.eloDelta)}
              </span>
            )}
            {(stats.highestElo > stats.elo) && (
              <span style={{ fontSize:9, color:"rgba(150,120,50,.45)", marginLeft:2 }}>
                pk {stats.highestElo}
              </span>
            )}
          </div>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            <span style={{ fontSize:11, fontWeight:600, color:"#4caf50" }}>{stats.wins}W</span>
            <span style={{ fontSize:9, color:"rgba(120,90,30,.35)" }}>/</span>
            <span style={{ fontSize:11, fontWeight:600, color:"#f44336" }}>{stats.losses}L</span>
            <span style={{ fontSize:9, color:"rgba(120,90,30,.35)" }}>/</span>
            <span style={{ fontSize:11, color:"rgba(180,160,100,.45)" }}>{stats.draws}D</span>
          </div>
        </div>

        {/* Row 2 – Rank icon + name + progress */}
        <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:6 }}>
          <span style={{ fontSize:18, lineHeight:1 }}>{rank.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:11, letterSpacing:1.5, color:rank.color, fontWeight:600 }}>
                {rank.name.toUpperCase()}
              </span>
              <span style={{ fontSize:12, color:"#c48020", letterSpacing:.5 }}>
                {stats.cp.toLocaleString()} CP
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ height:5, background:"rgba(100,70,20,.22)", borderRadius:3, overflow:"hidden" }}>
              <div style={{
                height:"100%", width:`${prog*100}%`,
                background: `linear-gradient(90deg, ${rank.color}70, ${rank.color})`,
                transition: "width .7s cubic-bezier(.4,0,.2,1)",
                borderRadius: 3,
                boxShadow: `0 0 8px ${rank.color}55`,
              }} />
            </div>
          </div>
        </div>

        {/* Row 3 – CP to next + streak */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          {next
            ? <span style={{ fontSize:9, color:"rgba(100,72,20,.5)", letterSpacing:.8 }}>
                {next.min - stats.cp} CP → {next.icon} {next.name}
              </span>
            : <span style={{ fontSize:9, color:"#ff4488", letterSpacing:1 }}>⚔ MAX RANK</span>
          }
          {stats.streak >= 2 && (
            <span style={{ fontSize:10, color:"#ff9800" }}>🔥 {stats.streak}</span>
          )}
        </div>
      </div>

      {/* ── CP flash ── */}
      {lastAward != null && lastAward > 0 && (
        <div style={{
          position:"absolute", top:-26, right:8,
          fontFamily: F, fontSize:14, color:"#ffd060",
          fontWeight:700, letterSpacing:1,
          animation:"awardPop .7s ease forwards",
          pointerEvents:"none",
          textShadow:"0 0 10px rgba(255,200,50,.9)",
        }}>+{lastAward} CP</div>
      )}

      {/* ── Dropdown stats panel ── */}
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, right:0,
          background:"rgba(4,2,12,.98)",
          border:`1px solid ${rank.color}28`,
          borderRadius:10, padding:"15px 14px",
          zIndex:50,
          boxShadow:"0 14px 44px rgba(0,0,0,.75)",
          animation:"overlayIn .2s ease",
        }}>
          <div style={{ fontSize:9, letterSpacing:3, color:"rgba(130,90,20,.6)", marginBottom:10, textTransform:"uppercase" }}>
            Chronicle Stats
          </div>

          {/* Stats grid 2-col */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px 10px", marginBottom:11 }}>
            {[
              ["⚡ Peak ELO",     stats.highestElo || stats.elo],
              ["📊 Win Rate",     `${winRate}%`],
              ["⚔ Captures",     stats.totalCaptures || 0],
              ["🌀 Cross-Realm",  stats.totalCrossRealm || 0],
              ["† Checks",        stats.totalChecks || 0],
              ["♟ Promotions",   stats.totalPromotions || 0],
              ["🏆 Best Streak",  stats.bestStreak],
              ["⚡ Fastest Win",  stats.fastestWin ? `${stats.fastestWin}mv` : "—"],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{
                display:"flex", justifyContent:"space-between",
                padding:"3px 0", borderBottom:"1px solid rgba(100,70,20,.1)", fontSize:11,
              }}>
                <span style={{ color:"rgba(155,125,75,.62)" }}>{lbl}</span>
                <span style={{ color:"rgba(220,190,120,.92)", fontWeight:600 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Per-difficulty record */}
          {stats.winsPerDiff && (
            <>
              <div style={{ fontSize:9, letterSpacing:3, color:"rgba(130,90,20,.6)", marginBottom:6, textTransform:"uppercase" }}>
                Record by Difficulty
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4, marginBottom:10 }}>
                {["easy","medium","hard"].map(d => (
                  <div key={d} style={{ background:"rgba(255,255,255,.03)", borderRadius:5, padding:"5px 6px", textAlign:"center" }}>
                    <div style={{ fontSize:9, color:"rgba(140,110,60,.55)", letterSpacing:1, textTransform:"uppercase", marginBottom:3 }}>{d}</div>
                    <div style={{ fontSize:12 }}>
                      <span style={{ color:"#4caf50" }}>{stats.winsPerDiff[d]||0}W</span>
                      <span style={{ color:"rgba(120,90,30,.35)", margin:"0 2px" }}>/</span>
                      <span style={{ color:"#f44336" }}>{stats.lossesPerDiff?.[d]||0}L</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Recent games list */}
          {stats.recentGames?.length > 0 && (
            <>
              <div style={{ fontSize:9, letterSpacing:3, color:"rgba(130,90,20,.6)", marginBottom:6, textTransform:"uppercase" }}>
                Recent Games
              </div>
              {stats.recentGames.slice(0,5).map((g, i) => {
                const rc = g.result==="win" ? "#4caf50" : g.result==="loss" ? "#f44336" : "#ffc107";
                return (
                  <div key={i} style={{
                    display:"flex", justifyContent:"space-between",
                    padding:"4px 0", borderBottom:"1px solid rgba(100,70,20,.07)", fontSize:10,
                  }}>
                    <span style={{ color:rc, fontWeight:700, width:14 }}>
                      {g.result==="win"?"W":g.result==="loss"?"L":"D"}
                    </span>
                    <span style={{ color:"rgba(140,110,60,.55)", width:50 }}>{g.difficulty}</span>
                    <span style={{ color: g.eloDelta>=0?"#4caf50":"#f44336", width:36, textAlign:"right" }}>
                      {g.eloDelta>=0?"+":""}{g.eloDelta}
                    </span>
                    <span style={{ color:"#c48020", width:50, textAlign:"right" }}>+{g.cpGained}CP</span>
                    <span style={{ color:"#8bc34a", width:34, textAlign:"right" }}>{g.accuracy}%</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── RankUpToast ────────────────────────────────────────────────
export function RankUpToast({ rankUpData, onDismiss }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (!rankUpData) return;
    requestAnimationFrame(() => setVis(true));
    const t = setTimeout(() => { setVis(false); setTimeout(onDismiss, 500); }, 4800);
    return () => clearTimeout(t);
  }, [rankUpData]); // eslint-disable-line

  if (!rankUpData) return null;
  const { from, to } = rankUpData;
  return (
    <div style={{
      position:"fixed", top:20, left:"50%",
      transform: `translateX(-50%) ${vis ? "translateY(0)" : "translateY(-50px)"}`,
      opacity: vis ? 1 : 0,
      transition:"all 0.55s cubic-bezier(.34,1.56,.64,1)",
      zIndex:9999, pointerEvents:"none",
    }}>
      <div style={{
        display:"flex", alignItems:"center", gap:18,
        background:"linear-gradient(135deg,rgba(6,3,18,.98),rgba(18,9,4,.98))",
        border:`2px solid ${to.color}`,
        borderRadius:16, padding:"16px 30px",
        boxShadow:`0 0 60px ${to.color}45, 0 10px 40px rgba(0,0,0,.65)`,
        position:"relative", overflow:"hidden",
        fontFamily:"'Cinzel', serif",
      }}>
        <div style={{
          position:"absolute", inset:0,
          background:`radial-gradient(ellipse at 50% -10%, ${to.color}22 0%, transparent 65%)`,
        }} />
        <span style={{ fontSize:46, filter:`drop-shadow(0 0 14px ${to.color})`, position:"relative" }}>{to.icon}</span>
        <div style={{ position:"relative" }}>
          <div style={{ fontSize:9, letterSpacing:4, color:"#c8a840", textTransform:"uppercase", marginBottom:5 }}>
            ✦ Rank Promotion ✦
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:13, color:"rgba(180,150,80,.55)" }}>{from.icon} {from.name}</span>
            <span style={{ fontSize:18, color:"#c8a840" }}>→</span>
            <span style={{ fontSize:19, fontWeight:700, color:to.color }}>{to.icon} {to.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PostGameReport — chess.com-style result card ───────────────
export function PostGameReport({ reportData, lastNarr, onNewGame, onChronicle }) {
  if (!reportData) return null;
  const {
    result, difficulty, moveCount,
    prevElo, newElo, eloDelta,
    cpGained, rankBefore, rankAfter, promoted,
    captures, crossRealm, checks,
    temporalCheckmate = false,
  } = reportData;

  const accuracy = computeAccuracy({ captures, crossRealm, checks, totalMoves: moveCount, result });
  const accClass = classifyAccuracy(accuracy);
  const resultColor = result==="win" ? "#4caf50" : result==="loss" ? "#f44336" : "#ffc107";
  const resultLabel = temporalCheckmate
    ? "⏳ TEMPORAL DOOM"
    : result==="win" ? "VICTORY" : result==="loss" ? "DEFEATED" : "STALEMATE";
  const F = "'Cinzel', serif";

  // SVG accuracy ring
  const R = 38, CIRC = 2 * Math.PI * R;
  const dash = CIRC * (accuracy / 100);

  return (
    <div style={{
      position:"fixed", inset:0,
      background:"rgba(8,4,18,.87)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:100, backdropFilter:"blur(8px)",
    }}>
      <div style={{
        background:"linear-gradient(160deg,#110d06 0%,#1c1409 50%,#0e0c08 100%)",
        border:"1px solid rgba(180,140,50,.38)",
        borderRadius:16, padding:"28px 26px",
        width:360, maxHeight:"92vh", overflowY:"auto",
        fontFamily: F,
        boxShadow:"0 0 80px rgba(180,140,50,.12), 0 20px 60px rgba(0,0,0,.65)",
        animation:"overlayIn .45s cubic-bezier(.34,1.56,.64,1)",
        scrollbarWidth:"thin",
      }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:28, fontWeight:800, letterSpacing:5, color:resultColor,
            textShadow:`0 0 18px ${resultColor}55`, marginBottom:3 }}>
            {resultLabel}
          </div>
          <div style={{ fontSize:10, letterSpacing:2, color:"rgba(140,105,40,.6)" }}>
            {difficulty?.toUpperCase()} · {moveCount} MOVES
          </div>
        </div>

        {/* Accuracy ring */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
          <div style={{ position:"relative", width:100, height:100 }}>
            <svg viewBox="0 0 100 100" width={100} height={100}>
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7" />
              <circle cx="50" cy="50" r={R} fill="none"
                stroke={accClass.color} strokeWidth="7"
                strokeDasharray={`${dash} ${CIRC}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition:"stroke-dasharray 1.2s ease", filter:`drop-shadow(0 0 6px ${accClass.color}80)` }}
              />
            </svg>
            <div style={{
              position:"absolute", inset:0,
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
            }}>
              <span style={{ fontSize:9, marginBottom:1 }}>{accClass.glyph}</span>
              <span style={{ fontSize:20, fontWeight:800, color:accClass.color, lineHeight:1 }}>{accuracy}%</span>
              <span style={{ fontSize:8, letterSpacing:1.5, color:accClass.color, marginTop:1 }}>
                {accClass.label.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ELO row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"9px 12px", background:"rgba(255,255,255,.03)",
          borderRadius:8, marginBottom:6, border:"1px solid rgba(255,255,255,.05)" }}>
          <span style={{ fontSize:11, color:"rgba(160,130,75,.65)" }}>⚡ Rating</span>
          <span style={{ fontSize:14, fontWeight:700, color:"#e8d5a3" }}>
            {newElo}
            <span style={{ fontSize:12, marginLeft:8, color: eloDelta>=0 ? "#4caf50":"#f44336" }}>
              ({eloDelta>=0?"+":""}{eloDelta})
            </span>
          </span>
        </div>

        {/* Rank row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"9px 12px", background:"rgba(255,255,255,.03)",
          borderRadius:8, marginBottom:14, border:"1px solid rgba(255,255,255,.05)" }}>
          <span style={{ fontSize:11, color:"rgba(160,130,75,.65)" }}>🏆 Rank</span>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:13, fontWeight:700, color:rankAfter.color }}>
              {rankAfter.icon} {rankAfter.name}
            </span>
            {promoted && (
              <span style={{
                fontSize:8, letterSpacing:1.5, color:"#c8a840",
                border:"1px solid #c8a840", borderRadius:3, padding:"1px 5px",
              }}>▲ PROMOTED</span>
            )}
          </div>
        </div>

        {/* CP earned breakdown */}
        <div style={{ background:"rgba(255,255,255,.025)", borderRadius:8,
          padding:"11px 12px", marginBottom:14, border:"1px solid rgba(200,168,64,.1)" }}>
          <div style={{ fontSize:9, letterSpacing:2.5, color:"rgba(140,105,40,.6)",
            textTransform:"uppercase", marginBottom:9 }}>Chronicle Points Earned</div>
          <CPBreakdown
            result={result} difficulty={difficulty} moveCount={moveCount}
            captures={captures} crossRealm={crossRealm} checks={checks}
          />
          <div style={{ display:"flex", justifyContent:"space-between",
            borderTop:"1px solid rgba(200,168,64,.18)", marginTop:7, paddingTop:7,
            fontSize:13, fontWeight:700 }}>
            <span style={{ color:"rgba(200,175,120,.8)" }}>Total</span>
            <span style={{ color:"#c8a840" }}>+{cpGained} CP</span>
          </div>
        </div>

        {/* Game stats mini-grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:16 }}>
          {[
            ["⚔", captures||0,   "Captures"],
            ["🌀", crossRealm||0, "Cross-Realm"],
            ["†",  checks||0,     "Checks"],
          ].map(([icon,val,lbl]) => (
            <div key={lbl} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              background:"rgba(255,255,255,.03)", borderRadius:7,
              padding:"8px 4px", border:"1px solid rgba(255,255,255,.05)",
            }}>
              <span style={{ fontSize:18 }}>{icon}</span>
              <span style={{ fontSize:18, fontWeight:700, color:"#e8d5a3" }}>{val}</span>
              <span style={{ fontSize:9, color:"rgba(140,110,55,.5)", letterSpacing:.8 }}>{lbl}</span>
            </div>
          ))}
        </div>

        {/* Last narration excerpt */}
        {lastNarr && (
          <div style={{
            fontFamily:"'Crimson Text', serif", fontStyle:"italic",
            fontSize:13, color:"rgba(160,130,80,.55)", lineHeight:1.7,
            borderTop:"1px solid rgba(180,140,50,.12)", paddingTop:12, marginBottom:16,
          }}>
            "{lastNarr.slice(0,140)}{lastNarr.length>140?"…":""}"
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {onChronicle && (
            <button onClick={onChronicle} style={{
              background:"rgba(70,40,8,.92)", border:"1.5px solid rgba(155,105,28,.6)",
              color:"#f4dc80", padding:"13px", fontFamily: F, fontSize:12,
              letterSpacing:2, borderRadius:8, cursor:"pointer", width:"100%",
              transition:"all .2s", boxShadow:"0 3px 12px rgba(0,0,0,.3)",
            }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(100,55,14,.96)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(70,40,8,.92)"}
            >📖 READ THE FULL CHRONICLE</button>
          )}
          <button onClick={onNewGame} style={{
            background:"rgba(255,255,255,.1)", border:"1.5px solid rgba(100,70,22,.38)",
            color:"#c8a840", padding:"11px", fontFamily: F, fontSize:11,
            letterSpacing:2, borderRadius:8, cursor:"pointer", width:"100%",
            transition:"all .2s",
          }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.18)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"}
          >↺ FIGHT AGAIN</button>
        </div>
      </div>
    </div>
  );
}

// Sub-component: CP breakdown list
function CPBreakdown({ result, difficulty, moveCount, captures, crossRealm, checks }) {
  const items = [];
  if (captures  > 0) items.push(["⚔ Captures",      captures,   POINTS.capture]);
  if (crossRealm> 0) items.push(["🌀 Cross-Realm",   crossRealm, POINTS.crossRealm]);
  if (checks    > 0) items.push(["† Checks",          checks,     POINTS.check]);
  if (result === "win") {
    const winKey = `win_${difficulty}`;
    items.push([`🏆 Victory (${difficulty})`, 1, POINTS[winKey]||POINTS.win_medium]);
    if (moveCount <= 15) items.push(["⚡ Swift Victory", 1, POINTS.fast_win]);
  } else if (result === "draw") {
    items.push(["🤝 Stalemate", 1, POINTS.draw]);
  } else {
    items.push(["📜 Participation", 1, POINTS.loss]);
  }
  return (
    <div>
      {items.map(([label, count, pts], i) => (
        <div key={i} style={{ display:"flex", justifyContent:"space-between",
          padding:"3px 0", fontSize:11, borderBottom:"1px solid rgba(100,70,20,.08)" }}>
          <span style={{ color:"rgba(160,130,75,.65)" }}>{label}{count>1 ? ` ×${count}`:""}</span>
          <span style={{ color:"#c48020" }}>+{pts*count} CP</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
//  CHRONOWAR — Points & Ranking System
// ============================================================

const KEY = "cw_stats_v1";

const RANK_TIERS = [
  { name: "Timewarden",    min: 0,    color: "#8a7255", icon: "🛡" },
  { name: "Chronorider",   min: 200,  color: "#80a040", icon: "🏇" },
  { name: "Realm Knight",  min: 500,  color: "#5599cc", icon: "⚔" },
  { name: "Sage of Ages",  min: 1000, color: "#cc9922", icon: "✦" },
  { name: "Phase Walker",  min: 2000, color: "#aa44ee", icon: "◈" },
  { name: "Time Sovereign",min: 4000, color: "#ee8822", icon: "♛" },
  { name: "Eternal Lord",  min: 8000, color: "#ff4488", icon: "♔" },
];

// ── Load / save ──────────────────────────────────────────
export function loadStats() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultStats();
}

export function saveStats(stats) {
  try { localStorage.setItem(KEY, JSON.stringify(stats)); } catch {}
}

function defaultStats() {
  return {
    cp: 0,            // chronicle points total
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    elo: 1000,
    totalCaptures: 0,
    totalCrossRealm: 0,
    totalChecks: 0,
    fastestWin: null, // move count
    longestGame: 0,
    streak: 0,
    bestStreak: 0,
  };
}

// ── Points awarded per event ─────────────────────────────
export const POINTS = {
  capture:        5,
  crossRealm:     3,
  check:          8,
  promotion:      12,
  win_easy:       30,
  win_medium:     55,
  win_hard:       80,
  win_2player:    40,
  draw:           10,
  loss:           2,   // participation
  fast_win:       25,  // win in <20 moves
  streak_bonus:   15,  // every 3 wins streak
};

// ── Rank helpers ─────────────────────────────────────────
export function getRank(cp) {
  let rank = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (cp >= tier.min) rank = tier;
  }
  return rank;
}

export function getNextRank(cp) {
  for (const tier of RANK_TIERS) {
    if (cp < tier.min) return tier;
  }
  return null;
}

export function getProgressToNext(cp) {
  const rank = getRank(cp);
  const next = getNextRank(cp);
  if (!next) return 1;
  const range = next.min - rank.min;
  const progress = cp - rank.min;
  return Math.min(progress / range, 1);
}

// ── ELO calculation ──────────────────────────────────────
export function calcElo(playerElo, opponentElo, result) {
  const K = 32;
  const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const delta = Math.round(K * (result - expected));
  return Math.max(800, playerElo + delta);
}

// AI difficulty ELO
export const AI_ELO = { easy: 900, medium: 1200, hard: 1500 };

// ── Award points and update stats ────────────────────────
export function awardGameEnd(stats, { result, difficulty, moveCount, mode }) {
  const s = { ...stats };
  s.gamesPlayed += 1;

  if (result === "win") {
    s.wins += 1;
    s.streak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.streak);

    const winKey = mode === "vs-ai" ? `win_${difficulty}` : "win_2player";
    s.cp += POINTS[winKey] || POINTS.win_medium;

    if (moveCount < 20) s.cp += POINTS.fast_win;
    if (moveCount > s.longestGame) s.longestGame = moveCount;
    if (!s.fastestWin || moveCount < s.fastestWin) s.fastestWin = moveCount;

    if (s.streak % 3 === 0) s.cp += POINTS.streak_bonus * Math.floor(s.streak / 3);

    if (mode === "vs-ai") {
      s.elo = calcElo(s.elo, AI_ELO[difficulty] || 1200, 1);
    }
  } else if (result === "draw") {
    s.draws += 1;
    s.streak = 0;
    s.cp += POINTS.draw;
    if (mode === "vs-ai") s.elo = calcElo(s.elo, AI_ELO[difficulty] || 1200, 0.5);
  } else {
    s.losses += 1;
    s.streak = 0;
    s.cp += POINTS.loss;
    if (mode === "vs-ai") s.elo = calcElo(s.elo, AI_ELO[difficulty] || 1200, 0);
  }

  saveStats(s);
  return s;
}

export function awardMoveEvent(stats, { captures = 0, crossRealm = false, check = false, promotion = false }) {
  const s = { ...stats };
  s.cp += captures * POINTS.capture;
  s.totalCaptures += captures;
  if (crossRealm) { s.cp += POINTS.crossRealm; s.totalCrossRealm += 1; }
  if (check)      { s.cp += POINTS.check;      s.totalChecks += 1; }
  if (promotion)  s.cp += POINTS.promotion;
  saveStats(s);
  return s;
}

// ── Points HUD component ─────────────────────────────────
import { useState } from "react";

export function PointsHUD({ stats, lastAward = null }) {
  const [showDetail, setShowDetail] = useState(false);
  const rank = getRank(stats.cp);
  const next = getNextRank(stats.cp);
  const prog = getProgressToNext(stats.cp);

  return (
    <div style={{ position: "relative" }}>
      {/* Main HUD bar */}
      <div
        onClick={() => setShowDetail(d => !d)}
        style={{
          background: "rgba(8,4,18,.92)",
          border: `1px solid ${rank.color}35`,
          borderRadius: 8,
          padding: "8px 14px",
          cursor: "pointer",
          transition: "all .2s",
          boxShadow: `0 0 16px ${rank.color}12`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.1rem" }}>{rank.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "1.5px", color: rank.color }}>
                {rank.name.toUpperCase()}
              </span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: "#c48020", letterSpacing: "1px" }}>
                {stats.cp.toLocaleString()} CP
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 3, background: "rgba(100,70,20,.3)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${prog * 100}%`,
                background: `linear-gradient(90deg, ${rank.color}99, ${rank.color})`,
                transition: "width .6s ease",
                borderRadius: 2,
              }} />
            </div>
          </div>
        </div>
        {next && (
          <div style={{ fontSize: "10px", color: "rgba(100,65,18,.65)", fontFamily: "'Cinzel', serif", marginTop: 4, letterSpacing: "1px" }}>
            {next.min - stats.cp} CP to {next.name}
          </div>
        )}
      </div>

      {/* Flash award */}
      {lastAward && lastAward > 0 && (
        <div style={{
          position: "absolute", top: -22, right: 8,
          fontFamily: "'Cinzel', serif", fontSize: "13px",
          color: "#ffd060", letterSpacing: "1px",
          animation: "awardPop .6s ease forwards",
          pointerEvents: "none",
        }}>
          +{lastAward} CP
        </div>
      )}

      {/* Detail panel */}
      {showDetail && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "rgba(6,3,18,.98)",
          border: `1px solid ${rank.color}28`,
          borderRadius: 8,
          padding: "14px 16px",
          zIndex: 50,
          boxShadow: "0 8px 32px rgba(0,0,0,.7)",
          animation: "overlayIn .2s ease",
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "3px", color: "rgba(130,85,20,.7)", marginBottom: 10 }}>
            CHRONICLE STATS
          </div>
          {[
            ["ELO Rating", stats.elo],
            ["Games Played", stats.gamesPlayed],
            [`W / D / L`, `${stats.wins} / ${stats.draws} / ${stats.losses}`],
            ["Win Streak", `${stats.streak} 🔥`],
            ["Best Streak", stats.bestStreak],
            ["Captures", stats.totalCaptures],
            ["Cross-Realm", stats.totalCrossRealm],
            ["Fastest Win", stats.fastestWin ? `${stats.fastestWin} moves` : "—"],
          ].map(([label, val], i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: i < 7 ? "1px solid rgba(100,70,20,.12)" : "none",
              fontSize: ".8rem",
            }}>
              <span style={{ color: "rgba(160,130,80,.7)", fontFamily: "'Cinzel', serif", fontSize: "12px", letterSpacing: "1px" }}>{label}</span>
              <span style={{ color: "rgba(215,185,120,.9)" }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
//  CHRONOWAR — Advanced Game Rules v3
//  Infinite loop prevention + genius anti-draw mechanics
// ============================================================
import { REALMS, BS, pt, isW } from "./engine";

// ── Position hashing (all 3 realms) ──
export function hashBoards(boards) {
  return REALMS.map(r =>
    boards[r].map(row => row.map(p => p || ".").join("")).join("|")
  ).join("//");
}

// ── Threefold repetition across 3 realms ──
export function checkRepetition(posHistory) {
  if (posHistory.length < 6) return false;
  const last = posHistory[posHistory.length - 1];
  return posHistory.filter(p => p === last).length >= 3;
}

// ── Temporal Fatigue: piece can't cross realms for 2 turns after crossing ──
export function isFatigued(fatigueMap, realm, row, col) {
  return (fatigueMap[`${realm}_${row}_${col}`] || 0) > 0;
}

export function tickFatigue(fatigueMap, crossedTo, toRealm, toRow, toCol) {
  const next = {};
  for (const [k, v] of Object.entries(fatigueMap)) {
    if (v > 1) next[k] = v - 1;
  }
  if (crossedTo) next[`${toRealm}_${toRow}_${toCol}`] = 2;
  return next;
}

// ── 50-move Temporal Clock ──
// Resets on: capture, pawn move, OR cross-realm move
export function shouldResetClock(piece, captured, isCross) {
  return !!captured || pt(piece) === "P" || isCross;
}

// ── Cross-Realm Budget (18 per side) ──
export const CROSS_REALM_BUDGET = 18;

// ── Chronicle Points ──
export function calcCP(cap, chk, cross, promo, moveNum) {
  const capVals = { K:50, Q:18, R:10, S:9, X:7, B:6, N:6, P:2 };
  let cp = 0;
  if (cap) cp += (capVals[pt(cap)] || 2);
  if (chk) cp += 4;
  if (cross) cp += 3;
  if (promo) cp += 12;
  if (moveNum <= 15 && cap) cp += 3; // opening aggression
  return cp;
}

// ── Realm Convergence warning ──
// Pieces idle in Past/Future for 8+ moves get a warning; removed at 13
export function getConvergenceWarnings(boards, moveNum, lastMoveByPiece) {
  if (moveNum < 55) return [];
  const warnings = [];
  for (const realm of ["past", "future"]) {
    for (let r = 0; r < BS; r++) {
      for (let c = 0; c < BS; c++) {
        const p = boards[realm][r][c];
        if (!p) continue;
        const idle = moveNum - (lastMoveByPiece[`${realm}_${r}_${c}`] || 0);
        if (idle >= 8) warnings.push({ realm, row: r, col: c, piece: p, turnsLeft: Math.max(0, 13 - idle) });
      }
    }
  }
  return warnings;
}

export function applyConvergenceRemovals(boards, moveNum, lastMoveByPiece) {
  if (moveNum < 68) return { boards, removed: [] };
  const nb = { past: boards.past.map(r=>[...r]), present: boards.present.map(r=>[...r]), future: boards.future.map(r=>[...r]) };
  const removed = [];
  for (const realm of ["past", "future"]) {
    for (let r = 0; r < BS; r++) {
      for (let c = 0; c < BS; c++) {
        const p = nb[realm][r][c];
        if (!p || pt(p) === "K") continue;
        if (moveNum - (lastMoveByPiece[`${realm}_${r}_${c}`] || 0) >= 13) {
          removed.push({ piece: p, realm, row: r, col: c });
          nb[realm][r][c] = null;
        }
      }
    }
  }
  return { boards: nb, removed };
}

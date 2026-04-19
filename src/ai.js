// ============================================================
//  CHRONOWAR — AI Engine
//  Minimax with alpha-beta pruning across all 3 realms
//  Piece-square tables tuned for 3-realm strategy
// ============================================================

import { REALMS, BS, isW, isB, pt, legalMoves, applyMove, inCheck, hasAnyLegal } from "./engine";

// Material value per piece type
const PIECE_VALUE = {
  K: 10000, Q: 900, R: 500, B: 320, N: 300, S: 480, X: 340, P: 100,
};

// Realm strategic multipliers — Present is hottest
const REALM_WEIGHT = { past: 0.85, present: 1.0, future: 0.85 };

// Piece-square tables (6x6, from white's perspective — row 5 = white back rank)
const PST = {
  P: [
    [0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50],
    [20, 20, 30, 30, 20, 20],
    [10, 10, 20, 25, 10, 10],
    [5,  5,  10, 15,  5,  5],
    [0,  0,  0,  0,  0,  0],
  ],
  N: [
    [-30,-20,-10,-10,-20,-30],
    [-20,  0, 10, 10,  0,-20],
    [-10, 10, 20, 20, 10,-10],
    [-10, 10, 20, 20, 10,-10],
    [-20,  0, 10, 10,  0,-20],
    [-30,-20,-10,-10,-20,-30],
  ],
  B: [
    [-15, -5, -5, -5, -5,-15],
    [ -5, 10,  5,  5, 10, -5],
    [ -5,  5, 15, 15,  5, -5],
    [ -5,  5, 15, 15,  5, -5],
    [ -5, 10,  5,  5, 10, -5],
    [-15, -5, -5, -5, -5,-15],
  ],
  R: [
    [ 0,  0,  5, 10,  5,  0],
    [ 5, 10, 10, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0],
    [ 0,  0,  0,  0,  0,  0],
    [-5,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  0,  0],
  ],
  Q: [
    [-10, -5,  0,  0, -5,-10],
    [ -5,  0,  5,  5,  0, -5],
    [  0,  5, 10, 10,  5,  0],
    [  0,  5, 10, 10,  5,  0],
    [ -5,  0,  5,  5,  0, -5],
    [-10, -5,  0,  0, -5,-10],
  ],
  K: [
    [-30,-40,-40,-40,-40,-30],
    [-30,-40,-40,-40,-40,-30],
    [-30,-40,-40,-40,-40,-30],
    [-20,-30,-30,-30,-30,-20],
    [-10,-20,-20,-20,-20,-10],
    [  0, 10, 20,-10,  0,  0],
  ],
  S: [  // Sage — like rook but bonuses for center
    [ 0,  0,  5, 10,  5,  0],
    [ 5, 10, 10, 10, 10,  5],
    [ 5,  5,  5,  5,  5,  5],
    [ 0,  0,  0,  0,  0,  0],
    [-5,  0,  0,  0,  0, -5],
    [ 0,  0,  5,  5,  0,  0],
  ],
  X: [  // Phase Walker — diagonal bonus, center bonus
    [-15, -5, -5, -5, -5,-15],
    [ -5, 15, 10, 10, 15, -5],
    [ -5, 10, 20, 20, 10, -5],
    [ -5, 10, 20, 20, 10, -5],
    [ -5, 15, 10, 10, 15, -5],
    [-15, -5, -5, -5, -5,-15],
  ],
};

function getPST(piece, row, col) {
  const t = pt(piece);
  const table = PST[t] || PST.P;
  // White pieces: use table as-is (row 5 = white back rank)
  // Black pieces: flip vertically
  const r = isW(piece) ? row : (BS - 1 - row);
  return (table[r]?.[col] ?? 0);
}

function evaluateBoard(boards) {
  let score = 0;
  for (const realm of REALMS) {
    const rw = REALM_WEIGHT[realm];
    for (let r = 0; r < BS; r++) {
      for (let c = 0; c < BS; c++) {
        const p = boards[realm][r][c];
        if (!p) continue;
        const val = (PIECE_VALUE[pt(p)] || 0) + getPST(p, r, c);
        score += isW(p) ? val * rw : -val * rw;
      }
    }
  }
  // Mobility bonus: count legal moves for each side
  let wMob = 0, bMob = 0;
  for (const realm of REALMS)
    for (let r = 0; r < BS; r++)
      for (let c = 0; c < BS; c++) {
        const p = boards[realm][r][c];
        if (!p) continue;
        const moves = legalMoves(boards, realm, r, c).length;
        if (isW(p)) wMob += moves;
        else bMob += moves;
      }
  score += (wMob - bMob) * 5;
  return score;
}

function getAllMoves(boards, white) {
  const moves = [];
  for (const realm of REALMS)
    for (let r = 0; r < BS; r++)
      for (let c = 0; c < BS; c++) {
        const p = boards[realm][r][c];
        if (!p || isW(p) !== white) continue;
        for (const m of legalMoves(boards, realm, r, c))
          moves.push({ fromRealm: realm, fromRow: r, fromCol: c, ...m });
      }
  return moves;
}

// Move ordering: captures first, then checks, then rest
function orderMoves(boards, moves) {
  return moves.sort((a, b) => {
    const capA = boards[a.realm][a.row][a.col] ? (PIECE_VALUE[pt(boards[a.realm][a.row][a.col])] || 0) : 0;
    const capB = boards[b.realm][b.row][b.col] ? (PIECE_VALUE[pt(boards[b.realm][b.row][b.col])] || 0) : 0;
    return capB - capA;
  });
}

function minimax(boards, depth, alpha, beta, maximizing) {
  if (depth === 0) return { score: evaluateBoard(boards) };

  const white = maximizing;
  const moves = getAllMoves(boards, white);

  if (moves.length === 0) {
    if (inCheck(boards, white)) return { score: maximizing ? -50000 + depth : 50000 - depth };
    return { score: 0 }; // stalemate
  }

  const ordered = orderMoves(boards, moves);
  let best = null;

  if (maximizing) {
    let maxScore = -Infinity;
    for (const m of ordered) {
      const nb = applyMove(boards, m.fromRealm, m.fromRow, m.fromCol, m.realm, m.row, m.col);
      const { score } = minimax(nb, depth - 1, alpha, beta, false);
      if (score > maxScore) { maxScore = score; best = m; }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return { score: maxScore, move: best };
  } else {
    let minScore = Infinity;
    for (const m of ordered) {
      const nb = applyMove(boards, m.fromRealm, m.fromRow, m.fromCol, m.realm, m.row, m.col);
      const { score } = minimax(nb, depth - 1, alpha, beta, true);
      if (score < minScore) { minScore = score; best = m; }
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return { score: minScore, move: best };
  }
}

// Depth per difficulty
const DEPTH = { easy: 1, medium: 2, hard: 3 };

export function getBestMove(boards, difficulty = "medium") {
  const depth = DEPTH[difficulty] || 2;
  // AI plays Black (minimizing)
  const result = minimax(boards, depth, -Infinity, Infinity, false);
  return result.move || null;
}

// Add a small random perturbation for Easy mode variety
export function getEasyMove(boards) {
  const moves = getAllMoves(boards, false);
  if (!moves.length) return null;
  // 60% best, 40% random
  if (Math.random() < 0.4) return moves[Math.floor(Math.random() * moves.length)];
  const result = minimax(boards, 1, -Infinity, Infinity, false);
  return result.move || moves[0];
}

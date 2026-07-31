// ============================================================
//  CHRONOWAR — AI Engine
//  Minimax with alpha-beta pruning across all 3 realms
//  Upgraded with Temporal Entropy & AI Personality Profiles
// ============================================================
import { REALMS, BS, isW, pt, legalMoves, applyMove, inCheck, KING_FLANK_BUDGET } from "./engine";
import { AI_PROFILES } from "./evaluateEntropy";
import TemporalEngine from "./temporalEngine";

// Initialize a standalone temporal engine specifically for AI tree simulations
const aiTemporalEngine = new TemporalEngine();

const PIECE_VALUE = { K:10000, Q:900, R:500, B:320, N:300, S:480, X:340, P:100 };
const REALM_WEIGHT = { past:0.85, present:1.0, future:0.85 };

const PST = {
  P:[[0,0,0,0,0,0],[50,50,50,50,50,50],[20,20,30,30,20,20],[10,10,20,25,10,10],[5,5,10,15,5,5],[0,0,0,0,0,0]],
  N:[[-30,-20,-10,-10,-20,-30],[-20,0,10,10,0,-20],[-10,10,20,20,10,-10],[-10,10,20,20,10,-10],[-20,0,10,10,0,-20],[-30,-20,-10,-10,-20,-30]],
  B:[[-15,-5,-5,-5,-5,-15],[-5,10,5,5,10,-5],[-5,5,15,15,5,-5],[-5,5,15,15,5,-5],[-5,10,5,5,10,-5],[-15,-5,-5,-5,-5,-15]],
  R:[[0,0,5,10,5,0],[5,10,10,10,10,5],[0,0,0,0,0,0],[0,0,0,0,0,0],[-5,0,0,0,0,-5],[0,0,0,5,0,0]],
  Q:[[-10,-5,0,0,-5,-10],[-5,0,5,5,0,-5],[0,5,10,10,5,0],[0,5,10,10,5,0],[-5,0,5,5,0,-5],[-10,-5,0,0,-5,-10]],
  K:[[-30,-40,-40,-40,-40,-30],[-30,-40,-40,-40,-40,-30],[-30,-40,-40,-40,-40,-30],[-20,-30,-30,-30,-30,-20],[-10,-20,-20,-20,-20,-10],[0,10,20,-10,0,0]],
  S:[[0,0,5,10,5,0],[5,10,10,10,10,5],[5,5,5,5,5,5],[0,0,0,0,0,0],[-5,0,0,0,0,-5],[0,0,5,5,0,0]],
  X:[[-15,-5,-5,-5,-5,-15],[-5,15,10,10,15,-5],[-5,10,20,20,10,-5],[-5,10,20,20,10,-5],[-5,15,10,10,15,-5],[-15,-5,-5,-5,-5,-15]],
};

function getPST(piece, row, col) {
  const t = pt(piece), table = PST[t] || PST.P;
  const r = isW(piece) ? row : (BS - 1 - row);
  return table[r]?.[col] ?? 0;
}

// Decrease budget when King moves from a flank realm
function spendKingBudget(kingBudget, piece, fromRealm) {
  if (!kingBudget || pt(piece) !== "K") return kingBudget;
  if (fromRealm !== "past" && fromRealm !== "future") return kingBudget;
  const side = isW(piece) ? "white" : "black";
  return { ...kingBudget, [side]: Math.max(0, (kingBudget[side] ?? KING_FLANK_BUDGET) - 1) };
}

// RENAMED from evaluateBoard to preserve your excellent physical chess logic
function calculateClassicScore(boards, kingBudget = null) {
  let score = 0;
  for (const realm of REALMS) {
    const rw = REALM_WEIGHT[realm];
    for (let r = 0; r < BS; r++)
      for (let c = 0; c < BS; c++) {
        const p = boards[realm][r][c];
        if (!p) continue;
        const val = (PIECE_VALUE[pt(p)] || 0) + getPST(p, r, c);
        score += isW(p) ? val * rw : -val * rw;
      }
  }
  // Mobility bonus
  let wMob = 0, bMob = 0;
  for (const realm of REALMS)
    for (let r = 0; r < BS; r++)
      for (let c = 0; c < BS; c++) {
        const p = boards[realm][r][c];
        if (!p) continue;
        const moves = legalMoves(boards, realm, r, c, kingBudget).length;
        if (isW(p)) wMob += moves; else bMob += moves;
      }
  score += (wMob - bMob) * 5;
  // Penalise burning King flank budget
  if (kingBudget) score += ((kingBudget.white ?? KING_FLANK_BUDGET) - (kingBudget.black ?? KING_FLANK_BUDGET)) * 8;
  return score;
}

// NEW: The Temporal Bridge
function evaluateBoard(boards, isWhiteToMove, kingBudget = null, currentTurnEntropy = null, aiProfileName = 'THE_TIME_WEAVER') {
  // 1. Get your original physical board score
  const classicScore = calculateClassicScore(boards, kingBudget);

  // 2. Fetch timeline metrics
  if (currentTurnEntropy) {
    aiTemporalEngine.entropyState = { ...currentTurnEntropy };
  }
  const profile = AI_PROFILES[aiProfileName] || AI_PROFILES.THE_TIME_WEAVER;
  const metrics = aiTemporalEngine.getMetrics(Math.abs(classicScore), 0);

  let temporalScore = 0;
  
  // Apply AI Personality
  temporalScore += metrics.momentum * profile.aggression;
  temporalScore += (metrics.entropySummary.normalized * 20) * profile.entropy;
  
  const avgStability = (
    metrics.pressure.stabilityMultipliers.past + 
    metrics.pressure.stabilityMultipliers.present + 
    metrics.pressure.stabilityMultipliers.future
  ) / 3;
  temporalScore += (avgStability * 50) * profile.defense;

  // Make temporal score positive for White, negative for Black
  const perspectiveMultiplier = isWhiteToMove ? 1 : -1;

  // Final Blend: 40% Physical Chess, 60% Temporal Manipulation
  return (classicScore * 0.4) + (temporalScore * perspectiveMultiplier * 0.6);
}

function getAllMoves(boards, white, kingBudget = null) {
  const moves = [];
  for (const realm of REALMS)
    for (let r = 0; r < BS; r++)
      for (let c = 0; c < BS; c++) {
        const p = boards[realm][r][c];
        if (!p || isW(p) !== white) continue;
        for (const m of legalMoves(boards, realm, r, c, kingBudget))
          moves.push({ fromRealm: realm, fromRow: r, fromCol: c, ...m });
      }
  return moves;
}

function orderMoves(boards, moves) {
  return moves.sort((a, b) => {
    const vA = boards[a.realm][a.row][a.col] ? (PIECE_VALUE[pt(boards[a.realm][a.row][a.col])] || 0) : 0;
    const vB = boards[b.realm][b.row][b.col] ? (PIECE_VALUE[pt(boards[b.realm][b.row][b.col])] || 0) : 0;
    return vB - vA;
  });
}

// UPDATED: Now receives AI profile and entropy, passing them down the tree
function minimax(boards, depth, alpha, beta, maximizing, kingBudget = null, aiProfileName = 'THE_TIME_WEAVER', currentEntropy = null) {
  if (depth === 0) return { score: evaluateBoard(boards, maximizing, kingBudget, currentEntropy, aiProfileName) };
  
  const white = maximizing;
  const moves = getAllMoves(boards, white, kingBudget);
  
  if (moves.length === 0) {
    if (inCheck(boards, white)) return { score: maximizing ? -50000 + depth : 50000 - depth };
    // Temporal checkmate — budget exhausted, no moves → loss
    if (kingBudget) {
      const side = white ? "white" : "black";
      if ((kingBudget[side] ?? KING_FLANK_BUDGET) <= 0)
        return { score: maximizing ? -50000 + depth : 50000 - depth };
    }
    return { score: 0 }; // stalemate
  }
  
  const ordered = orderMoves(boards, moves);
  let best = null;
  
  if (maximizing) {
    let maxScore = -Infinity;
    for (const m of ordered) {
      const nb = applyMove(boards, m.fromRealm, m.fromRow, m.fromCol, m.realm, m.row, m.col);
      const nextBudget = spendKingBudget(kingBudget, boards[m.fromRealm][m.fromRow][m.fromCol], m.fromRealm);
      const { score } = minimax(nb, depth - 1, alpha, beta, false, nextBudget, aiProfileName, currentEntropy);
      if (score > maxScore) { maxScore = score; best = m; }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return { score: maxScore, move: best };
  } else {
    let minScore = Infinity;
    for (const m of ordered) {
      const nb = applyMove(boards, m.fromRealm, m.fromRow, m.fromCol, m.realm, m.row, m.col);
      const nextBudget = spendKingBudget(kingBudget, boards[m.fromRealm][m.fromRow][m.fromCol], m.fromRealm);
      const { score } = minimax(nb, depth - 1, alpha, beta, true, nextBudget, aiProfileName, currentEntropy);
      if (score < minScore) { minScore = score; best = m; }
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return { score: minScore, move: best };
  }
}

const DEPTH = { easy:1, medium:2, hard:3 };

// UPDATED: Entry points now accept the current temporal state and AI personality
export function getBestMove(boards, difficulty = "medium", kingBudget = null, aiProfileName = 'THE_BLOOD_MONARCH', currentEntropy = null) {
  const result = minimax(boards, DEPTH[difficulty] || 2, -Infinity, Infinity, false, kingBudget, aiProfileName, currentEntropy);
  return result.move || null;
}

export function getEasyMove(boards, kingBudget = null, aiProfileName = 'THE_TIME_WEAVER', currentEntropy = null) {
  const moves = getAllMoves(boards, false, kingBudget);
  if (!moves.length) return null;
  if (Math.random() < 0.4) return moves[Math.floor(Math.random() * moves.length)];
  const result = minimax(boards, 1, -Infinity, Infinity, false, kingBudget, aiProfileName, currentEntropy);
  return result.move || moves[0];
}

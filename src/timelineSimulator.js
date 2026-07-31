/**
 * Timeline Simulator for ChronoWar
 * Manages history snapshots, reality branching (Rewrite), and AI state caching.
 */

export class TimelineHistory {
  constructor() {
    this.snapshots = []; // Stores the exact state of the game at each turn
    this.transpositionTable = new Map(); // Caches AI evaluations to prevent UI freezing
  }

  /**
   * Records a snapshot of the current state across all realms.
   */
  recordState(turnIndex, pastBoard, presentBoard, futureBoard, entropyState, cpScore) {
    const stateHash = this.generateHash(pastBoard, presentBoard, futureBoard);

    const snapshot = {
      turn: turnIndex,
      hash: stateHash,
      cp: cpScore,
      entropy: { ...entropyState },
      // Deep copies ensure we don't accidentally mutate past states
      boards: {
        past: JSON.parse(JSON.stringify(pastBoard)),
        present: JSON.parse(JSON.stringify(presentBoard)),
        future: JSON.parse(JSON.stringify(futureBoard))
      }
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * THE KILLER FEATURE: History Rewrite
   * Branches the timeline by truncating history back to a specific turn.
   */
  rewriteHistory(targetTurn, currentCP, rewriteCost = 20) {
    if (currentCP < rewriteCost) {
      throw new Error("Insufficient Chronicle Points to rewrite history.");
    }
    if (targetTurn < 0 || targetTurn >= this.snapshots.length) {
      throw new Error("Invalid turn index for history rewrite.");
    }

    // Deduct the CP cost
    const newCP = currentCP - rewriteCost;

    // Truncate the timeline (this permanently erases the "future" of the old timeline)
    this.snapshots = this.snapshots.slice(0, targetTurn + 1);

    // Retrieve the new current reality
    const newReality = this.snapshots[this.snapshots.length - 1];

    return {
      success: true,
      remainingCP: newCP,
      restoredReality: newReality
    };
  }

  /**
   * Generates a deterministic hash for the 3-board state.
   * Used to quickly retrieve AI calculations if this timeline was previously evaluated.
   */
  generateHash(past, present, future) {
    // For v1.0, we use a fast string serialization. 
    // This can be upgraded to true 64-bit Zobrist XOR hashing later for maximum performance.
    return `P:${this._boardToString(past)}|Pr:${this._boardToString(present)}|F:${this._boardToString(future)}`;
  }

  /**
   * Helper to serialize a 6x6 board state for caching
   */
  _boardToString(board) {
    if (!board) return "";
    return board.flat().map(cell => cell ? `${cell.type}${cell.color}` : '0').join('');
  }

  /**
   * Caches an AI evaluation to keep the game fast during timeline rewrites
   */
  cacheEvaluation(hash, depth, score, bestMove) {
    this.transpositionTable.set(hash, { depth, score, bestMove });
  }

  /**
   * Retrieves a cached AI evaluation if it exists and meets depth requirements
   */
  getCachedEvaluation(hash, depth) {
    const cached = this.transpositionTable.get(hash);
    if (cached && cached.depth >= depth) {
      return cached;
    }
    return null;
  }
}

export default TimelineHistory;

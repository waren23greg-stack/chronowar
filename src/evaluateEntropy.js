/**
 * AI Temporal Evaluation Module
 * Bridges standard board control with Timeline Pressure and AI Personality Vectors.
 */

// Define the unique AI playstyles for ChronoWar
export const AI_PROFILES = {
  THE_TIME_WEAVER: { aggression: 0.8, entropy: 1.2, defense: 1.0 },    // Balances stability with controlled chaos
  THE_BLOOD_MONARCH: { aggression: 1.5, entropy: 0.8, defense: 0.5 },  // Heavily prioritizes board control and attack
  THE_REALM_BREAKER: { aggression: 1.0, entropy: 1.5, defense: 0.3 },  // Actively tries to destabilize the timelines
  THE_SILENT_STRATEGIST: { aggression: 0.5, entropy: 0.5, defense: 1.5 } // Plays extremely defensively across all realms
};

// Standard material values for a 6x6 board
const PIECE_VALUES = {
  'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900,
  'w': 70 // Example for a custom temporal piece (e.g., Phase Walker)
};

/**
 * Calculates raw material score across all three boards.
 * Positive score favors White, negative favors Black.
 */
function calculateBaseControl(boards) {
  let score = 0;
  const { past, present, future } = boards;
  const allBoards = [past, present, future];

  allBoards.forEach(board => {
    if (!board) return;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        const piece = board[row][col];
        if (piece) {
          // Adjust based on how piece objects are structured in engine.js
          const val = PIECE_VALUES[piece.type.toLowerCase()] || 0; 
          score += (piece.color === 'w' ? val : -val);
        }
      }
    }
  });
  return score;
}

/**
 * The core evaluation function that Replaces standard Minimax evaluation.
 * Calculates who is winning based on manipulating time, not just capturing pieces.
 */
export function evaluateTemporalPosition(boards, temporalEngine, aiProfile = AI_PROFILES.THE_TIME_WEAVER, isWhiteToMove) {
  // 1. Get raw material/board control
  const baseControl = calculateBaseControl(boards);
  
  // 2. Fetch dynamic timeline metrics from the orchestrator
  const metrics = temporalEngine.getMetrics(Math.abs(baseControl), 0);

  let temporalScore = 0;

  // 3. Apply the AI Personality Vector
  
  // Aggression: Values physical board momentum
  temporalScore += metrics.momentum * aiProfile.aggression;

  // Entropy: Values creating paradoxes and timeline chaos
  temporalScore += (metrics.entropySummary.normalized * 20) * aiProfile.entropy;

  // Defense: Values timeline stability and avoiding temporal fatigue
  const avgStability = (
    metrics.pressure.stabilityMultipliers.past + 
    metrics.pressure.stabilityMultipliers.present + 
    metrics.pressure.stabilityMultipliers.future
  ) / 3;
  temporalScore += (avgStability * 50) * aiProfile.defense;

  // Combine standard chess evaluation with temporal evaluation
  // The perspective multiplier ensures the AI knows which side of the score is "good" for it
  const perspectiveMultiplier = isWhiteToMove ? 1 : -1;
  
  // ChronoWar Formula: 40% traditional board state, 60% temporal manipulation
  return (baseControl * 0.4) + (temporalScore * perspectiveMultiplier * 0.6);
}

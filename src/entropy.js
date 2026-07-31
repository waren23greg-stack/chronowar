/**
 * Temporal Entropy Module for ChronoWar
 * Tracks instability across Past, Present, and Future realms.
 */

export const INITIAL_ENTROPY = {
  past: 0,
  present: 0,
  future: 0
};

export const ENTROPY_WEIGHTS = {
  CAPTURE: 3,
  REALM_JUMP: 5,
  PARADOX: 8,
  SACRIFICE: 6,
  CHECK: 4
};

/**
 * Calculates updated entropy for a specific realm based on game events
 */
export function calculateRealmEntropy(currentEntropy, eventType) {
  const weight = ENTROPY_WEIGHTS[eventType] || 1;
  const nextValue = currentEntropy + weight;
  return Math.min(100, Math.max(0, nextValue)); // Cap between 0 and 100
}

/**
 * Evaluates total state entropy across all realms
 */
export function evaluateTotalEntropy(entropyState) {
  const { past, present, future } = entropyState;
  const total = past + present + future;
  const balance = Math.abs(past - present) + Math.abs(present - future) + Math.abs(future - past);

  return {
    total,
    balance, // High variance indicates severe temporal distortion
    normalized: Math.min(100, Math.round(total / 3))
  };
}

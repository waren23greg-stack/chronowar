/**
 * Timeline Pressure Graph for ChronoWar
 * Handles spatial pressure propagation across Past, Present, and Future realms.
 */

/**
 * Computes pressure flows and stability multipliers
 * Flow Direction: Past -> Present -> Future -> Past
 */
export function computeTimelinePressure(entropyState) {
  const { past, present, future } = entropyState;

  // Past instability creates chaos in the Present
  const pastToPresentPressure = past * 0.45;

  // Present instability restricts mobility in the Future
  const presentToFuturePressure = present * 0.35;

  // Future instability echoes back to alter Past options
  const futureToPastPressure = future * 0.25;

  return {
    pressures: {
      pastToPresent: pastToPresentPressure,
      presentToFuture: presentToFuturePressure,
      futureToPast: futureToPastPressure
    },
    stabilityMultipliers: {
      past: Math.max(0.2, 1 - (futureToPastPressure / 100)),
      present: Math.max(0.2, 1 - (pastToPresentPressure / 100)),
      future: Math.max(0.2, 1 - (presentToFuturePressure / 100))
    }
  };
}

/**
 * Calculates unified Temporal Momentum score
 */
export function calculateTemporalMomentum(boardControl = 0, entropyState, chronicleScore = 0) {
  const pressure = computeTimelinePressure(entropyState);
  const avgStability = (
    pressure.stabilityMultipliers.past +
    pressure.stabilityMultipliers.present +
    pressure.stabilityMultipliers.future
  ) / 3;

  return (boardControl * 0.5) + (avgStability * 30) + (chronicleScore * 0.2);
}

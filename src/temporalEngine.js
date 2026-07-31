/**
 * Central Temporal Engine Orchestrator
 */
import { INITIAL_ENTROPY, calculateRealmEntropy, evaluateTotalEntropy } from './entropy.js';
import { computeTimelinePressure, calculateTemporalMomentum } from './influenceGraph.js';

export class TemporalEngine {
  constructor() {
    this.entropyState = { ...INITIAL_ENTROPY };
  }

  recordEvent(realm, eventType) {
    if (this.entropyState[realm] === undefined) return;
    this.entropyState[realm] = calculateRealmEntropy(this.entropyState[realm], eventType);
  }

  getMetrics(boardControl = 0, chronicleScore = 0) {
    const entropyEval = evaluateTotalEntropy(this.entropyState);
    const pressureGraph = computeTimelinePressure(this.entropyState);
    const momentum = calculateTemporalMomentum(boardControl, this.entropyState, chronicleScore);

    return {
      entropy: { ...this.entropyState },
      entropySummary: entropyEval,
      pressure: pressureGraph,
      momentum
    };
  }

  reset() {
    this.entropyState = { ...INITIAL_ENTROPY };
  }
}

export default TemporalEngine;

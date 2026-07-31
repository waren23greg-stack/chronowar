import React, { useState } from 'react';

const REWRITE_COST = 20;

export default function HistoryRewritePanel({ 
  isOpen, 
  onClose, 
  currentCP, 
  historyLength, 
  onExecuteRewrite 
}) {
  const [selectedTurn, setSelectedTurn] = useState(historyLength > 0 ? historyLength - 1 : 0);

  if (!isOpen) return null;

  const canAfford = currentCP >= REWRITE_COST;
  const isShattering = selectedTurn < historyLength - 1;

  const handleRewrite = () => {
    if (canAfford && isShattering) {
      onExecuteRewrite(selectedTurn);
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-purple-500/50 p-6 rounded-lg max-w-md w-full shadow-[0_0_30px_rgba(168,85,247,0.2)] text-white font-sans">
        
        <h2 className="text-2xl font-bold text-purple-400 mb-2 uppercase tracking-widest">
          Shatter Timeline
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          Expend Chronicle Points to collapse the current reality and branch a new timeline from a past divergence point. The abandoned future will be permanently erased.
        </p>

        <div className="bg-slate-800 p-4 rounded mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Chronicle Points:</span>
            <span className={`font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
              {currentCP} / {REWRITE_COST} CP
            </span>
          </div>
          
          <label className="block text-slate-400 text-sm mb-2 mt-4">
            Select Divergence Point (Turn {selectedTurn}):
          </label>
          <input 
            type="range" 
            min="0" 
            max={Math.max(0, historyLength - 1)} 
            value={selectedTurn} 
            onChange={(e) => setSelectedTurn(parseInt(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Genesis</span>
            <span>Present</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
          >
            Maintain Reality
          </button>
          <button 
            onClick={handleRewrite}
            disabled={!canAfford || !isShattering}
            className={`flex-1 px-4 py-2 rounded font-bold transition-all ${
              canAfford && isShattering 
                ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.5)] text-white' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Rewrite History
          </button>
        </div>
      </div>
    </div>
  );
}

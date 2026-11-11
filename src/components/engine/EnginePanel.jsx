import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  toggleEngine, 
  setMultiPV, 
  setMaxDepth 
} from '../../store/slices/engineSlice';
import { makeMove } from '../../store/slices/chessboardSlice';
import { stockfishService } from '../../services/engine/stockfishService';
import { 
  Cpu, 
  Play, 
  Pause, 
  Sliders, 
  Zap, 
  Award, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function EnginePanel() {
  const dispatch = useDispatch();
  const { 
    isEnabled, 
    isAnalyzing, 
    depth, 
    maxDepth, 
    multiPV, 
    scoreText, 
    bestMove, 
    variations,
    evalPercent 
  } = useSelector((state) => state.engine);

  const { positionStats } = useSelector((state) => state.explorer);
  const historicalMoves = (positionStats?.moves || []).map(m => m.san);

  const handlePlayEngineMove = (sanMove) => {
    if (!sanMove) return;
    // Find matching candidate variation
    const variation = variations.find(v => v.bestMoveSan === sanMove);
    if (variation && variation.bestMoveUci) {
      const from = variation.bestMoveUci.slice(0, 2);
      const to = variation.bestMoveUci.slice(2, 4);
      const promotion = variation.bestMoveUci.length > 4 ? variation.bestMoveUci[4] : undefined;
      dispatch(makeMove({ from, to, promotion }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-surface border border-brand-border rounded-xl overflow-hidden select-none">
      
      {/* Header */}
      <div className="p-3 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Stockfish 19 NNUE</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                WASM
              </span>
            </h2>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={() => dispatch(toggleEngine())}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-smooth ${
            isEnabled 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
              : 'bg-brand-card text-slate-400 border border-brand-border'
          }`}
          title={isEnabled ? 'Pause Engine' : 'Start Engine'}
        >
          {isEnabled ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Active</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Paused</span>
            </>
          )}
        </button>
      </div>

      {isEnabled ? (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          
          {/* Main Evaluation Badge & Depth */}
          <div className="grid grid-cols-2 gap-2">
            {/* Score */}
            <div className="p-2.5 rounded-xl bg-brand-card border border-brand-border flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Evaluation</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-xl font-mono font-extrabold ${
                  scoreText.startsWith('+') ? 'text-emerald-400' : 
                  scoreText.startsWith('-') ? 'text-sky-400' : 'text-slate-100'
                }`}>
                  {scoreText}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {scoreText.startsWith('M') || scoreText.startsWith('+M') || scoreText.startsWith('-M') ? 'mate' : 'pawns'}
                </span>
              </div>
            </div>

            {/* Depth & Status */}
            <div className="p-2.5 rounded-xl bg-brand-card border border-brand-border flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Depth</span>
                {isAnalyzing && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-xl font-extrabold text-slate-100">{depth}</span>
                <span className="text-[10px] text-slate-400">/ {maxDepth} plies</span>
              </div>
            </div>
          </div>

          {/* Engine Settings (MultiPV & Depth) */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-brand-card/40 border border-brand-border/60 text-xs">
            <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
              <Sliders className="w-3 h-3 text-slate-400" />
              <span>Candidate Lines:</span>
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => dispatch(setMultiPV(num))}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    multiPV === num 
                      ? 'bg-emerald-500 text-slate-950 font-bold' 
                      : 'bg-brand-surface text-slate-400 hover:text-white border border-brand-border'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Variations */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Engine Recommended Lines</span>
              <span>Eval</span>
            </div>

            {variations.length > 0 ? (
              variations.map((v, i) => {
                const isPlayedInDb = historicalMoves.includes(v.bestMoveSan);

                return (
                  <div
                    key={v.pvIndex || i}
                    onClick={() => handlePlayEngineMove(v.bestMoveSan)}
                    className="p-2.5 rounded-xl bg-brand-card hover:bg-brand-hover/90 border border-brand-border cursor-pointer transition-smooth group flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-400">
                          {v.pvIndex}
                        </span>
                        <span className="font-mono font-bold text-sm text-slate-100 group-hover:text-emerald-400">
                          {v.bestMoveSan}
                        </span>

                        {/* Distinction badge: played in DB vs Novelty/Unplayed in DB */}
                        {isPlayedInDb ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-surface border border-brand-border text-slate-400">
                            In DB
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium">
                            Preparation Idea
                          </span>
                        )}
                      </div>

                      <span className={`font-mono font-bold text-xs ${
                        v.scoreText.startsWith('+') ? 'text-emerald-400' :
                        v.scoreText.startsWith('-') ? 'text-sky-400' : 'text-slate-200'
                      }`}>
                        {v.scoreText}
                      </span>
                    </div>

                    {/* Continuation Line SAN */}
                    <div className="text-[11px] font-mono text-slate-400 truncate leading-relaxed">
                      {v.sanLine || v.pvMoves.join(' ')}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-brand-card/30 rounded-xl border border-brand-border">
                {isAnalyzing ? 'Stockfish 19 calculating variations...' : 'Waiting for move...'}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Engine Disabled State */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3 text-slate-400">
          <div className="w-12 h-12 rounded-2xl bg-brand-card border border-brand-border flex items-center justify-center text-slate-500">
            <Cpu className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Engine Analysis Paused</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-3">
              Enable Stockfish 19 NNUE for live evaluations, candidate moves, and opening preparation.
            </p>
            <button
              onClick={() => dispatch(toggleEngine())}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-smooth inline-flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Enable Stockfish 19</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-brand-border bg-brand-card/40 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Stockfish 19 NNUE WASM</span>
        <span>Independent of DB stats</span>
      </div>

    </div>
  );
}


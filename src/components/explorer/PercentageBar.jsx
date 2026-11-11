import React from 'react';

/**
 * Lichess-style horizontal percentage bar showing White Wins / Draws / Black Wins.
 * Always renders from actual board perspective (White / Draw / Black).
 */
export default function PercentageBar({ 
  whiteWinPct = 0, 
  drawPct = 0, 
  blackWinPct = 0,
  whiteWins = 0,
  draws = 0,
  blackWins = 0,
  showLabels = false,
  height = 'h-3 sm:h-4'
}) {
  return (
    <div className="w-full flex flex-col gap-1 select-none">
      <div className={`w-full ${height} rounded overflow-hidden flex border border-brand-border/60 bg-slate-900 shadow-inner`}>
        {/* White Wins */}
        {whiteWinPct > 0 && (
          <div 
            className="bg-slate-100 hover:bg-white text-slate-950 font-mono text-[9px] sm:text-[10px] font-bold flex items-center justify-center transition-all px-0.5 truncate cursor-default"
            style={{ width: `${whiteWinPct}%` }}
            title={`White: ${whiteWins} wins (${whiteWinPct}%)`}
          >
            {whiteWinPct >= 12 ? `${whiteWinPct}%` : ''}
          </div>
        )}

        {/* Draws */}
        {drawPct > 0 && (
          <div 
            className="bg-slate-500 hover:bg-slate-400 text-slate-100 font-mono text-[9px] sm:text-[10px] font-bold flex items-center justify-center transition-all px-0.5 truncate cursor-default"
            style={{ width: `${drawPct}%` }}
            title={`Draws: ${draws} (${drawPct}%)`}
          >
            {drawPct >= 12 ? `${drawPct}%` : ''}
          </div>
        )}

        {/* Black Wins */}
        {blackWinPct > 0 && (
          <div 
            className="bg-slate-900 hover:bg-black text-slate-300 font-mono text-[9px] sm:text-[10px] font-bold flex items-center justify-center transition-all px-0.5 truncate cursor-default"
            style={{ width: `${blackWinPct}%` }}
            title={`Black: ${blackWins} wins (${blackWinPct}%)`}
          >
            {blackWinPct >= 12 ? `${blackWinPct}%` : ''}
          </div>
        )}
      </div>

      {showLabels && (
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-0.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-100 inline-block"></span>
            <span>White {whiteWinPct}%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
            <span>Draw {drawPct}%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700 inline-block"></span>
            <span>Black {blackWinPct}%</span>
          </span>
        </div>
      )}
    </div>
  );
}

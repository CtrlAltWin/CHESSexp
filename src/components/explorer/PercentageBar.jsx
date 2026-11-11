import React from 'react';

/**
 * Lichess-style horizontal percentage bar showing White Wins / Draws / Black Wins.
 * Always renders from actual board perspective (White Wins / Draws / Black Wins).
 * Uses explicit inline backgrounds so theme switches never invert or corrupt colors.
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
      <div 
        className={`w-full ${height} rounded overflow-hidden flex border border-brand-border/60 shadow-inner`}
        style={{ backgroundColor: '#181f2a' }}
      >
        {/* White Wins */}
        {whiteWinPct > 0 && (
          <div 
            className="font-mono text-[9px] sm:text-[10px] font-bold flex items-center justify-center px-0.5 truncate cursor-default transition-all"
            style={{ 
              width: `${whiteWinPct}%`,
              backgroundColor: '#ffffff',
              color: '#0f172a'
            }}
            title={`White: ${whiteWins} wins (${whiteWinPct}%)`}
          >
            {whiteWinPct >= 12 ? `${whiteWinPct}%` : ''}
          </div>
        )}

        {/* Draws */}
        {drawPct > 0 && (
          <div 
            className="font-mono text-[9px] sm:text-[10px] font-bold flex items-center justify-center px-0.5 truncate cursor-default transition-all"
            style={{ 
              width: `${drawPct}%`,
              backgroundColor: '#64748b',
              color: '#ffffff'
            }}
            title={`Draws: ${draws} (${drawPct}%)`}
          >
            {drawPct >= 12 ? `${drawPct}%` : ''}
          </div>
        )}

        {/* Black Wins */}
        {blackWinPct > 0 && (
          <div 
            className="font-mono text-[9px] sm:text-[10px] font-bold flex items-center justify-center px-0.5 truncate cursor-default transition-all"
            style={{ 
              width: `${blackWinPct}%`,
              backgroundColor: '#090d16',
              color: '#f8fafc'
            }}
            title={`Black: ${blackWins} wins (${blackWinPct}%)`}
          >
            {blackWinPct >= 12 ? `${blackWinPct}%` : ''}
          </div>
        )}
      </div>

      {showLabels && (
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-0.5">
          <span className="flex items-center gap-1.5">
            <span 
              className="w-2.5 h-2.5 rounded-xs inline-block border border-slate-300 shadow-2xs" 
              style={{ backgroundColor: '#ffffff' }}
            ></span>
            <span className="font-semibold text-slate-300">White {whiteWinPct}%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span 
              className="w-2.5 h-2.5 rounded-xs inline-block" 
              style={{ backgroundColor: '#64748b' }}
            ></span>
            <span className="font-semibold text-slate-300">Draw {drawPct}%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span 
              className="w-2.5 h-2.5 rounded-xs inline-block border border-slate-700" 
              style={{ backgroundColor: '#090d16' }}
            ></span>
            <span className="font-semibold text-slate-300">Black {blackWinPct}%</span>
          </span>
        </div>
      )}
    </div>
  );
}



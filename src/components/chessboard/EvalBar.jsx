import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Professional Stockfish Evaluation Bar.
 * Correctly displays positive score for White advantage, negative for Black advantage.
 * Displays +M3, -M2 for mate scores.
 * Uses smooth CSS transitions and accessible color contrast.
 */
export default function EvalBar({ orientation = 'white', isMobile = false }) {
  const { isEnabled, scoreText, evalPercent, isMate, mateIn } = useSelector((state) => state.engine);

  if (!isEnabled) {
    return null;
  }

  // Calculate percentage of White's bar height / width
  // If orientation is black, flip the bar display so user's side is at the bottom
  const whitePercent = Math.max(0, Math.min(100, evalPercent));
  const displayWhitePercent = orientation === 'black' ? 100 - whitePercent : whitePercent;

  if (isMobile) {
    return (
      <div className="w-full flex items-center gap-2 px-1 py-1 bg-brand-surface rounded-md border border-brand-border/60 text-xs select-none">
        <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-brand-card border border-brand-border text-slate-200 min-w-[48px] text-center">
          {scoreText}
        </span>
        <div className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden border border-brand-border relative flex">
          <div 
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${whitePercent}%` }}
          />
          <div 
            className="h-full bg-slate-800 transition-all duration-300 ease-out"
            style={{ width: `${100 - whitePercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-6 h-full min-h-[300px] bg-slate-900 rounded-lg overflow-hidden border border-brand-border shadow-inner flex flex-col justify-between select-none flex-shrink-0"
      title={`Stockfish 19 Evaluation: ${scoreText}`}
    >
      {/* Top score label (shows when top side is favored) */}
      <div className="absolute top-1 inset-x-0 z-10 flex justify-center pointer-events-none">
        <span className="text-[10px] font-mono font-extrabold px-1 rounded bg-black/70 text-white backdrop-blur-xs leading-tight">
          {orientation === 'white' && (parseFloat(scoreText) < 0 || scoreText.startsWith('-M')) ? scoreText : ''}
          {orientation === 'black' && (parseFloat(scoreText) > 0 || scoreText.startsWith('+M')) ? scoreText : ''}
        </span>
      </div>

      {/* Black's section (top when orientation is white) */}
      <div 
        className="w-full bg-[#18181b] transition-all duration-300 ease-out"
        style={{ height: `${100 - displayWhitePercent}%` }}
      />

      {/* White's section (bottom when orientation is white) */}
      <div 
        className="w-full bg-[#f8fafc] transition-all duration-300 ease-out shadow-md"
        style={{ height: `${displayWhitePercent}%` }}
      />

      {/* Bottom score label (shows when bottom side is favored) */}
      <div className="absolute bottom-1 inset-x-0 z-10 flex justify-center pointer-events-none">
        <span className="text-[10px] font-mono font-extrabold px-1 rounded bg-white/90 text-slate-950 backdrop-blur-xs leading-tight shadow-sm">
          {orientation === 'white' && (parseFloat(scoreText) >= 0 || scoreText.startsWith('+M')) ? scoreText : ''}
          {orientation === 'black' && (parseFloat(scoreText) <= 0 || scoreText.startsWith('-M')) ? scoreText : ''}
        </span>
      </div>
    </div>
  );
}

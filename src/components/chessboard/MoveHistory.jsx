import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { jumpToMove } from '../../store/slices/chessboardSlice';

export default function MoveHistory() {
  const dispatch = useDispatch();
  const { history, currentMoveIndex } = useSelector((state) => state.chessboard);
  const scrollRef = useRef(null);

  // Group moves into pairs (White move, Black move)
  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      moveNum: Math.floor(i / 2) + 1,
      white: history[i] ? { ...history[i], index: i } : null,
      black: history[i + 1] ? { ...history[i + 1], index: i + 1 } : null
    });
  }

  // Auto scroll to active move
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('.active-move');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [currentMoveIndex]);

  if (history.length === 0) {
    return (
      <div className="py-2.5 px-3 bg-brand-surface border border-brand-border rounded-xl text-center text-xs text-slate-400 select-none">
        Play moves on the board to explore openings.
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="p-2 bg-brand-surface border border-brand-border rounded-xl max-h-24 sm:max-h-28 overflow-y-auto select-none font-mono text-xs"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {/* Starting position button */}
        <button
          onClick={() => dispatch(jumpToMove(-1))}
          className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
            currentMoveIndex === -1 
              ? 'bg-brand-accent/20 text-brand-accent font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Start
        </button>

        {movePairs.map((pair) => (
          <div key={pair.moveNum} className="inline-flex items-center gap-0.5">
            <span className="text-slate-500 text-[11px] font-sans mr-0.5 select-none">{pair.moveNum}.</span>

            {/* White move */}
            {pair.white && (
              <button
                onClick={() => dispatch(jumpToMove(pair.white.index))}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  currentMoveIndex === pair.white.index
                    ? 'bg-brand-accent text-slate-950 font-bold active-move shadow-xs'
                    : 'text-slate-200 hover:bg-brand-hover'
                }`}
              >
                {pair.white.san}
              </button>
            )}

            {/* Black move */}
            {pair.black && (
              <button
                onClick={() => dispatch(jumpToMove(pair.black.index))}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  currentMoveIndex === pair.black.index
                    ? 'bg-brand-accent text-slate-950 font-bold active-move shadow-xs'
                    : 'text-slate-300 hover:bg-brand-hover'
                }`}
              >
                {pair.black.san}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

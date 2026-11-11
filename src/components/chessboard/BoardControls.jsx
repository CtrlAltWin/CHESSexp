import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  jumpToMove, 
  undoMove, 
  redoMove, 
  resetBoard, 
  flipBoard 
} from '../../store/slices/chessboardSlice';
import { exitAnalyzingGame } from '../../store/slices/gamesSlice';
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  RefreshCw, 
  Share2,
  FileText
} from 'lucide-react';

export default function BoardControls({ onOpenFenPgnModal }) {
  const dispatch = useDispatch();
  const { currentMoveIndex, history } = useSelector((state) => state.chessboard);
  const { isAnalyzingGame, returnExplorerState } = useSelector((state) => state.games);

  const canGoBack = currentMoveIndex >= 0;
  const canGoForward = currentMoveIndex < history.length - 1;

  const handleReturnToExplorer = () => {
    if (returnExplorerState) {
      dispatch(jumpToMove(returnExplorerState.currentMoveIndex));
      dispatch(exitAnalyzingGame());
    } else {
      dispatch(exitAnalyzingGame());
      dispatch(resetBoard());
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      {/* Return to Explorer banner if in Click-to-Analyze mode */}
      {isAnalyzingGame && (
        <div className="flex items-center justify-between px-3 py-2 bg-brand-accent/15 border border-brand-accent/40 rounded-xl text-xs text-brand-accent animate-in fade-in">
          <div className="flex items-center gap-1.5 font-medium">
            <span>Analyzing historical game</span>
          </div>
          <button
            onClick={handleReturnToExplorer}
            className="px-2.5 py-1 bg-brand-accent text-slate-950 font-bold rounded-lg hover:bg-brand-accentHover transition-colors text-[11px]"
          >
            ← Back to Explorer
          </button>
        </div>
      )}

      {/* Main Board Navigation Controls */}
      <div className="flex items-center justify-between gap-1.5 p-1 bg-brand-surface border border-brand-border rounded-xl">
        {/* Flip Board */}
        <button
          onClick={() => dispatch(flipBoard())}
          className="p-2 sm:px-3 rounded-lg hover:bg-brand-hover text-slate-300 hover:text-white transition-smooth touch-target sm:min-h-0 flex items-center justify-center"
          title="Flip Board (X)"
          aria-label="Flip Board"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* First Move */}
        <button
          onClick={() => dispatch(jumpToMove(-1))}
          disabled={!canGoBack}
          className="p-2 sm:px-3 rounded-lg hover:bg-brand-hover text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-smooth touch-target sm:min-h-0 flex items-center justify-center"
          title="First Move"
          aria-label="First Move"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Move */}
        <button
          onClick={() => dispatch(undoMove())}
          disabled={!canGoBack}
          className="p-2 sm:px-3 rounded-lg hover:bg-brand-hover text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-smooth touch-target sm:min-h-0 flex items-center justify-center"
          title="Previous Move (Left Arrow)"
          aria-label="Previous Move"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Next Move */}
        <button
          onClick={() => dispatch(redoMove())}
          disabled={!canGoForward}
          className="p-2 sm:px-3 rounded-lg hover:bg-brand-hover text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-smooth touch-target sm:min-h-0 flex items-center justify-center"
          title="Next Move (Right Arrow)"
          aria-label="Next Move"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Move */}
        <button
          onClick={() => dispatch(jumpToMove(history.length - 1))}
          disabled={!canGoForward}
          className="p-2 sm:px-3 rounded-lg hover:bg-brand-hover text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-smooth touch-target sm:min-h-0 flex items-center justify-center"
          title="Last Move"
          aria-label="Last Move"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>

        {/* Reset Board */}
        <button
          onClick={() => dispatch(resetBoard())}
          className="p-2 sm:px-3 rounded-lg hover:bg-brand-hover text-slate-300 hover:text-white transition-smooth touch-target sm:min-h-0 flex items-center justify-center"
          title="Reset to Starting Position"
          aria-label="Reset Board"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* FEN / PGN Modal */}
        <button
          onClick={onOpenFenPgnModal}
          className="p-2 sm:px-3 rounded-lg hover:bg-brand-hover text-slate-300 hover:text-white transition-smooth touch-target sm:min-h-0 flex items-center justify-center"
          title="Share FEN / PGN"
          aria-label="Share FEN / PGN"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

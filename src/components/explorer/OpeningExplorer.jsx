import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove } from '../../store/slices/chessboardSlice';
import { setExplorerMode, fetchPositionStatsAsync } from '../../store/slices/explorerSlice';
import PercentageBar from './PercentageBar';
import { 
  Database, 
  Layers, 
  GitFork, 
  DownloadCloud, 
  CheckCircle2, 
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { openImportModal } from '../../store/slices/importSlice';

export default function OpeningExplorer() {
  const dispatch = useDispatch();
  const { positionStats, mode, isLoading } = useSelector((state) => state.explorer);
  const { selectedProfile, profiles } = useSelector((state) => state.opponent);
  const { normFen, history, currentMoveIndex } = useSelector((state) => state.chessboard);

  const activeProfileObj = profiles.find(p => p.username === selectedProfile) || {
    displayName: selectedProfile,
    totalGames: 0
  };

  const handleModeChange = (newMode) => {
    dispatch(setExplorerMode(newMode));
    const lineMoves = currentMoveIndex >= 0 
      ? history.slice(0, currentMoveIndex + 1).map(h => h.san) 
      : [];
    dispatch(fetchPositionStatsAsync({
      profileUsername: selectedProfile,
      normFen,
      lineMoves,
      mode: newMode
    }));
  };

  const handlePlayContinuation = (moveObj) => {
    dispatch(makeMove({
      from: moveObj.from,
      to: moveObj.to
    }));
  };

  const {
    gamesCount = 0,
    whiteWins = 0,
    draws = 0,
    blackWins = 0,
    whiteWinPct = 0,
    drawPct = 0,
    blackWinPct = 0,
    moves = []
  } = positionStats || {};

  if (!selectedProfile) {
    return (
      <div className="flex flex-col h-full bg-brand-surface border border-brand-border rounded-xl overflow-hidden select-none p-6 items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-card flex items-center justify-center text-brand-accent border border-brand-border mb-3 shadow-xs">
          <Database className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-1">
          Welcome to CHESSexp
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
          No account connected yet. Import your Chess.com games to explore your personal openings, track move frequencies, and prepare responses with Stockfish 19.
        </p>
        <button
          onClick={() => dispatch(openImportModal())}
          className="px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-slate-950 font-bold text-xs transition-smooth shadow-xs flex items-center gap-2"
        >
          <DownloadCloud className="w-4 h-4" />
          <span>Import My Games</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-brand-surface border border-brand-border rounded-xl overflow-hidden select-none">
      
      {/* Explorer Header */}
      <div className="p-3 border-b border-brand-border bg-brand-card/50 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-brand-accent" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-100 tracking-tight">
              Personal Opening Explorer
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-brand-surface p-0.5 rounded-lg border border-brand-border text-[11px]">
            <button
              onClick={() => handleModeChange('position')}
              className={`px-2 py-1 rounded font-medium transition-smooth ${
                mode === 'position'
                  ? 'bg-brand-accent text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Transposition mode: Matches any game reaching this exact chess position"
            >
              Position
            </button>
            <button
              onClick={() => handleModeChange('exact')}
              className={`px-2 py-1 rounded font-medium transition-smooth ${
                mode === 'exact'
                  ? 'bg-brand-accent text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Exact Line mode: Matches only games that followed this exact move order"
            >
              Exact Line
            </button>
          </div>
        </div>

        {/* Database Info Pill */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="truncate">
            Repertoire: <strong className="text-slate-200">{activeProfileObj.displayName || activeProfileObj.username}</strong>
          </span>
          <span className="text-[11px] font-mono text-brand-accent">
            {gamesCount.toLocaleString()} personal games
          </span>
        </div>
      </div>

      {/* Aggregate Position Summary Bar */}
      {gamesCount > 0 && (
        <div className="px-3 py-2 bg-brand-card/30 border-b border-brand-border flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Position Result Distribution:</span>
            <span className="font-mono text-[10px]">
              {whiteWins}W / {draws}D / {blackWins}B
            </span>
          </div>
          <PercentageBar 
            whiteWinPct={whiteWinPct}
            drawPct={drawPct}
            blackWinPct={blackWinPct}
            whiteWins={whiteWins}
            draws={draws}
            blackWins={blackWins}
            showLabels={true}
            height="h-3"
          />
        </div>
      )}

      {/* Continuation Moves Table */}
      <div className="flex-1 overflow-y-auto">
        {moves.length > 0 ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-brand-card border-b border-brand-border text-[11px] font-semibold text-slate-400 uppercase tracking-wider z-10">
              <tr>
                <th className="py-2 px-3">Move</th>
                <th className="py-2 px-2 text-right">Games</th>
                <th className="py-2 px-2 text-right">Freq</th>
                <th className="py-2 px-3 text-center min-w-[130px]">Results (W / D / B)</th>
                <th className="py-2 px-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {moves.map((m, idx) => (
                <tr
                  key={m.san}
                  onClick={() => handlePlayContinuation(m)}
                  className="hover:bg-brand-hover/70 cursor-pointer transition-colors group"
                >
                  {/* Move SAN */}
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-100 group-hover:text-brand-accent flex items-center gap-1.5">
                    <span className="text-slate-500 font-normal text-[10px] w-3">{idx + 1}.</span>
                    <span>{m.san}</span>
                  </td>

                  {/* Games Count */}
                  <td className="py-2.5 px-2 text-right font-mono text-slate-300">
                    {m.gamesCount.toLocaleString()}
                  </td>

                  {/* Frequency */}
                  <td className="py-2.5 px-2 text-right font-mono text-slate-400 text-[11px]">
                    {m.frequencyPct}%
                  </td>

                  {/* Percentage Bar */}
                  <td className="py-2.5 px-3">
                    <PercentageBar
                      whiteWinPct={m.whiteWinPct}
                      drawPct={m.drawPct}
                      blackWinPct={m.blackWinPct}
                      whiteWins={m.whiteWins}
                      draws={m.draws}
                      blackWins={m.blackWins}
                      height="h-3.5"
                    />
                  </td>

                  {/* Score % */}
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-200 text-[11px]">
                    {m.scorePct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Empty State */
          <div className="p-6 text-center flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-card flex items-center justify-center text-slate-500 border border-brand-border">
              <Database className="w-6 h-6 text-slate-500" />
            </div>
            <div className="max-w-xs">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                {gamesCount === 0 
                  ? 'No Historical Games Reached This Position' 
                  : 'End of Opening Line'}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {gamesCount === 0
                  ? `Neither ${activeProfileObj.displayName || 'this player'} nor their opponents have reached this position in the imported archive.`
                  : 'No further moves were recorded from this position.'}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => dispatch(openImportModal())}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-card hover:bg-brand-hover border border-brand-border text-xs text-slate-200 transition-smooth"
                >
                  <DownloadCloud className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Import More Games</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explorer Footer Status */}
      <div className="p-2 border-t border-brand-border bg-brand-card/40 text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-brand-accent" />
          <span>Real Chess.com Archive Data</span>
        </span>
        <span>Click move to play</span>
      </div>

    </div>
  );
}


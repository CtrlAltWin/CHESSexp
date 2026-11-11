import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchMatchingGamesAsync, 
  setFilter, 
  startAnalyzingGame 
} from '../../store/slices/gamesSlice';
import { loadPgnGame } from '../../store/slices/chessboardSlice';
import { 
  History, 
  Filter, 
  ExternalLink, 
  Play, 
  Calendar, 
  Clock, 
  Swords,
  Award,
  ChevronRight
} from 'lucide-react';

export default function HistoricalGamesList() {
  const dispatch = useDispatch();
  const { matchingGames, filters, isLoading } = useSelector((state) => state.games);
  const { positionStats } = useSelector((state) => state.explorer);
  const { selectedProfile } = useSelector((state) => state.opponent);
  const chessboard = useSelector((state) => state.chessboard);

  const gameIds = positionStats?.gameIds || [];

  // When gameIds change or filters change, fetch matching games from IndexedDB
  useEffect(() => {
    dispatch(fetchMatchingGamesAsync({ gameIds, filters }));
  }, [gameIds, filters, dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilter({ key, value }));
  };

  const handleAnalyzeGame = (game) => {
    // 1. Save current explorer state so user can return without losing their place
    const savedExplorerState = {
      fen: chessboard.fen,
      normFen: chessboard.normFen,
      history: chessboard.history,
      currentMoveIndex: chessboard.currentMoveIndex
    };

    // 2. Start analyzing game in gamesSlice
    dispatch(startAnalyzingGame({ game, savedExplorerState }));

    // 3. Find the move index in this game where the current position occurred
    // Default to the end or matching move
    dispatch(loadPgnGame({
      pgn: game.pgn,
      targetMoveIndex: chessboard.currentMoveIndex >= 0 ? chessboard.currentMoveIndex : 0
    }));
  };

  return (
    <div className="flex flex-col h-full bg-brand-surface border border-brand-border rounded-xl overflow-hidden select-none">
      
      {/* Header */}
      <div className="p-3 border-b border-brand-border bg-brand-card/50 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-brand-accent" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-100">
              Matching Historical Games
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {matchingGames.length} shown / {gameIds.length} total
          </span>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Result Filter */}
          <select
            value={filters.result}
            onChange={(e) => handleFilterChange('result', e.target.value)}
            className="px-2 py-1 bg-brand-surface border border-brand-border rounded-lg text-slate-300 text-[11px] focus:outline-none focus:border-brand-accent"
          >
            <option value="all">All Results</option>
            <option value="win">White Wins (1-0)</option>
            <option value="draw">Draws (½-½)</option>
            <option value="loss">Black Wins (0-1)</option>
          </select>

          {/* Color Filter */}
          <select
            value={filters.color}
            onChange={(e) => handleFilterChange('color', e.target.value)}
            className="px-2 py-1 bg-brand-surface border border-brand-border rounded-lg text-slate-300 text-[11px] focus:outline-none focus:border-brand-accent"
          >
            <option value="all">All Colours</option>
            <option value="white">As White</option>
            <option value="black">As Black</option>
          </select>

          {/* Time Control Filter */}
          <select
            value={filters.timeClass}
            onChange={(e) => handleFilterChange('timeClass', e.target.value)}
            className="px-2 py-1 bg-brand-surface border border-brand-border rounded-lg text-slate-300 text-[11px] focus:outline-none focus:border-brand-accent"
          >
            <option value="all">All Speeds</option>
            <option value="bullet">Bullet</option>
            <option value="blitz">Blitz</option>
            <option value="rapid">Rapid</option>
            <option value="daily">Daily</option>
          </select>
        </div>
      </div>

      {/* Games List */}
      <div className="flex-1 overflow-y-auto divide-y divide-brand-border/40">
        {matchingGames.length > 0 ? (
          matchingGames.map((game) => {
            const isUserWhite = game.white.username.toLowerCase() === selectedProfile.toLowerCase();
            const opponent = isUserWhite ? game.black : game.white;
            const myInfo = isUserWhite ? game.white : game.black;

            // Result pill
            let resultText = '½-½';
            let resultClass = 'bg-slate-500/20 text-slate-300 border-slate-500/40';
            if (game.boardResult === '1-0') {
              resultText = '1-0';
              resultClass = isUserWhite 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40';
            } else if (game.boardResult === '0-1') {
              resultText = '0-1';
              resultClass = isUserWhite 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
            }

            return (
              <div
                key={game.id}
                onClick={() => handleAnalyzeGame(game)}
                className="p-3 hover:bg-brand-hover/70 transition-colors cursor-pointer group flex flex-col gap-2"
              >
                {/* Players & Result */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-3 h-3 rounded-full flex-shrink-0 border border-brand-border"
                          style={{ backgroundColor: isUserWhite ? '#ffffff' : '#1e293b' }}
                          title={`Played as ${isUserWhite ? 'White' : 'Black'}`}
                    />
                    <div className="flex items-center gap-1.5 truncate text-xs">
                      <strong className="text-slate-100 truncate">
                        vs {opponent.username}
                      </strong>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({opponent.rating})
                      </span>
                    </div>
                  </div>

                  {/* Result Badge */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${resultClass}`}>
                      {resultText}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyzeGame(game);
                      }}
                      className="p-1 rounded hover:bg-brand-card text-slate-400 group-hover:text-brand-accent transition-colors"
                      title="Load game on analysis board"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate text-slate-300">
                    {game.openingName || 'Standard Opening'}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[10px]">
                    <span className="capitalize">{game.timeClass}</span>
                    <span>•</span>
                    <span>{game.date}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center h-full gap-2">
            <History className="w-8 h-8 text-slate-600 mb-1" />
            <span>No historical games match the current filters.</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-brand-border bg-brand-card/40 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Click any game to load & analyze</span>
        <span>{matchingGames.length} available</span>
      </div>

    </div>
  );
}

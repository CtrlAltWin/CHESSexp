import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BrandHeader from './components/brand/BrandHeader';
import ChessboardView from './components/chessboard/ChessboardView';
import EvalBar from './components/chessboard/EvalBar';
import BoardControls from './components/chessboard/BoardControls';
import MoveHistory from './components/chessboard/MoveHistory';
import OpeningExplorer from './components/explorer/OpeningExplorer';
import EnginePanel from './components/engine/EnginePanel';
import HistoricalGamesList from './components/games/HistoricalGamesList';
import RepertoireDashboard from './components/dashboard/RepertoireDashboard';
import GameImportModal from './components/importer/GameImportModal';
import SettingsModal from './components/common/SettingsModal';
import FenPgnModal from './components/common/FenPgnModal';
import BishopLogo from './components/brand/BishopLogo';

import { loadProfilesAsync, setSelectedProfile } from './store/slices/opponentSlice';
import { loadSampleDatasetAsync, openImportModal } from './store/slices/importSlice';
import { fetchPositionStatsAsync } from './store/slices/explorerSlice';
import { updateEvaluation } from './store/slices/engineSlice';
import { 
  undoMove, 
  redoMove, 
  jumpToMove, 
  flipBoard 
} from './store/slices/chessboardSlice';
import { stockfishService } from './services/engine/stockfishService';

import { 
  Database, 
  Cpu, 
  History, 
  BarChart2, 
  Layers, 
  DownloadCloud, 
  Settings, 
  BookOpen,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const dispatch = useDispatch();

  // Redux state
  const { fen, normFen, orientation, history } = useSelector((state) => state.chessboard);
  const { selectedProfile, profiles } = useSelector((state) => state.opponent);
  const { mode: explorerMode } = useSelector((state) => state.explorer);
  const { isEnabled: engineEnabled, maxDepth, multiPV } = useSelector((state) => state.engine);
  const { isAnalyzingGame, selectedGame } = useSelector((state) => state.games);

  // App view state
  const [activeView, setActiveView] = useState('analysis'); // 'analysis' | 'dashboard'
  const [mobileTab, setMobileTab] = useState('explorer'); // 'explorer' | 'engine' | 'games'
  const [desktopRightTab, setDesktopRightTab] = useState('explorer'); // 'explorer' | 'engine' | 'games'
  
  // Modals
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fenPgnOpen, setFenPgnOpen] = useState(false);

  // Board width calculation
  const boardContainerRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(480);

  // Measure board container width dynamically to keep 1:1 aspect ratio without clipping
  useEffect(() => {
    function handleResize() {
      if (boardContainerRef.current) {
        const availableWidth = boardContainerRef.current.clientWidth - 8;
        const availableHeight = window.innerHeight - 260; // leave room for header & controls
        const optimalSize = Math.max(280, Math.min(availableWidth, availableHeight, 560));
        setBoardWidth(optimalSize);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeView]);

  // Initial load: Fetch profiles or seed sample dataset
  useEffect(() => {
    dispatch(loadProfilesAsync()).then((res) => {
      const loadedProfiles = res.payload || [];
      if (loadedProfiles.length === 0) {
        // Automatically seed curated Hikaru Nakamura sample dataset
        dispatch(loadSampleDatasetAsync('hikaru'));
      }
    });
  }, [dispatch]);

  // Whenever board position changes or profile changes, fetch Opening Explorer statistics
  useEffect(() => {
    if (selectedProfile && normFen) {
      const lineMoves = history.map(h => h.san);
      dispatch(fetchPositionStatsAsync({
        profileUsername: selectedProfile,
        normFen,
        lineMoves,
        mode: explorerMode
      }));
    }
  }, [normFen, selectedProfile, explorerMode, history, dispatch]);

  // Stockfish 19 Engine lifecycle
  useEffect(() => {
    // Configure engine callback
    stockfishService.setCallbacks({
      onEvaluation: (evalData) => {
        dispatch(updateEvaluation(evalData));
      }
    });

    if (engineEnabled && fen) {
      stockfishService.analyze(fen, { depth: maxDepth, multiPV });
    } else {
      stockfishService.stop();
    }

    return () => {
      stockfishService.stop();
    };
  }, [fen, engineEnabled, maxDepth, multiPV, dispatch]);

  // Keyboard controls for move history and board interaction
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when user is typing in inputs or when modals are open
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }
      if (settingsOpen || fenPgnOpen) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'h') {
        e.preventDefault();
        dispatch(undoMove());
      } else if (e.key === 'ArrowRight' || e.key === 'k' || e.key === 'l') {
        e.preventDefault();
        dispatch(redoMove());
      } else if (e.key === 'ArrowUp' || e.key === 'Home') {
        e.preventDefault();
        dispatch(jumpToMove(-1));
      } else if (e.key === 'ArrowDown' || e.key === 'End') {
        e.preventDefault();
        dispatch(jumpToMove(history.length - 1));
      } else if (e.key === 'f' || e.key === 'x') {
        e.preventDefault();
        dispatch(flipBoard());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history.length, settingsOpen, fenPgnOpen, dispatch]);

  return (
    <div className="min-h-screen bg-brand-bg text-slate-100 flex flex-col overflow-x-hidden">
      
      {/* Brand Header */}
      <BrandHeader 
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenFenPgnModal={() => setFenPgnOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col">
        {activeView === 'dashboard' ? (
          <RepertoireDashboard onAnalyzeOpening={() => setActiveView('analysis')} />
        ) : (
          /* Analysis Workspace (Responsive 3-Column on Desktop, Progressive Mobile on small screens) */
          <div className="flex-1 max-w-[1720px] w-full mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
            
            {/* Desktop Left Column: Profiles & Fast Navigation (hidden on mobile, visible >= 1280px or 1024px) */}
            <aside className="hidden xl:flex xl:col-span-2 flex-col gap-3">
              {/* User Repertoire Overview Card */}
              <div className="p-3.5 bg-brand-surface border border-brand-border rounded-xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Repertoire</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-accent/15 text-brand-accent font-bold">
                    Personalized
                  </span>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-brand-card border border-brand-border/60">
                  <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center font-bold text-xs text-brand-accent">
                    {selectedProfile.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col truncate">
                    <strong className="text-xs text-slate-100 truncate">{selectedProfile}</strong>
                    <span className="text-[10px] text-slate-400">Primary Account</span>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(openImportModal())}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-brand-card hover:bg-brand-hover border border-brand-border text-xs font-semibold text-slate-200 transition-smooth"
                >
                  <DownloadCloud className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Import My Games</span>
                </button>
              </div>

              {/* Quick Profile Switcher */}
              <div className="p-3 bg-brand-surface border border-brand-border rounded-xl flex flex-col gap-2 flex-1 max-h-[380px] overflow-y-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Account
                </span>
                <div className="flex flex-col gap-1">
                  {profiles.map((p) => {
                    const isSelected = p.username === selectedProfile;
                    return (
                      <button
                        key={p.username}
                        onClick={() => dispatch(setSelectedProfile(p.username))}
                        className={`w-full px-2.5 py-2 rounded-lg text-left text-xs flex items-center justify-between transition-smooth ${
                          isSelected
                            ? 'bg-brand-accent/20 border border-brand-accent text-brand-accent font-bold'
                            : 'hover:bg-brand-hover text-slate-300'
                        }`}
                      >
                        <span className="truncate">{p.displayName || p.username}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-1">
                          {p.totalGames || 0}g
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lab Philosophy Badge */}
              <div className="p-3 bg-brand-surface/60 border border-brand-border/60 rounded-xl text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-300 block mb-1">Your Personal Chess Lab</strong>
                Opening statistics are built strictly from your own games. Discover what moves you actually play, find where you struggle, and prepare responses with Stockfish 19.
              </div>
            </aside>

            {/* Center Column: Chessboard, Eval Bar & Board Controls */}
            <div className="lg:col-span-7 xl:col-span-5 flex flex-col gap-2 sm:gap-3 items-center">
              
              {/* Mobile Evaluation Bar (horizontal on small screens) */}
              <div className="w-full lg:hidden">
                <EvalBar orientation={orientation} isMobile={true} />
              </div>

              {/* Board and Vertical Eval Bar Container */}
              <div 
                ref={boardContainerRef}
                className="w-full flex items-center justify-center gap-2 sm:gap-3"
              >
                {/* Vertical Eval Bar (Desktop) */}
                <div className="hidden lg:block h-[min(100vw-32px,580px)]">
                  <EvalBar orientation={orientation} isMobile={false} />
                </div>

                {/* Chessboard */}
                <div className="flex-1 flex justify-center max-w-[580px]">
                  <ChessboardView boardWidth={boardWidth} />
                </div>
              </div>

              {/* Move Navigation & History */}
              <div className="w-full max-w-[580px] flex flex-col gap-2">
                <BoardControls onOpenFenPgnModal={() => setFenPgnOpen(true)} />
                <MoveHistory />
              </div>

            </div>

            {/* Right Column: Opening Explorer / Engine / Historical Games (Desktop tabs or side-by-side) */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-3 h-full min-h-[460px]">
              
              {/* Desktop Tab Selector */}
              <div className="flex items-center gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl">
                <button
                  onClick={() => setDesktopRightTab('explorer')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-smooth ${
                    desktopRightTab === 'explorer'
                      ? 'bg-brand-accent text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Opening Explorer</span>
                </button>

                <button
                  onClick={() => setDesktopRightTab('engine')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-smooth ${
                    desktopRightTab === 'engine'
                      ? 'bg-brand-accent text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Stockfish 19</span>
                </button>

                <button
                  onClick={() => setDesktopRightTab('games')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-smooth ${
                    desktopRightTab === 'games'
                      ? 'bg-brand-accent text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Matching Games</span>
                </button>
              </div>

              {/* Active Tab Panel */}
              <div className="flex-1 min-h-[420px] max-h-[640px]">
                {desktopRightTab === 'explorer' && <OpeningExplorer />}
                {desktopRightTab === 'engine' && <EnginePanel />}
                {desktopRightTab === 'games' && <HistoricalGamesList />}
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation (Touch-Friendly, min 44px) */}
      <nav className="sm:hidden sticky bottom-0 z-40 bg-brand-surface border-t border-brand-border px-2 py-1 flex items-center justify-around select-none">
        <button
          onClick={() => { setActiveView('analysis'); setDesktopRightTab('explorer'); }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg touch-target ${
            activeView === 'analysis' && desktopRightTab === 'explorer'
              ? 'text-brand-accent font-bold'
              : 'text-slate-400'
          }`}
        >
          <Database className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Explorer</span>
        </button>

        <button
          onClick={() => { setActiveView('analysis'); setDesktopRightTab('engine'); }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg touch-target ${
            activeView === 'analysis' && desktopRightTab === 'engine'
              ? 'text-brand-accent font-bold'
              : 'text-slate-400'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Engine</span>
        </button>

        <button
          onClick={() => { setActiveView('analysis'); setDesktopRightTab('games'); }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg touch-target ${
            activeView === 'analysis' && desktopRightTab === 'games'
              ? 'text-brand-accent font-bold'
              : 'text-slate-400'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Games</span>
        </button>

        <button
          onClick={() => setActiveView(activeView === 'dashboard' ? 'analysis' : 'dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg touch-target ${
            activeView === 'dashboard'
              ? 'text-brand-accent font-bold'
              : 'text-slate-400'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Dashboard</span>
        </button>
      </nav>

      {/* Modals */}
      <GameImportModal />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <FenPgnModal isOpen={fenPgnOpen} onClose={() => setFenPgnOpen(false)} />

    </div>
  );
}


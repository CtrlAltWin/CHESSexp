import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  closeImportModal, 
  importChessComUserAsync, 
  importPgnTextAsync, 
  loadSampleDatasetAsync,
  resetImportState
} from '../../store/slices/importSlice';
import { 
  X, 
  DownloadCloud, 
  User, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Database
} from 'lucide-react';
import { SAMPLE_PROFILES } from '../../services/api/sampleGames';

export default function GameImportModal() {
  const dispatch = useDispatch();
  const { 
    isModalOpen, 
    isImporting, 
    progress, 
    statusMessage, 
    totalFound, 
    importedCount, 
    duplicateCount, 
    error, 
    isSuccess 
  } = useSelector((state) => state.import);

  const [activeTab, setActiveTab] = useState('chesscom'); // 'chesscom' | 'sample' | 'pgn'
  const [username, setUsername] = useState('');
  const [maxArchives, setMaxArchives] = useState(6); // Default 6 months of archives
  const [pgnText, setPgnText] = useState('');
  const [pgnUsername, setPgnUsername] = useState('My Games');

  if (!isModalOpen) return null;

  const handleStartChessComImport = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    dispatch(importChessComUserAsync({
      username: username.trim(),
      maxArchives: parseInt(maxArchives, 10)
    }));
  };

  const handleLoadSample = (sampleUser) => {
    dispatch(loadSampleDatasetAsync(sampleUser));
  };

  const handlePgnImport = (e) => {
    e.preventDefault();
    if (!pgnText.trim()) return;
    dispatch(importPgnTextAsync({
      targetUsername: pgnUsername.trim() || 'My Games',
      pgnText
    }));
  };

  const handleClose = () => {
    if (!isImporting) {
      dispatch(closeImportModal());
      dispatch(resetImportState());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-brand-card border border-brand-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface">
          <div className="flex items-center gap-2">
            <DownloadCloud className="w-5 h-5 text-brand-accent" />
            <h2 className="text-base font-bold text-slate-100">
              Import Historical Games
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-brand-hover transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-4">
          
          {/* Tabs */}
          {!isImporting && !isSuccess && (
            <div className="flex border-b border-brand-border text-xs font-semibold">
              <button
                onClick={() => setActiveTab('chesscom')}
                className={`flex-1 py-2 text-center border-b-2 transition-smooth ${
                  activeTab === 'chesscom'
                    ? 'border-brand-accent text-brand-accent font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Chess.com Account
              </button>
              <button
                onClick={() => setActiveTab('sample')}
                className={`flex-1 py-2 text-center border-b-2 transition-smooth ${
                  activeTab === 'sample'
                    ? 'border-brand-accent text-brand-accent font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sample Opponents
              </button>
              <button
                onClick={() => setActiveTab('pgn')}
                className={`flex-1 py-2 text-center border-b-2 transition-smooth ${
                  activeTab === 'pgn'
                    ? 'border-brand-accent text-brand-accent font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Paste / Upload PGN
              </button>
            </div>
          )}

          {/* Active Progress View */}
          {isImporting && (
            <div className="py-6 px-4 flex flex-col items-center justify-center text-center gap-4">
              <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
              <div className="w-full max-w-sm flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-slate-300 font-mono">
                  <span>Progress</span>
                  <span className="font-bold text-brand-accent">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-brand-surface rounded-full overflow-hidden border border-brand-border">
                  <div
                    className="h-full bg-brand-accent transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 min-h-[32px] leading-relaxed">
                  {statusMessage || 'Processing games...'}
                </p>
              </div>
            </div>
          )}

          {/* Success View */}
          {!isImporting && isSuccess && (
            <div className="py-6 px-4 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 mb-1">
                  Import Completed Successfully
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {statusMessage}
                </p>
                <div className="p-3 bg-brand-surface rounded-xl border border-brand-border text-xs flex justify-around mb-4 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Games Found</span>
                    <strong className="text-slate-100">{totalFound}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Imported</span>
                    <strong className="text-emerald-400">{importedCount}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Duplicates Skipped</span>
                    <strong className="text-slate-400">{duplicateCount}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-slate-950 font-bold text-xs transition-smooth"
              >
                Start Exploring Openings
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && !isImporting && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="font-semibold block">Import Error</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Tab 1: Chess.com Account */}
          {!isImporting && !isSuccess && activeTab === 'chesscom' && (
            <form onSubmit={handleStartChessComImport} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chess.com Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. magnuscarlsen, hikaru, or your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Archives to Download
                </label>
                <select
                  value={maxArchives}
                  onChange={(e) => setMaxArchives(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-accent"
                >
                  <option value={3}>Last 3 months of games</option>
                  <option value={6}>Last 6 months of games (Recommended)</option>
                  <option value={12}>Last 12 months of games</option>
                  <option value={24}>Last 24 months of games</option>
                </select>
              </div>

              <div className="p-3 bg-brand-surface rounded-xl border border-brand-border/60 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-300 block mb-0.5">Personalized Statistics Guarantee:</strong>
                All opening continuations, win/loss rates, and transpositions will be calculated strictly from this account's historical games. No synthetic master databases are used.
              </div>

              <button
                type="submit"
                disabled={!username.trim()}
                className="mt-2 w-full py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-slate-950 font-bold text-xs transition-smooth disabled:opacity-40"
              >
                Fetch & Index Games
              </button>
            </form>
          )}

          {/* Tab 2: Sample Opponents */}
          {!isImporting && !isSuccess && activeTab === 'sample' && (
            <div className="flex flex-col gap-2.5">
              <p className="text-xs text-slate-400 mb-1">
                Select a top grandmaster opponent profile to instantly explore their historical opening repertoire without waiting for downloads:
              </p>

              {SAMPLE_PROFILES.map((prof) => (
                <div
                  key={prof.username}
                  className="p-3 bg-brand-surface hover:bg-brand-hover border border-brand-border rounded-xl flex items-center justify-between transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prof.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-brand-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-xs text-slate-100">{prof.displayName}</strong>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          {prof.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">@{prof.username}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLoadSample(prof.username)}
                    className="px-3 py-1.5 rounded-lg bg-brand-card hover:bg-brand-accent hover:text-slate-950 border border-brand-border text-xs font-semibold text-slate-200 transition-smooth"
                  >
                    Load Database
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Paste / Upload PGN */}
          {!isImporting && !isSuccess && activeTab === 'pgn' && (
            <form onSubmit={handlePgnImport} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Collection Name / Target Profile
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Games or Tournament Prep"
                  value={pgnUsername}
                  onChange={(e) => setPgnUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-slate-100 text-xs focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  PGN Text (Single or Multiple Games)
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste PGN here... e.g. 1. e4 c5 2. Nf3 d6..."
                  value={pgnText}
                  onChange={(e) => setPgnText(e.target.value)}
                  className="w-full p-3 bg-brand-surface border border-brand-border rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>

              <button
                type="submit"
                disabled={!pgnText.trim()}
                className="w-full py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-slate-950 font-bold text-xs transition-smooth disabled:opacity-40"
              >
                Parse & Index PGN
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

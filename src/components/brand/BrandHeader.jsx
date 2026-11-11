import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BishopLogo from './BishopLogo';
import { setSelectedProfile, removeProfileAsync } from '../../store/slices/opponentSlice';
import { openImportModal } from '../../store/slices/importSlice';
import { setTheme, toggleSound } from '../../store/slices/settingsSlice';
import { fetchPositionStatsAsync } from '../../store/slices/explorerSlice';
import { 
  Users, 
  DownloadCloud, 
  BarChart2, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Settings, 
  ChevronDown,
  Layers,
  ArrowLeft,
  Trash2,
  UserPlus
} from 'lucide-react';

export default function BrandHeader({ 
  activeView, 
  setActiveView, 
  onOpenSettings,
  onOpenFenPgnModal 
}) {
  const dispatch = useDispatch();
  const { selectedProfile, profiles } = useSelector((state) => state.opponent);
  const { theme, soundEnabled } = useSelector((state) => state.settings);
  const { isAnalyzingGame, selectedGame } = useSelector((state) => state.games);
  const normFen = useSelector((state) => state.chessboard.normFen);
  const mode = useSelector((state) => state.explorer.mode);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeProfObj = profiles.find(p => p.username === selectedProfile) || {
    displayName: selectedProfile || 'Hikaru Nakamura',
    totalGames: 10,
    title: 'GM'
  };

  const handleSelectProfile = (username) => {
    dispatch(setSelectedProfile(username));
    dispatch(fetchPositionStatsAsync({
      profileUsername: username,
      normFen,
      mode
    }));
    setDropdownOpen(false);
  };

  return (
    <header className="bg-brand-surface border-b border-brand-border sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Wordmark & Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView('analysis')}>
          <BishopLogo size={34} tiltAngle={16} accentColor="#48c774" withGlow />
          <div className="flex items-baseline tracking-tight font-extrabold text-lg sm:text-xl">
            <span className="text-slate-100 font-black tracking-wider">CHESS</span>
            <span className="text-brand-accent ml-0.5 font-bold">exp</span>
          </div>
          <span className="hidden md:inline-block text-[10px] font-semibold tracking-wider text-slate-400 bg-brand-card px-2 py-0.5 rounded-full border border-brand-border/60 uppercase">
            Opening Lab
          </span>
        </div>

        {/* Center: Repertoire / Account Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-card hover:bg-brand-hover border border-brand-border text-xs sm:text-sm font-medium transition-smooth max-w-[200px] sm:max-w-[270px]"
            title="Switch Player Repertoire"
          >
            <Users className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
            <div className="flex flex-col text-left truncate">
              <span className="text-[10px] text-slate-400 leading-tight">My Repertoire</span>
              <span className="truncate text-slate-200 font-semibold leading-tight">
                {selectedProfile ? (activeProfObj?.displayName || activeProfObj?.username) : 'Connect Account'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto flex-shrink-0" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div 
              className="absolute left-0 sm:right-0 sm:left-auto mt-1 w-72 bg-brand-card border border-brand-border rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-brand-border/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                <span>Player Accounts</span>
                <span className="text-brand-accent">{profiles.length} connected</span>
              </div>
              
              <div className="max-h-60 overflow-y-auto py-1">
                {profiles.map((p) => {
                  const isSelected = p.username === selectedProfile;
                  return (
                    <div
                      key={p.username}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-smooth group ${
                        isSelected 
                          ? 'bg-brand-accent/15 text-brand-accent font-semibold' 
                          : 'text-slate-300 hover:bg-brand-hover'
                      }`}
                    >
                      <button
                        onClick={() => handleSelectProfile(p.username)}
                        className="flex items-center gap-2 truncate flex-1 text-left"
                      >
                        {p.avatar ? (
                          <img src={p.avatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0 border border-brand-border" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-brand-surface flex items-center justify-center text-[10px] text-slate-300 font-bold border border-brand-border">
                            {p.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate">{p.displayName || p.username}</span>
                      </button>

                      <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.totalGames || 0}g
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete account "${p.displayName || p.username}" and all its imported games?`)) {
                              dispatch(removeProfileAsync(p.username));
                            }
                          }}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {profiles.length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                    <UserPlus className="w-5 h-5 text-slate-400 mb-1" />
                    <span>No account connected yet.</span>
                    <span className="text-[10px]">Import your Chess.com games below.</span>
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-brand-border/60">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    dispatch(openImportModal());
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-brand-accent hover:bg-brand-accentHover text-slate-950 text-xs font-semibold transition-smooth"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Import My Chess.com Games</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Tools & Nav Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Import Button */}
          <button
            onClick={() => dispatch(openImportModal())}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-brand-card hover:bg-brand-hover border border-brand-border text-xs font-medium text-slate-200 transition-smooth touch-target sm:min-h-0"
            title="Import Chess.com Account or PGN"
          >
            <DownloadCloud className="w-4 h-4 text-brand-accent" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Repertoire Dashboard Switcher */}
          <button
            onClick={() => setActiveView(activeView === 'dashboard' ? 'analysis' : 'dashboard')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-smooth touch-target sm:min-h-0 ${
              activeView === 'dashboard'
                ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                : 'bg-brand-card hover:bg-brand-hover border-brand-border text-slate-200'
            }`}
            title="Personal Repertoire Dashboard"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden md:inline">Dashboard</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => dispatch(toggleSound())}
            className="p-2 rounded-lg bg-brand-card hover:bg-brand-hover border border-brand-border text-slate-300 hover:text-white transition-smooth touch-target sm:min-h-0"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
            className="p-2 rounded-lg bg-brand-card hover:bg-brand-hover border border-brand-border text-slate-300 hover:text-white transition-smooth touch-target sm:min-h-0"
            title="Toggle Light / Dark Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-brand-card hover:bg-brand-hover border border-brand-border text-slate-300 hover:text-white transition-smooth touch-target sm:min-h-0"
            title="Preferences & Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}


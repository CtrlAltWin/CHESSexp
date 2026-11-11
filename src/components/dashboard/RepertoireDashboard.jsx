import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getProfileDashboardData } from '../../services/storage/dbOperations';
import { setSelectedProfile } from '../../store/slices/opponentSlice';
import { openImportModal } from '../../store/slices/importSlice';
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Award, 
  Swords, 
  Target, 
  DownloadCloud, 
  Calendar,
  Users,
  ChevronRight
} from 'lucide-react';

export default function RepertoireDashboard({ onAnalyzeOpening }) {
  const dispatch = useDispatch();
  const { selectedProfile, profiles } = useSelector((state) => state.opponent);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getProfileDashboardData(selectedProfile);
        setData(res);
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedProfile]);

  const activeProfile = profiles.find(p => p.username === selectedProfile) || {
    displayName: selectedProfile,
    totalGames: 0
  };

  const profile = data?.profile || activeProfile;
  const totalGames = profile.totalGames || 0;

  const whiteTotal = (profile.whiteWins || 0) + (profile.whiteLosses || 0) + (profile.whiteDraws || 0);
  const whiteWinRate = whiteTotal > 0 ? Math.round(((profile.whiteWins || 0) / whiteTotal) * 100) : 0;

  const blackTotal = (profile.blackWins || 0) + (profile.blackLosses || 0) + (profile.blackDraws || 0);
  const blackWinRate = blackTotal > 0 ? Math.round(((profile.blackWins || 0) / blackTotal) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Profile Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Repertoire Preparation Lab
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-brand-accent/20 border border-brand-accent text-brand-accent text-xs font-bold">
              {profile.displayName || profile.username}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Statistical breakdown of openings, weaknesses, and performance from imported historical games.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(openImportModal())}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-slate-950 text-xs font-bold transition-smooth shadow-sm"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Import Games</span>
          </button>
        </div>
      </div>

      {/* Primary Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Games */}
        <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Games</span>
            <Swords className="w-4 h-4 text-brand-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-100">
            {totalGames.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            {whiteTotal} as White • {blackTotal} as Black
          </span>
        </div>

        {/* Overall Win Rate */}
        <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Win Rate</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-brand-accent">
            {profile.winRate || 0}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            {(profile.whiteWins || 0) + (profile.blackWins || 0)} wins recorded
          </span>
        </div>

        {/* White Win Rate */}
        <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">White Win Rate</span>
            <span className="w-3.5 h-3.5 rounded-full bg-white border border-brand-border inline-block" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-100">
            {whiteWinRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            {profile.whiteWins || 0}W / {profile.whiteDraws || 0}D / {profile.whiteLosses || 0}L
          </span>
        </div>

        {/* Black Win Rate */}
        <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Black Win Rate</span>
            <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 inline-block" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-sky-400">
            {blackWinRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            {profile.blackWins || 0}W / {profile.blackDraws || 0}D / {profile.blackLosses || 0}L
          </span>
        </div>
      </div>

      {/* Main Analysis Sections: Best vs Weakest Openings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Best Performing Openings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Strongest Openings (Repertoire Pillars)
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-brand-border/40">
            {data?.bestOpenings && data.bestOpenings.length > 0 ? (
              data.bestOpenings.map((op) => (
                <div key={op.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex flex-col truncate pr-2">
                    <span className="font-bold text-slate-200 truncate">{op.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {op.gamesCount} games ({op.wins}W / {op.draws}D / {op.losses}L)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                      {op.winRate}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Play or import at least 3 games per opening to generate high-confidence ratings.
              </div>
            )}
          </div>
        </div>

        {/* Weakest Openings (Preparation Target) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Preparation Targets (Vulnerable Lines)
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-brand-border/40">
            {data?.weakestOpenings && data.weakestOpenings.length > 0 ? (
              data.weakestOpenings.map((op) => (
                <div key={op.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex flex-col truncate pr-2">
                    <span className="font-bold text-slate-200 truncate">{op.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {op.gamesCount} games ({op.wins}W / {op.draws}D / {op.losses}L)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono font-bold">
                      {op.winRate}% win
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No significant vulnerabilities identified yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Most Frequently Played Openings Breakdown */}
      <div className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand-accent" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Most Frequently Reached Openings
            </h2>
          </div>
          <span className="text-xs text-slate-400">Frequency breakdown</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {data?.openingsList && data.openingsList.length > 0 ? (
            data.openingsList.map((op) => {
              const pctOfAll = totalGames > 0 ? Math.round((op.gamesCount / totalGames) * 100) : 0;
              return (
                <div 
                  key={op.name}
                  className="p-3 rounded-xl bg-brand-card border border-brand-border flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-slate-100 truncate">{op.name}</strong>
                    <span className="font-mono text-brand-accent font-bold">{pctOfAll}% ({op.gamesCount})</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                    <div 
                      className="bg-brand-accent h-full transition-all" 
                      style={{ width: `${pctOfAll}%` }} 
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Performance: {op.winRate}% win rate</span>
                    <span>{op.wins}W • {op.draws}D • {op.losses}L</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 py-8 text-center text-xs text-slate-400">
              No openings data available. Import games to view your repertoire profile.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

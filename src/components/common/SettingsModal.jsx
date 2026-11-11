import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setTheme, 
  setBoardTheme, 
  toggleSound, 
  toggleCoordinates, 
  toggleLegalMoves, 
  toggleAutoEngine 
} from '../../store/slices/settingsSlice';
import { X, Sliders, Volume2, Moon, Sun, Eye, Grid } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);

  if (!isOpen) return null;

  const boardThemes = [
    { id: 'green', name: 'Chess.com Green', light: '#eeeed2', dark: '#769656' },
    { id: 'blue', name: 'Ocean Blue', light: '#e1e7ed', dark: '#68889e' },
    { id: 'wood', name: 'Classic Wood', light: '#f0d9b5', dark: '#b58863' },
    { id: 'slate', name: 'Modern Slate', light: '#e2e8f0', dark: '#475569' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-brand-card border border-brand-border rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-accent" />
            <h2 className="text-sm font-bold text-slate-100">Preferences & Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-brand-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 text-xs">
          
          {/* Board Theme */}
          <div>
            <label className="block font-semibold text-slate-300 mb-2">
              Chessboard Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {boardThemes.map((b) => (
                <button
                  key={b.id}
                  onClick={() => dispatch(setBoardTheme(b.id))}
                  className={`p-2 rounded-xl border flex items-center gap-2 transition-smooth ${
                    settings.boardTheme === b.id
                      ? 'border-brand-accent bg-brand-accent/15'
                      : 'border-brand-border hover:bg-brand-hover'
                  }`}
                >
                  <div className="w-5 h-5 rounded overflow-hidden flex flex-shrink-0 border border-black/40">
                    <div className="w-1/2 h-full" style={{ backgroundColor: b.light }} />
                    <div className="w-1/2 h-full" style={{ backgroundColor: b.dark }} />
                  </div>
                  <span className="truncate font-medium text-slate-200">{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles List */}
          <div className="flex flex-col divide-y divide-brand-border/40 pt-2 border-t border-brand-border">
            
            {/* Dark Mode */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium text-slate-300">Dark Theme</span>
              <button
                onClick={() => dispatch(setTheme(settings.theme === 'dark' ? 'light' : 'dark'))}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.theme === 'dark' ? 'bg-brand-accent' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    settings.theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Board Coordinates */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium text-slate-300">Show Board Coordinates (a-h, 1-8)</span>
              <button
                onClick={() => dispatch(toggleCoordinates())}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.showCoordinates ? 'bg-brand-accent' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    settings.showCoordinates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Legal Move Indicators */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium text-slate-300">Highlight Legal Move Targets</span>
              <button
                onClick={() => dispatch(toggleLegalMoves())}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.highlightLegalMoves ? 'bg-brand-accent' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    settings.highlightLegalMoves ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound Effects */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium text-slate-300">Sound Effects (Web Audio)</span>
              <button
                onClick={() => dispatch(toggleSound())}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.soundEnabled ? 'bg-brand-accent' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-brand-surface border-t border-brand-border text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-brand-card hover:bg-brand-hover text-slate-200 rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

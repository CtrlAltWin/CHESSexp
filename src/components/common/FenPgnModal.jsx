import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadFenPosition, loadPgnGame } from '../../store/slices/chessboardSlice';
import { X, Copy, Check, Share2, Download, Upload } from 'lucide-react';
import { Chess } from 'chess.js';

export default function FenPgnModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { fen, history } = useSelector((state) => state.chessboard);

  const [activeTab, setActiveTab] = useState('fen');
  const [customFen, setCustomFen] = useState('');
  const [customPgn, setCustomPgn] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Generate clean PGN from current history
  const generateCurrentPgn = () => {
    try {
      const c = new Chess();
      for (const m of history) {
        c.move({ from: m.from, to: m.to });
      }
      return c.pgn();
    } catch (e) {
      return '';
    }
  };

  const currentPgn = generateCurrentPgn();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadCustomFen = (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const c = new Chess();
      c.load(customFen.trim());
      dispatch(loadFenPosition(customFen.trim()));
      onClose();
    } catch (err) {
      setErrorMsg('Invalid FEN format.');
    }
  };

  const handleLoadCustomPgn = (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const c = new Chess();
      c.loadPgn(customPgn.trim());
      dispatch(loadPgnGame({ pgn: customPgn.trim() }));
      onClose();
    } catch (err) {
      setErrorMsg('Invalid PGN format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-brand-card border border-brand-border rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-brand-accent" />
            <h2 className="text-sm font-bold text-slate-100">FEN & PGN Tools</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-brand-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-border text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('fen'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-smooth ${
              activeTab === 'fen'
                ? 'border-brand-accent text-brand-accent font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            FEN Position
          </button>
          <button
            onClick={() => { setActiveTab('pgn'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-smooth ${
              activeTab === 'pgn'
                ? 'border-brand-accent text-brand-accent font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            PGN Game
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl">
              {errorMsg}
            </div>
          )}

          {activeTab === 'fen' ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Current Board FEN:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={fen}
                    className="flex-1 p-2 bg-brand-surface border border-brand-border rounded-xl text-slate-200 font-mono text-[11px]"
                  />
                  <button
                    onClick={() => handleCopy(fen)}
                    className="p-2 rounded-xl bg-brand-card hover:bg-brand-hover border border-brand-border text-slate-200 flex items-center gap-1 font-medium"
                    title="Copy FEN to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-brand-accent" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoadCustomFen} className="flex flex-col gap-2 pt-2 border-t border-brand-border">
                <label className="block text-slate-400 font-medium">Load Custom FEN:</label>
                <input
                  type="text"
                  placeholder="Paste FEN position..."
                  value={customFen}
                  onChange={(e) => setCustomFen(e.target.value)}
                  className="p-2 bg-brand-surface border border-brand-border rounded-xl text-slate-200 font-mono text-[11px]"
                />
                <button
                  type="submit"
                  disabled={!customFen.trim()}
                  className="py-2 bg-brand-accent hover:bg-brand-accentHover text-slate-950 font-bold rounded-xl transition-colors disabled:opacity-40"
                >
                  Load Position onto Board
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400 font-medium">Current Move History (PGN):</label>
                  <button
                    onClick={() => handleCopy(currentPgn)}
                    className="flex items-center gap-1 text-[11px] text-brand-accent hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy PGN</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={3}
                  value={currentPgn || '1. ... (Play moves to generate PGN)'}
                  className="w-full p-2 bg-brand-surface border border-brand-border rounded-xl text-slate-200 font-mono text-[11px]"
                />
              </div>

              <form onSubmit={handleLoadCustomPgn} className="flex flex-col gap-2 pt-2 border-t border-brand-border">
                <label className="block text-slate-400 font-medium">Load Custom PGN:</label>
                <textarea
                  rows={3}
                  placeholder="Paste PGN moves here... e.g. 1. e4 e5 2. Nf3 Nc6..."
                  value={customPgn}
                  onChange={(e) => setCustomPgn(e.target.value)}
                  className="p-2 bg-brand-surface border border-brand-border rounded-xl text-slate-200 font-mono text-[11px]"
                />
                <button
                  type="submit"
                  disabled={!customPgn.trim()}
                  className="py-2 bg-brand-accent hover:bg-brand-accentHover text-slate-950 font-bold rounded-xl transition-colors disabled:opacity-40"
                >
                  Load Game onto Board
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeMove, setPromotionPending } from '../../store/slices/chessboardSlice';

export default function PromoteModal() {
  const dispatch = useDispatch();
  const promotionPending = useSelector((state) => state.chessboard.promotionPending);
  const turn = useSelector((state) => state.chessboard.turn);

  if (!promotionPending) return null;

  const isWhite = turn === 'w';
  const pieces = [
    { type: 'q', label: 'Queen', symbol: isWhite ? '♕' : '♛' },
    { type: 'r', label: 'Rook', symbol: isWhite ? '♖' : '♜' },
    { type: 'b', label: 'Bishop', symbol: isWhite ? '♗' : '♝' },
    { type: 'n', label: 'Knight', symbol: isWhite ? '♘' : '♞' },
  ];

  const handleSelect = (pieceType) => {
    dispatch(makeMove({
      from: promotionPending.from,
      to: promotionPending.to,
      promotion: pieceType
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 shadow-2xl max-w-xs w-full text-center">
        <h3 className="text-base font-bold text-slate-100 mb-4">Promote Pawn</h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {pieces.map((p) => (
            <button
              key={p.type}
              onClick={() => handleSelect(p.type)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-brand-surface hover:bg-brand-hover border border-brand-border hover:border-brand-accent transition-smooth group"
            >
              <span className="text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
                {p.symbol}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">{p.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => dispatch(setPromotionPending(null))}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}


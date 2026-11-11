import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { 
  makeMove, 
  selectSquare, 
  setPromotionPending 
} from '../../store/slices/chessboardSlice';
import PromoteModal from './PromoteModal';

const BOARD_THEMES = {
  green: {
    light: '#eeeed2',
    dark: '#769656',
    name: 'Classic Green'
  },
  blue: {
    light: '#e1e7ed',
    dark: '#68889e',
    name: 'Ocean Blue'
  },
  wood: {
    light: '#f0d9b5',
    dark: '#b58863',
    name: 'Classic Wood'
  },
  slate: {
    light: '#e2e8f0',
    dark: '#475569',
    name: 'Modern Slate'
  }
};

export default function ChessboardView({ boardWidth }) {
  const dispatch = useDispatch();
  const {
    fen,
    orientation,
    selectedSquare,
    legalMoves,
    lastMove,
    isCheck,
    turn
  } = useSelector((state) => state.chessboard);

  const {
    boardTheme,
    highlightLegalMoves,
    showCoordinates
  } = useSelector((state) => state.settings);

  const currentTheme = BOARD_THEMES[boardTheme] || BOARD_THEMES.green;

  // Handle Drag and Drop
  const onPieceDrop = (sourceSquare, targetSquare) => {
    if (sourceSquare === targetSquare) return false;

    // Check if legal move with chess.js
    const chess = new Chess(fen);
    const piece = chess.get(sourceSquare);

    // If pawn promotion
    if (
      piece &&
      piece.type === 'p' &&
      ((piece.color === 'w' && targetSquare[1] === '8') || 
       (piece.color === 'b' && targetSquare[1] === '1'))
    ) {
      dispatch(setPromotionPending({ from: sourceSquare, to: targetSquare }));
      return false;
    }

    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move) {
        dispatch(makeMove({ from: sourceSquare, to: targetSquare, promotion: 'q' }));
        return true;
      }
    } catch (e) {
      return false;
    }

    return false;
  };

  // Handle Click to Move & Click to Select
  const onSquareClick = (square) => {
    const chess = new Chess(fen);

    // If a square is already selected and user clicked a legal target square
    if (selectedSquare && legalMoves.includes(square)) {
      const piece = chess.get(selectedSquare);
      if (
        piece &&
        piece.type === 'p' &&
        ((piece.color === 'w' && square[1] === '8') || 
         (piece.color === 'b' && square[1] === '1'))
      ) {
        dispatch(setPromotionPending({ from: selectedSquare, to: square }));
        return;
      }

      dispatch(makeMove({ from: selectedSquare, to: square }));
      return;
    }

    // Otherwise, toggle piece selection
    dispatch(selectSquare(square));
  };

  // Custom square styles for legal dots, captures, last move, and check
  const customSquareStyles = useMemo(() => {
    const styles = {};
    const chess = new Chess(fen);

    // Last move highlight
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.35)'
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.45)'
      };
    }

    // Selected piece square highlight
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(34, 197, 94, 0.45)',
        boxShadow: 'inset 0 0 0 2px rgba(34, 197, 94, 0.8)'
      };

      // Legal moves highlights
      if (highlightLegalMoves) {
        legalMoves.forEach((sq) => {
          const targetPiece = chess.get(sq);
          if (targetPiece) {
            // Capture ring indicator
            styles[sq] = {
              background: 'radial-gradient(circle, transparent 55%, rgba(0, 0, 0, 0.35) 56%, rgba(0, 0, 0, 0.35) 75%, transparent 76%)',
              cursor: 'pointer'
            };
          } else {
            // Empty square dot indicator
            styles[sq] = {
              background: 'radial-gradient(circle, rgba(0, 0, 0, 0.28) 22%, transparent 24%)',
              cursor: 'pointer'
            };
          }
        });
      }
    }

    // King in check indicator
    if (isCheck) {
      // Find king square for active turn
      for (let r = 1; r <= 8; r++) {
        for (const col of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
          const sq = `${col}${r}`;
          const p = chess.get(sq);
          if (p && p.type === 'k' && p.color === turn) {
            styles[sq] = {
              background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.85) 0%, rgba(220, 38, 38, 0.45) 50%, transparent 80%)'
            };
          }
        }
      }
    }

    return styles;
  }, [fen, selectedSquare, legalMoves, lastMove, isCheck, turn, highlightLegalMoves]);

  return (
    <div className="relative w-full aspect-square max-w-[min(100vw-32px,580px)] mx-auto flex items-center justify-center chessboard-wrapper select-none">
      <Chessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        boardOrientation={orientation}
        boardWidth={boardWidth}
        arePiecesDraggable={true}
        animationDuration={220}
        showBoardNotation={showCoordinates}
        customDarkSquareStyle={{ backgroundColor: currentTheme.dark }}
        customLightSquareStyle={{ backgroundColor: currentTheme.light }}
        customSquareStyles={customSquareStyles}
        customBoardStyle={{
          borderRadius: '10px',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)'
        }}
      />
      <PromoteModal />
    </div>
  );
}


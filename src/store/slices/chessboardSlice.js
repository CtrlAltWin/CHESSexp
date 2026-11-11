import { createSlice } from '@reduxjs/toolkit';
import { Chess } from 'chess.js';
import { normalizeFen, STARTING_FEN, STARTING_NORM_FEN } from '../../services/chess/fenUtils';
import { soundService } from '../../services/audio/soundService';

const initialState = {
  fen: STARTING_FEN,
  normFen: STARTING_NORM_FEN,
  history: [],
  currentMoveIndex: -1,
  selectedSquare: null,
  legalMoves: [],
  lastMove: null,
  orientation: 'white',
  turn: 'w',
  isCheck: false,
  isCheckmate: false,
  isDraw: false,
  promotionPending: null
};

export const chessboardSlice = createSlice({
  name: 'chessboard',
  initialState,
  reducers: {
    selectSquare: (state, action) => {
      const square = action.payload;
      if (!square) {
        state.selectedSquare = null;
        state.legalMoves = [];
        return;
      }

      // If user clicked same square, unselect
      if (state.selectedSquare === square) {
        state.selectedSquare = null;
        state.legalMoves = [];
        return;
      }

      const chess = new Chess(state.fen);
      const piece = chess.get(square);

      // If clicking own piece, select it and compute legal destination squares
      if (piece && piece.color === chess.turn()) {
        state.selectedSquare = square;
        const moves = chess.moves({ square, verbose: true });
        state.legalMoves = moves.map(m => m.to);
      } else {
        state.selectedSquare = null;
        state.legalMoves = [];
      }
    },

    setPromotionPending: (state, action) => {
      state.promotionPending = action.payload; // { from, to } or null
    },

    makeMove: (state, action) => {
      const { from, to, promotion = 'q' } = action.payload;
      const chess = new Chess(state.fen);

      // Check if move requires promotion prompt
      const piece = chess.get(from);
      if (
        piece &&
        piece.type === 'p' &&
        ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1')) &&
        !action.payload.promotion
      ) {
        state.promotionPending = { from, to };
        return;
      }

      try {
        const moveRes = chess.move({ from, to, promotion });
        if (moveRes) {
          const newFen = chess.fen();
          const newNormFen = normalizeFen(newFen);
          
          const isCheckmate = chess.isCheckmate();
          const isDraw = chess.isDraw();
          const isCheck = chess.inCheck();
          const isCastle = Boolean(moveRes.san.includes('O-O') || moveRes.flags?.includes('k') || moveRes.flags?.includes('q'));
          const isPromote = Boolean(moveRes.promotion || moveRes.san.includes('='));
          const isCapture = Boolean(moveRes.captured || moveRes.san.includes('x'));

          // Sound effects exactly matching chess.com
          if (isCheckmate || isDraw) {
            soundService.playGameEnd();
          } else if (isCheck) {
            soundService.playCheck();
          } else if (isCapture) {
            soundService.playCapture();
          } else if (isCastle) {
            soundService.playCastle();
          } else if (isPromote) {
            soundService.playPromote();
          } else {
            soundService.playMove();
          }

          // Truncate forward history if moving after navigating backward
          const newHistory = state.history.slice(0, state.currentMoveIndex + 1);
          newHistory.push({
            san: moveRes.san,
            from: moveRes.from,
            to: moveRes.to,
            captured: isCapture,
            promotion: isPromote,
            isCastle,
            isCheck,
            isCheckmate,
            isDraw,
            fen: newFen,
            normFen: newNormFen,
            moveNumber: Math.floor(newHistory.length / 2) + 1,
            turn: moveRes.color
          });

          state.fen = newFen;
          state.normFen = newNormFen;
          state.history = newHistory;
          state.currentMoveIndex = newHistory.length - 1;
          state.lastMove = { from: moveRes.from, to: moveRes.to };
          state.selectedSquare = null;
          state.legalMoves = [];
          state.turn = chess.turn();
          state.isCheck = isCheck;
          state.isCheckmate = isCheckmate;
          state.isDraw = isDraw;
          state.promotionPending = null;
        }
      } catch (e) {
        state.selectedSquare = null;
        state.legalMoves = [];
      }
    },

    jumpToMove: (state, action) => {
      const prevIndex = state.currentMoveIndex;
      const targetIndex = typeof action.payload === 'object' && action.payload !== null
        ? action.payload.targetIndex
        : action.payload;
      const silent = typeof action.payload === 'object' && action.payload !== null
        ? Boolean(action.payload.silent)
        : false;

      if (targetIndex < -1 || targetIndex >= state.history.length) return;
      if (targetIndex === prevIndex) return;

      if (targetIndex === -1) {
        state.fen = STARTING_FEN;
        state.normFen = STARTING_NORM_FEN;
        state.currentMoveIndex = -1;
        state.lastMove = null;
        state.turn = 'w';
        state.isCheck = false;
        state.isCheckmate = false;
        state.isDraw = false;
      } else {
        const item = state.history[targetIndex];
        const chess = new Chess(item.fen);
        state.fen = item.fen;
        state.normFen = item.normFen;
        state.currentMoveIndex = targetIndex;
        state.lastMove = { from: item.from, to: item.to };
        state.turn = chess.turn();
        state.isCheck = chess.inCheck();
        state.isCheckmate = chess.isCheckmate();
        state.isDraw = chess.isDraw();
      }

      state.selectedSquare = null;
      state.legalMoves = [];
      state.promotionPending = null;

      // Play appropriate tactical sounds when navigating
      if (!silent) {
        if (targetIndex > prevIndex) {
          // Navigating forward: play sound matching the specific move stepped into
          const moveItem = state.history[targetIndex];
          if (moveItem) {
            if (moveItem.isCheckmate || moveItem.isDraw) {
              soundService.playGameEnd();
            } else if (moveItem.isCheck || moveItem.san?.includes('+') || moveItem.san?.includes('#')) {
              soundService.playCheck();
            } else if (moveItem.captured || moveItem.san?.includes('x')) {
              soundService.playCapture();
            } else if (moveItem.isCastle || moveItem.san?.includes('O-O')) {
              soundService.playCastle();
            } else if (moveItem.promotion || moveItem.san?.includes('=')) {
              soundService.playPromote();
            } else {
              soundService.playMove();
            }
          }
        } else if (targetIndex < prevIndex) {
          // Navigating backward: soft move sound
          soundService.playMove();
        }
      }
    },

    undoMove: (state) => {
      if (state.currentMoveIndex >= 0) {
        chessboardSlice.caseReducers.jumpToMove(state, { payload: state.currentMoveIndex - 1 });
      }
    },

    redoMove: (state) => {
      if (state.currentMoveIndex < state.history.length - 1) {
        chessboardSlice.caseReducers.jumpToMove(state, { payload: state.currentMoveIndex + 1 });
      }
    },

    resetBoard: (state) => {
      state.fen = STARTING_FEN;
      state.normFen = STARTING_NORM_FEN;
      state.history = [];
      state.currentMoveIndex = -1;
      state.selectedSquare = null;
      state.legalMoves = [];
      state.lastMove = null;
      state.turn = 'w';
      state.isCheck = false;
      state.isCheckmate = false;
      state.isDraw = false;
      state.promotionPending = null;
    },

    flipBoard: (state) => {
      state.orientation = state.orientation === 'white' ? 'black' : 'white';
    },

    setOrientation: (state, action) => {
      state.orientation = action.payload;
    },

    loadFenPosition: (state, action) => {
      const fen = action.payload;
      try {
        const chess = new Chess(fen);
        state.fen = chess.fen();
        state.normFen = normalizeFen(state.fen);
        state.history = [];
        state.currentMoveIndex = -1;
        state.selectedSquare = null;
        state.legalMoves = [];
        state.lastMove = null;
        state.turn = chess.turn();
        state.isCheck = chess.inCheck();
        state.isCheckmate = chess.isCheckmate();
        state.isDraw = chess.isDraw();
      } catch (e) {
        // invalid fen
      }
    },

    loadPgnGame: (state, action) => {
      const { pgn, targetMoveIndex = -1 } = action.payload;
      try {
        const chess = new Chess();
        chess.loadPgn(pgn);
        const fullMoves = chess.history({ verbose: true });

        // Reconstruct history step by step
        const replay = new Chess();
        const reconstructedHistory = [];

        for (const m of fullMoves) {
          replay.move(m);
          const currentFen = replay.fen();
          reconstructedHistory.push({
            san: m.san,
            from: m.from,
            to: m.to,
            captured: Boolean(m.captured || m.san?.includes('x')),
            promotion: Boolean(m.promotion || m.san?.includes('=')),
            isCastle: Boolean(m.san?.includes('O-O') || m.flags?.includes('k') || m.flags?.includes('q')),
            isCheck: replay.inCheck(),
            isCheckmate: replay.isCheckmate(),
            isDraw: replay.isDraw(),
            fen: currentFen,
            normFen: normalizeFen(currentFen),
            moveNumber: Math.floor(reconstructedHistory.length / 2) + 1,
            turn: m.color
          });
        }

        state.history = reconstructedHistory;
        const targetIdx = targetMoveIndex >= 0 && targetMoveIndex < reconstructedHistory.length 
          ? targetMoveIndex 
          : reconstructedHistory.length - 1;

        // Load historical game silently without initial navigation noise
        chessboardSlice.caseReducers.jumpToMove(state, { 
          payload: { targetIndex: targetIdx, silent: true } 
        });
      } catch (e) {
        console.error('Failed to load PGN:', e);
      }
    },

    restoreBoardState: (state, action) => {
      const { fen, normFen, history, currentMoveIndex } = action.payload || {};
      state.fen = fen || STARTING_FEN;
      state.normFen = normFen || STARTING_NORM_FEN;
      state.history = history || [];
      state.currentMoveIndex = currentMoveIndex !== undefined ? currentMoveIndex : -1;
      state.lastMove = state.currentMoveIndex >= 0 && state.history[state.currentMoveIndex]
        ? { from: state.history[state.currentMoveIndex].from, to: state.history[state.currentMoveIndex].to }
        : null;
      state.selectedSquare = null;
      state.legalMoves = [];
      state.promotionPending = null;
      // Silent: no sound played during position restoration
    }
  }
});

export const {
  selectSquare,
  setPromotionPending,
  makeMove,
  jumpToMove,
  undoMove,
  redoMove,
  resetBoard,
  flipBoard,
  setOrientation,
  loadFenPosition,
  loadPgnGame,
  restoreBoardState
} = chessboardSlice.actions;

export default chessboardSlice.reducer;


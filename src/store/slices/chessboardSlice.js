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
          
          // Sound effects exactly matching chess.com
          if (chess.isCheckmate() || chess.isDraw()) {
            soundService.playGameEnd();
          } else if (chess.inCheck()) {
            soundService.playCheck();
          } else if (moveRes.promotion) {
            soundService.playPromote();
          } else if (moveRes.captured) {
            soundService.playCapture();
          } else if (moveRes.san.includes('O-O')) {
            soundService.playCastle();
          } else {
            soundService.playMove();
          }

          // Truncate forward history if moving after navigating backward
          const newHistory = state.history.slice(0, state.currentMoveIndex + 1);
          newHistory.push({
            san: moveRes.san,
            from: moveRes.from,
            to: moveRes.to,
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
          state.isCheck = chess.inCheck();
          state.isCheckmate = chess.isCheckmate();
          state.isDraw = chess.isDraw();
          state.promotionPending = null;
        }
      } catch (e) {
        state.selectedSquare = null;
        state.legalMoves = [];
      }
    },

    jumpToMove: (state, action) => {
      const targetIndex = action.payload; // -1 for start, 0..N-1
      if (targetIndex < -1 || targetIndex >= state.history.length) return;

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
      soundService.playMove();
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

        chessboardSlice.caseReducers.jumpToMove(state, { payload: targetIdx });
      } catch (e) {
        console.error('Failed to load PGN:', e);
      }
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
  loadPgnGame
} = chessboardSlice.actions;

export default chessboardSlice.reducer;


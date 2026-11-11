import { configureStore } from '@reduxjs/toolkit';
import chessboardReducer from './slices/chessboardSlice';
import opponentReducer from './slices/opponentSlice';
import explorerReducer from './slices/explorerSlice';
import gamesReducer from './slices/gamesSlice';
import engineReducer from './slices/engineSlice';
import importReducer from './slices/importSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    chessboard: chessboardReducer,
    opponent: opponentReducer,
    explorer: explorerReducer,
    games: gamesReducer,
    engine: engineReducer,
    import: importReducer,
    settings: settingsReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;


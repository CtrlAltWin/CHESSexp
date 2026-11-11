import { configureStore } from '@reduxjs/toolkit';
import chessboardReducer from './slices/chessboardSlice';
import opponentReducer from './slices/opponentSlice';
import explorerReducer from './slices/explorerSlice';
import gamesReducer from './slices/gamesSlice';
import engineReducer from './slices/engineSlice';
import importReducer from './slices/importSlice';
import settingsReducer from './slices/settingsSlice';
import { getPersistedPreloadedState, subscribePersistence } from '../services/storage/persistenceService';

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
  preloadedState: getPersistedPreloadedState(),
  devTools: process.env.NODE_ENV !== 'production'
});

// Subscribe to automatically debounce and save relevant state changes to localStorage
subscribePersistence(store);

export default store;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getGamesByIds } from '../../services/storage/dbOperations';

export const fetchMatchingGamesAsync = createAsyncThunk(
  'games/fetchMatchingGames',
  async ({ gameIds, filters }) => {
    if (!gameIds || gameIds.length === 0) return [];
    const games = await getGamesByIds(gameIds, filters);
    return games;
  }
);

const initialState = {
  matchingGames: [],
  selectedGame: null,
  isAnalyzingGame: false,
  returnExplorerState: null, // Saved exploration state: { fen, history, currentMoveIndex }
  filters: {
    result: 'all', // 'all' | 'win' | 'loss' | 'draw'
    color: 'all', // 'all' | 'white' | 'black'
    timeClass: 'all' // 'all' | 'bullet' | 'blitz' | 'rapid' | 'daily'
  },
  isLoading: false
};

export const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    resetFilters: (state) => {
      state.filters = {
        result: 'all',
        color: 'all',
        timeClass: 'all'
      };
    },
    startAnalyzingGame: (state, action) => {
      const { game, savedExplorerState } = action.payload;
      state.selectedGame = game;
      state.isAnalyzingGame = true;
      if (savedExplorerState) {
        state.returnExplorerState = savedExplorerState;
      }
    },
    exitAnalyzingGame: (state) => {
      state.selectedGame = null;
      state.isAnalyzingGame = false;
    },
    clearReturnExplorerState: (state) => {
      state.returnExplorerState = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchingGamesAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMatchingGamesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.matchingGames = action.payload || [];
      })
      .addCase(fetchMatchingGamesAsync.rejected, (state) => {
        state.isLoading = false;
        state.matchingGames = [];
      });
  }
});

export const {
  setFilter,
  resetFilters,
  startAnalyzingGame,
  exitAnalyzingGame,
  clearReturnExplorerState
} = gamesSlice.actions;

export default gamesSlice.reducer;


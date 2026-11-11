import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPositionStats, getExactLineStats } from '../../services/storage/dbOperations';

export const fetchPositionStatsAsync = createAsyncThunk(
  'explorer/fetchPositionStats',
  async ({ profileUsername, normFen, lineMoves, mode }, { getState }) => {
    if (!profileUsername || !normFen) return null;

    if (mode === 'exact' && lineMoves && lineMoves.length > 0) {
      const matchingGameIds = await getExactLineStats(profileUsername, lineMoves);
      // For exact mode, return continuation stats matching the exact line
      const baseStats = await getPositionStats(profileUsername, normFen);
      if (baseStats && matchingGameIds) {
        // Filter continuations to only those present in exact line games
        return {
          ...baseStats,
          gameIds: matchingGameIds,
          gamesCount: matchingGameIds.length
        };
      }
      return baseStats;
    }

    const stats = await getPositionStats(profileUsername, normFen);
    return stats;
  }
);

const initialState = {
  positionStats: {
    gamesCount: 0,
    whiteWins: 0,
    draws: 0,
    blackWins: 0,
    whiteWinPct: 0,
    drawPct: 0,
    blackWinPct: 0,
    moves: [],
    gameIds: []
  },
  mode: 'position', // 'position' (Transposition) | 'exact' (Exact Line)
  isLoading: false,
  error: null
};

export const explorerSlice = createSlice({
  name: 'explorer',
  initialState,
  reducers: {
    setExplorerMode: (state, action) => {
      state.mode = action.payload;
    },
    clearStats: (state) => {
      state.positionStats = {
        gamesCount: 0,
        whiteWins: 0,
        draws: 0,
        blackWins: 0,
        whiteWinPct: 0,
        drawPct: 0,
        blackWinPct: 0,
        moves: [],
        gameIds: []
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositionStatsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPositionStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.positionStats = action.payload;
        } else {
          state.positionStats = {
            gamesCount: 0,
            whiteWins: 0,
            draws: 0,
            blackWins: 0,
            whiteWinPct: 0,
            drawPct: 0,
            blackWinPct: 0,
            moves: [],
            gameIds: []
          };
        }
      })
      .addCase(fetchPositionStatsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  }
});

export const { setExplorerMode, clearStats } = explorerSlice.actions;

export default explorerSlice.reducer;

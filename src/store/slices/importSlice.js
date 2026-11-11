import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getChessComProfile, fetchChessComGames, parsePgnText } from '../../services/api/chessComApi';
import { indexGamesForProfile, saveProfile } from '../../services/storage/dbOperations';
import { loadProfilesAsync, setSelectedProfile } from './opponentSlice';
import { fetchPositionStatsAsync } from './explorerSlice';
import { SAMPLE_GAMES, SAMPLE_PROFILES } from '../../services/api/sampleGames';

export const importChessComUserAsync = createAsyncThunk(
  'import/importChessComUser',
  async ({ username, maxArchives = 12 }, { dispatch, getState }) => {
    const cleanUser = username.trim().toLowerCase();

    dispatch(setImportStatus({
      status: `Fetching Chess.com profile for ${cleanUser}...`,
      progress: 5
    }));

    // 1. Get profile
    const profile = await getChessComProfile(cleanUser);
    await saveProfile(profile);

    // 2. Fetch games from Chess.com archives
    const rawGames = await fetchChessComGames(cleanUser, {
      maxArchives,
      onProgress: (p) => {
        dispatch(setImportStatus({
          status: p.status,
          progress: Math.min(80, p.percentage)
        }));
      }
    });

    dispatch(setImportStatus({
      status: `Indexing ${rawGames.length} games and calculating opening positions...`,
      progress: 82
    }));

    // 3. Parse, index positions, and store in IndexedDB
    const indexResult = await indexGamesForProfile(cleanUser, rawGames, (p) => {
      dispatch(setImportStatus({
        status: p.status,
        progress: 80 + Math.round((p.percentage / 100) * 20)
      }));
    });

    // 4. Refresh profiles in Redux and select this profile
    await dispatch(loadProfilesAsync());
    dispatch(setSelectedProfile(cleanUser));

    // 5. Trigger opening explorer update for current board position
    const currentNormFen = getState().chessboard.normFen;
    dispatch(fetchPositionStatsAsync({
      profileUsername: cleanUser,
      normFen: currentNormFen,
      mode: getState().explorer.mode
    }));

    return {
      username: cleanUser,
      totalFound: rawGames.length,
      importedCount: indexResult.importedCount,
      duplicateCount: indexResult.duplicateCount
    };
  }
);

export const importPgnTextAsync = createAsyncThunk(
  'import/importPgnText',
  async ({ targetUsername, pgnText }, { dispatch, getState }) => {
    const cleanUser = targetUsername.trim().toLowerCase() || 'my_games';

    dispatch(setImportStatus({
      status: 'Parsing PGN games...',
      progress: 20
    }));

    const rawGames = parsePgnText(pgnText, cleanUser);
    if (rawGames.length === 0) {
      throw new Error('No valid chess games found in provided PGN.');
    }

    // Save profile if not exists
    await saveProfile({
      username: cleanUser,
      displayName: targetUsername.trim() || 'My Games',
      avatar: '',
      title: ''
    });

    // Index games
    const indexResult = await indexGamesForProfile(cleanUser, rawGames, (p) => {
      dispatch(setImportStatus({
        status: p.status,
        progress: 20 + Math.round((p.percentage / 100) * 80)
      }));
    });

    await dispatch(loadProfilesAsync());
    dispatch(setSelectedProfile(cleanUser));

    const currentNormFen = getState().chessboard.normFen;
    dispatch(fetchPositionStatsAsync({
      profileUsername: cleanUser,
      normFen: currentNormFen,
      mode: getState().explorer.mode
    }));

    return {
      username: cleanUser,
      totalFound: rawGames.length,
      importedCount: indexResult.importedCount,
      duplicateCount: indexResult.duplicateCount
    };
  }
);

export const loadSampleDatasetAsync = createAsyncThunk(
  'import/loadSampleDataset',
  async (sampleUser = 'hikaru', { dispatch, getState }) => {
    const cleanUser = sampleUser.toLowerCase();
    const prof = SAMPLE_PROFILES.find(p => p.username === cleanUser) || SAMPLE_PROFILES[0];

    dispatch(setImportStatus({
      status: `Initializing ${prof.displayName} sample opening database...`,
      progress: 30
    }));

    await saveProfile({
      username: prof.username,
      displayName: prof.displayName,
      avatar: prof.avatar,
      title: prof.title
    });

    const indexResult = await indexGamesForProfile(prof.username, SAMPLE_GAMES, (p) => {
      dispatch(setImportStatus({
        status: p.status,
        progress: 30 + Math.round((p.percentage / 100) * 70)
      }));
    });

    await dispatch(loadProfilesAsync());
    dispatch(setSelectedProfile(prof.username));

    const currentNormFen = getState().chessboard.normFen;
    dispatch(fetchPositionStatsAsync({
      profileUsername: prof.username,
      normFen: currentNormFen,
      mode: getState().explorer.mode
    }));

    return {
      username: prof.username,
      totalFound: SAMPLE_GAMES.length,
      importedCount: indexResult.importedCount,
      duplicateCount: indexResult.duplicateCount
    };
  }
);

const initialState = {
  isModalOpen: false,
  isImporting: false,
  progress: 0,
  statusMessage: '',
  totalFound: 0,
  importedCount: 0,
  duplicateCount: 0,
  error: null,
  isSuccess: false
};

export const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    openImportModal: (state) => {
      state.isModalOpen = true;
      state.isSuccess = false;
      state.error = null;
      state.progress = 0;
      state.statusMessage = '';
    },
    closeImportModal: (state) => {
      if (!state.isImporting) {
        state.isModalOpen = false;
      }
    },
    setImportStatus: (state, action) => {
      state.statusMessage = action.payload.status;
      state.progress = action.payload.progress;
    },
    resetImportState: (state) => {
      state.isImporting = false;
      state.progress = 0;
      state.statusMessage = '';
      state.error = null;
      state.isSuccess = false;
    }
  },
  extraReducers: (builder) => {
    // Chess.com User import
    builder
      .addCase(importChessComUserAsync.pending, (state) => {
        state.isImporting = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(importChessComUserAsync.fulfilled, (state, action) => {
        state.isImporting = false;
        state.isSuccess = true;
        state.totalFound = action.payload.totalFound;
        state.importedCount = action.payload.importedCount;
        state.duplicateCount = action.payload.duplicateCount;
        state.progress = 100;
        state.statusMessage = `Import completed! ${action.payload.importedCount} new games added.`;
      })
      .addCase(importChessComUserAsync.rejected, (state, action) => {
        state.isImporting = false;
        state.error = action.error.message || 'Import failed. Please check network connection or username.';
      });

    // PGN Text import
    builder
      .addCase(importPgnTextAsync.pending, (state) => {
        state.isImporting = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(importPgnTextAsync.fulfilled, (state, action) => {
        state.isImporting = false;
        state.isSuccess = true;
        state.totalFound = action.payload.totalFound;
        state.importedCount = action.payload.importedCount;
        state.duplicateCount = action.payload.duplicateCount;
        state.progress = 100;
        state.statusMessage = `PGN import completed! ${action.payload.importedCount} games processed.`;
      })
      .addCase(importPgnTextAsync.rejected, (state, action) => {
        state.isImporting = false;
        state.error = action.error.message || 'PGN import failed.';
      });

    // Sample dataset
    builder
      .addCase(loadSampleDatasetAsync.pending, (state) => {
        state.isImporting = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(loadSampleDatasetAsync.fulfilled, (state, action) => {
        state.isImporting = false;
        state.isSuccess = true;
        state.totalFound = action.payload.totalFound;
        state.importedCount = action.payload.importedCount;
        state.duplicateCount = action.payload.duplicateCount;
        state.progress = 100;
        state.statusMessage = `Sample dataset loaded successfully!`;
      })
      .addCase(loadSampleDatasetAsync.rejected, (state, action) => {
        state.isImporting = false;
        state.error = action.error.message || 'Failed to load sample dataset.';
      });
  }
});

export const {
  openImportModal,
  closeImportModal,
  setImportStatus,
  resetImportState
} = importSlice.actions;

export default importSlice.reducer;

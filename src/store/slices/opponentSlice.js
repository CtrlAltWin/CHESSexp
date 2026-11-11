import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfiles, deleteProfile } from '../../services/storage/dbOperations';

export const loadProfilesAsync = createAsyncThunk(
  'opponent/loadProfiles',
  async () => {
    const profiles = await getProfiles();
    return profiles;
  }
);

export const removeProfileAsync = createAsyncThunk(
  'opponent/removeProfile',
  async (username, { dispatch }) => {
    await deleteProfile(username);
    dispatch(loadProfilesAsync());
    return username;
  }
);

const initialState = {
  selectedProfile: 'hikaru', // default to Hikaru or first available
  profiles: [],
  activeDatabase: 'opponent', // 'personal' | 'opponent'
  isLoading: false
};

export const opponentSlice = createSlice({
  name: 'opponent',
  initialState,
  reducers: {
    setSelectedProfile: (state, action) => {
      state.selectedProfile = action.payload;
    },
    setActiveDatabase: (state, action) => {
      state.activeDatabase = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProfilesAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadProfilesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profiles = action.payload || [];
        if (state.profiles.length > 0 && !state.profiles.some(p => p.username === state.selectedProfile)) {
          state.selectedProfile = state.profiles[0].username;
        }
      })
      .addCase(loadProfilesAsync.rejected, (state) => {
        state.isLoading = false;
      });
  }
});

export const { setSelectedProfile, setActiveDatabase } = opponentSlice.actions;

export default opponentSlice.reducer;


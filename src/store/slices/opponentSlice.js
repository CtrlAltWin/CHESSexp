import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfiles, deleteProfile } from '../../services/storage/dbOperations.js';

export const loadProfilesAsync = createAsyncThunk(
  'opponent/loadProfiles',
  async () => {
    const profiles = await getProfiles();
    return profiles;
  }
);

export const removeProfileAsync = createAsyncThunk(
  'opponent/removeProfile',
  async (username, { dispatch, getState }) => {
    await deleteProfile(username);
    const updatedProfiles = await getProfiles();
    dispatch(loadProfilesAsync());

    const currentSelected = getState().opponent.selectedProfile;
    if (currentSelected === username) {
      if (updatedProfiles && updatedProfiles.length > 0) {
        dispatch(setSelectedProfile(updatedProfiles[0].username));
      } else {
        dispatch(setSelectedProfile(''));
      }
    }
    return username;
  }
);

const initialState = {
  selectedProfile: '', // No account by default! User adds their own account.
  profiles: [],
  activeDatabase: 'personal',
  isLoading: false
};

export const opponentSlice = createSlice({
  name: 'opponent',
  initialState,
  reducers: {
    setSelectedProfile: (state, action) => {
      state.selectedProfile = action.payload || '';
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
        if (state.profiles.length > 0) {
          if (!state.selectedProfile || !state.profiles.some(p => p.username === state.selectedProfile)) {
            state.selectedProfile = state.profiles[0].username;
          }
        } else {
          state.selectedProfile = '';
        }
      })
      .addCase(loadProfilesAsync.rejected, (state) => {
        state.isLoading = false;
      });
  }
});

export const { setSelectedProfile, setActiveDatabase } = opponentSlice.actions;

export default opponentSlice.reducer;

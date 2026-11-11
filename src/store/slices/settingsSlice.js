import { createSlice } from '@reduxjs/toolkit';
import { soundService } from '../../services/audio/soundService';

const initialState = {
  theme: 'dark',
  boardTheme: 'green', // 'green' | 'blue' | 'wood' | 'slate'
  soundEnabled: true,
  showCoordinates: true,
  highlightLegalMoves: true,
  autoEngine: true
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setBoardTheme: (state, action) => {
      state.boardTheme = action.payload;
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
      soundService.setMuted(!state.soundEnabled);
    },
    toggleCoordinates: (state) => {
      state.showCoordinates = !state.showCoordinates;
    },
    toggleLegalMoves: (state) => {
      state.highlightLegalMoves = !state.highlightLegalMoves;
    },
    toggleAutoEngine: (state) => {
      state.autoEngine = !state.autoEngine;
    }
  }
});

export const {
  setTheme,
  setBoardTheme,
  toggleSound,
  toggleCoordinates,
  toggleLegalMoves,
  toggleAutoEngine
} = settingsSlice.actions;

export default settingsSlice.reducer;

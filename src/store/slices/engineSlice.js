import { createSlice } from '@reduxjs/toolkit';
import { stockfishService } from '../../services/engine/stockfishService';

const initialState = {
  isEnabled: true,
  isAnalyzing: false,
  depth: 0,
  maxDepth: 18,
  multiPV: 2,
  scoreVal: 0,
  scoreText: '0.00',
  isMate: false,
  mateIn: null,
  evalPercent: 50,
  bestMove: '',
  variations: []
};

export const engineSlice = createSlice({
  name: 'engine',
  initialState,
  reducers: {
    toggleEngine: (state) => {
      state.isEnabled = !state.isEnabled;
      if (!state.isEnabled) {
        state.isAnalyzing = false;
        state.scoreText = '0.00';
        state.evalPercent = 50;
        state.bestMove = '';
        state.variations = [];
        stockfishService.stop();
      }
    },
    setEngineEnabled: (state, action) => {
      state.isEnabled = action.payload;
      if (!action.payload) {
        state.isAnalyzing = false;
        stockfishService.stop();
      }
    },
    setMaxDepth: (state, action) => {
      state.maxDepth = action.payload;
    },
    setMultiPV: (state, action) => {
      state.multiPV = action.payload;
      stockfishService.setMultiPV(action.payload);
    },
    startPositionAnalysis: (state) => {
      state.isAnalyzing = true;
      state.depth = 0;
      state.variations = [];
    },
    updateEvaluation: (state, action) => {
      const {
        depth,
        scoreVal,
        scoreText,
        isMate,
        mateIn,
        evalPercent,
        bestMove,
        variations
      } = action.payload;

      state.depth = depth;
      state.scoreVal = scoreVal;
      state.scoreText = scoreText;
      state.isMate = isMate;
      state.mateIn = mateIn;
      state.evalPercent = evalPercent;
      state.bestMove = bestMove || state.bestMove;
      state.variations = variations || [];
      state.isAnalyzing = depth < state.maxDepth;
    },
    resetEngineState: (state) => {
      state.depth = 0;
      state.scoreVal = 0;
      state.scoreText = '0.00';
      state.isMate = false;
      state.mateIn = null;
      state.evalPercent = 50;
      state.bestMove = '';
      state.variations = [];
      state.isAnalyzing = false;
    }
  }
});

export const {
  toggleEngine,
  setEngineEnabled,
  setMaxDepth,
  setMultiPV,
  startPositionAnalysis,
  updateEvaluation,
  resetEngineState
} = engineSlice.actions;

export default engineSlice.reducer;


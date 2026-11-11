import { Chess } from 'chess.js';
import { STARTING_FEN, STARTING_NORM_FEN, normalizeFen } from '../chess/fenUtils.js';
import { soundService } from '../audio/soundService.js';

const STORAGE_KEYS = {
  CHESSBOARD: 'chessexp_chessboard_state',
  SETTINGS: 'chessexp_settings_state',
  ENGINE: 'chessexp_engine_state',
  EXPLORER: 'chessexp_explorer_state',
  OPPONENT: 'chessexp_opponent_state',
  TABS: 'chessexp_tabs_state'
};

function safeGetItem(key) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn(`[Persistence] Error reading localStorage key "${key}":`, e);
    return null;
  }
}

function safeSetItem(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[Persistence] Error writing localStorage key "${key}":`, e);
  }
}

/**
 * Validates whether a FEN string is legal in chess.js.
 */
function isValidFen(fen) {
  if (!fen || typeof fen !== 'string') return false;
  try {
    new Chess(fen);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Loads persisted Redux slice states for configureStore preloadedState.
 */
export function getPersistedPreloadedState() {
  const preloaded = {};

  // 1. Chessboard Position Persistence
  try {
    const savedBoard = safeGetItem(STORAGE_KEYS.CHESSBOARD);
    if (savedBoard && isValidFen(savedBoard.fen)) {
      const chess = new Chess(savedBoard.fen);
      preloaded.chessboard = {
        fen: savedBoard.fen,
        normFen: savedBoard.normFen || normalizeFen(savedBoard.fen),
        history: Array.isArray(savedBoard.history) ? savedBoard.history : [],
        currentMoveIndex: typeof savedBoard.currentMoveIndex === 'number' ? savedBoard.currentMoveIndex : -1,
        selectedSquare: null,
        legalMoves: [],
        lastMove: savedBoard.lastMove || null,
        orientation: savedBoard.orientation === 'black' ? 'black' : 'white',
        turn: chess.turn(),
        isCheck: chess.inCheck(),
        isCheckmate: chess.isCheckmate(),
        isDraw: chess.isDraw(),
        promotionPending: null
      };
    }
  } catch (e) {
    console.warn('[Persistence] Error loading chessboard state:', e);
  }

  // 2. Settings Persistence
  try {
    const savedSettings = safeGetItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings && typeof savedSettings === 'object') {
      const theme = savedSettings.theme === 'light' ? 'light' : 'dark';
      
      // Sync document theme immediately on load
      if (typeof document !== 'undefined') {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      // Sync sound muted status
      if (typeof savedSettings.soundEnabled === 'boolean') {
        soundService.setMuted(!savedSettings.soundEnabled);
      }

      preloaded.settings = {
        theme,
        boardTheme: ['green', 'blue', 'wood', 'slate'].includes(savedSettings.boardTheme) 
          ? savedSettings.boardTheme 
          : 'green',
        soundEnabled: savedSettings.soundEnabled !== undefined ? Boolean(savedSettings.soundEnabled) : true,
        showCoordinates: savedSettings.showCoordinates !== undefined ? Boolean(savedSettings.showCoordinates) : true,
        highlightLegalMoves: savedSettings.highlightLegalMoves !== undefined ? Boolean(savedSettings.highlightLegalMoves) : true,
        autoEngine: savedSettings.autoEngine !== undefined ? Boolean(savedSettings.autoEngine) : true
      };
    }
  } catch (e) {
    console.warn('[Persistence] Error loading settings state:', e);
  }

  // 3. Engine Settings Persistence
  try {
    const savedEngine = safeGetItem(STORAGE_KEYS.ENGINE);
    if (savedEngine && typeof savedEngine === 'object') {
      preloaded.engine = {
        isEnabled: savedEngine.isEnabled !== undefined ? Boolean(savedEngine.isEnabled) : true,
        isAnalyzing: false,
        depth: 0,
        maxDepth: typeof savedEngine.maxDepth === 'number' ? savedEngine.maxDepth : 18,
        multiPV: typeof savedEngine.multiPV === 'number' ? savedEngine.multiPV : 2,
        scoreVal: 0,
        scoreText: '0.00',
        isMate: false,
        mateIn: null,
        evalPercent: 50,
        bestMove: '',
        variations: []
      };
    }
  } catch (e) {
    console.warn('[Persistence] Error loading engine state:', e);
  }

  // 4. Opening Explorer Settings Persistence
  try {
    const savedExplorer = safeGetItem(STORAGE_KEYS.EXPLORER);
    if (savedExplorer && typeof savedExplorer === 'object') {
      preloaded.explorer = {
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
        mode: savedExplorer.mode === 'exact' ? 'exact' : 'position',
        isLoading: false,
        error: null
      };
    }
  } catch (e) {
    console.warn('[Persistence] Error loading explorer state:', e);
  }

  // 5. Opponent / Profile Selection Persistence
  try {
    const savedOpponent = safeGetItem(STORAGE_KEYS.OPPONENT);
    if (savedOpponent && typeof savedOpponent === 'object') {
      preloaded.opponent = {
        selectedProfile: savedOpponent.selectedProfile || '',
        profiles: [],
        activeDatabase: savedOpponent.activeDatabase || 'personal',
        isLoading: false
      };
    }
  } catch (e) {
    console.warn('[Persistence] Error loading opponent state:', e);
  }

  return preloaded;
}

/**
 * Loads persisted view and tab selections.
 */
export function getPersistedTabs() {
  const defaults = {
    activeView: 'analysis',
    desktopRightTab: 'explorer',
    mobileTab: 'explorer'
  };

  const saved = safeGetItem(STORAGE_KEYS.TABS);
  if (!saved || typeof saved !== 'object') return defaults;

  return {
    activeView: ['analysis', 'dashboard'].includes(saved.activeView) ? saved.activeView : 'analysis',
    desktopRightTab: ['explorer', 'engine', 'games'].includes(saved.desktopRightTab) ? saved.desktopRightTab : 'explorer',
    mobileTab: ['explorer', 'engine', 'games'].includes(saved.mobileTab) ? saved.mobileTab : 'explorer'
  };
}

/**
 * Saves current tab selection to localStorage.
 */
export function savePersistedTabs(tabs) {
  const current = getPersistedTabs();
  safeSetItem(STORAGE_KEYS.TABS, {
    ...current,
    ...tabs
  });
}

/**
 * Subscribes to the Redux store to debounce and persist state changes to localStorage.
 */
export function subscribePersistence(store) {
  if (typeof window === 'undefined') return () => {};

  let saveTimer = null;
  let lastChessboardFen = null;
  let lastMoveIndex = null;
  let lastOrientation = null;
  let lastSettings = null;
  let lastEngine = null;
  let lastExplorerMode = null;
  let lastSelectedProfile = null;

  return store.subscribe(() => {
    const state = store.getState();

    // Check if relevant states have meaningfully changed
    const boardState = state.chessboard;
    const settingsState = state.settings;
    const engineState = state.engine;
    const explorerState = state.explorer;
    const opponentState = state.opponent;

    const boardChanged = boardState.fen !== lastChessboardFen || 
      boardState.currentMoveIndex !== lastMoveIndex ||
      boardState.orientation !== lastOrientation;
    const settingsChanged = JSON.stringify(settingsState) !== lastSettings;
    const engineChanged = engineState.isEnabled !== lastEngine?.isEnabled ||
      engineState.maxDepth !== lastEngine?.maxDepth ||
      engineState.multiPV !== lastEngine?.multiPV;
    const explorerChanged = explorerState.mode !== lastExplorerMode;
    const opponentChanged = opponentState.selectedProfile !== lastSelectedProfile;

    if (!boardChanged && !settingsChanged && !engineChanged && !explorerChanged && !opponentChanged) {
      return;
    }

    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    saveTimer = setTimeout(() => {
      // 1. Save Chessboard Position
      if (boardChanged) {
        lastChessboardFen = boardState.fen;
        lastMoveIndex = boardState.currentMoveIndex;
        lastOrientation = boardState.orientation;
        safeSetItem(STORAGE_KEYS.CHESSBOARD, {
          fen: boardState.fen,
          normFen: boardState.normFen,
          history: boardState.history,
          currentMoveIndex: boardState.currentMoveIndex,
          lastMove: boardState.lastMove,
          orientation: boardState.orientation
        });
      }

      // 2. Save Settings
      if (settingsChanged) {
        lastSettings = JSON.stringify(settingsState);
        safeSetItem(STORAGE_KEYS.SETTINGS, {
          theme: settingsState.theme,
          boardTheme: settingsState.boardTheme,
          soundEnabled: settingsState.soundEnabled,
          showCoordinates: settingsState.showCoordinates,
          highlightLegalMoves: settingsState.highlightLegalMoves,
          autoEngine: settingsState.autoEngine
        });
      }

      // 3. Save Engine Options
      if (engineChanged) {
        lastEngine = {
          isEnabled: engineState.isEnabled,
          maxDepth: engineState.maxDepth,
          multiPV: engineState.multiPV
        };
        safeSetItem(STORAGE_KEYS.ENGINE, lastEngine);
      }

      // 4. Save Explorer Mode
      if (explorerChanged) {
        lastExplorerMode = explorerState.mode;
        safeSetItem(STORAGE_KEYS.EXPLORER, {
          mode: explorerState.mode
        });
      }

      // 5. Save Selected Profile
      if (opponentChanged) {
        lastSelectedProfile = opponentState.selectedProfile;
        safeSetItem(STORAGE_KEYS.OPPONENT, {
          selectedProfile: opponentState.selectedProfile,
          activeDatabase: opponentState.activeDatabase
        });
      }
    }, 150);
  });
}

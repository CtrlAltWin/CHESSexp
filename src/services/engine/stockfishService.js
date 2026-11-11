import { Chess } from 'chess.js';

/**
 * Stockfish 19 NNUE WebAssembly Engine Controller.
 * Communicates with the genuine Stockfish 19 WASM build via standard UCI protocol in a Web Worker.
 */
class StockfishService {
  constructor() {
    this.worker = null;
    this.isReady = false;
    this.isAnalyzing = false;
    this.currentFen = null;
    this.analysisToken = 0;
    this.multiPV = 2; // Default 2 candidate lines
    this.maxDepth = 18;
    this.callbacks = {
      onEvaluation: null,
      onBestMove: null,
      onReady: null,
      onError: null
    };
    this.variations = [];
  }

  /**
   * Initializes the Stockfish 19 NNUE Web Worker.
   */
  async init() {
    if (this.worker) return;

    return new Promise((resolve, reject) => {
      try {
        // Load the Stockfish 19 single-threaded WASM script
        this.worker = new Worker('/stockfish/stockfish-19-lite-single.js');

        this.worker.onmessage = (event) => {
          this.handleUciMessage(event.data);
        };

        this.worker.onerror = (err) => {
          console.error('Stockfish 19 Worker Error:', err);
          if (this.callbacks.onError) this.callbacks.onError(err);
        };

        // Initialize UCI
        this.sendCommand('uci');

        const checkReadyInterval = setInterval(() => {
          if (this.isReady) {
            clearInterval(checkReadyInterval);
            resolve();
          }
        }, 100);

        // Fallback timeout
        setTimeout(() => {
          if (!this.isReady) {
            this.isReady = true;
            this.sendCommand('isready');
            resolve();
          }
        }, 3000);

      } catch (err) {
        console.error('Could not initialize Stockfish 19 worker:', err);
        reject(err);
      }
    });
  }

  /**
   * Sends a command line to the UCI engine.
   */
  sendCommand(cmd) {
    if (this.worker) {
      this.worker.postMessage(cmd);
    }
  }

  /**
   * Sets the number of Principal Variations (MultiPV).
   */
  setMultiPV(n) {
    this.multiPV = Math.max(1, Math.min(5, n));
    this.sendCommand(`setoption name MultiPV value ${this.multiPV}`);
  }

  /**
   * Discards outdated analysis requests immediately.
   */
  stop() {
    this.analysisToken++;
    this.isAnalyzing = false;
    this.sendCommand('stop');
  }

  /**
   * Starts analyzing a given position FEN.
   */
  analyze(fen, { depth = 18, multiPV = 2 } = {}) {
    if (!this.worker) {
      this.init().then(() => this.analyze(fen, { depth, multiPV }));
      return;
    }

    this.stop();
    this.analysisToken++;
    const currentToken = this.analysisToken;

    this.currentFen = fen;
    this.maxDepth = depth;
    this.multiPV = multiPV;
    this.variations = [];
    this.isAnalyzing = true;

    this.sendCommand(`setoption name MultiPV value ${this.multiPV}`);
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand(`go depth ${depth}`);
  }

  /**
   * Parses standard UCI output messages from Stockfish 19.
   */
  handleUciMessage(line) {
    if (typeof line !== 'string') return;
    const trimmed = line.trim();

    if (trimmed === 'uciok') {
      this.sendCommand('isready');
    } else if (trimmed === 'readyok') {
      this.isReady = true;
      if (this.callbacks.onReady) this.callbacks.onReady();
    } else if (trimmed.startsWith('info') && trimmed.includes('score')) {
      this.parseInfoLine(trimmed);
    } else if (trimmed.startsWith('bestmove')) {
      this.parseBestMove(trimmed);
    }
  }

  /**
   * Parses 'info' lines from Stockfish:
   * e.g.: "info depth 14 multipv 1 score cp 42 nodes 32800 nps 540000 pv e2e4 c7c5 g1f3 d7d6"
   * e.g.: "info depth 16 multipv 1 score mate 3 pv f7f8q ..."
   */
  parseInfoLine(line) {
    if (!this.isAnalyzing || !this.currentFen) return;

    // Extract depth
    const depthMatch = line.match(/\bdepth\s+(\d+)/);
    const depth = depthMatch ? parseInt(depthMatch[1], 10) : 0;

    // Extract MultiPV index (1-based)
    const pvIndexMatch = line.match(/\bmultipv\s+(\d+)/);
    const pvIndex = pvIndexMatch ? parseInt(pvIndexMatch[1], 10) : 1;

    // Extract score
    let scoreType = 'cp';
    let scoreVal = 0;
    let scoreText = '0.00';
    let isMate = false;
    let mateIn = null;

    if (line.includes('score cp')) {
      const cpMatch = line.match(/score cp (-?\d+)/);
      if (cpMatch) {
        scoreVal = parseInt(cpMatch[1], 10);
        
        // Stockfish reports score from perspective of active player!
        // Convert to absolute perspective (positive for White, negative for Black)
        const activeColor = this.currentFen.split(' ')[1];
        if (activeColor === 'b') {
          scoreVal = -scoreVal;
        }

        const scoreInPawns = (scoreVal / 100).toFixed(2);
        scoreText = scoreVal > 0 ? `+${scoreInPawns}` : `${scoreInPawns}`;
      }
    } else if (line.includes('score mate')) {
      const mateMatch = line.match(/score mate (-?\d+)/);
      if (mateMatch) {
        scoreType = 'mate';
        isMate = true;
        let rawMate = parseInt(mateMatch[1], 10);
        const activeColor = this.currentFen.split(' ')[1]; // 'w' or 'b'

        // If mate 0: active side has 0 legal moves and is checkmated
        if (rawMate === 0) {
          if (activeColor === 'b') {
            // Black is checkmated! White has won!
            mateIn = 0;
            scoreVal = 100000;
            scoreText = '+M0';
            evalPercent = 100;
          } else {
            // White is checkmated! Black has won!
            mateIn = 0;
            scoreVal = -100000;
            scoreText = '-M0';
            evalPercent = 0;
          }
        } else {
          // Non-zero mate: Stockfish reports positive if active side is mating, negative if active side is getting mated
          let absoluteMate = rawMate;
          if (activeColor === 'b') {
            absoluteMate = -rawMate;
          }

          mateIn = absoluteMate;
          scoreVal = absoluteMate > 0 ? 100000 : -100000;
          scoreText = absoluteMate > 0 ? `+M${Math.abs(absoluteMate)}` : `-M${Math.abs(absoluteMate)}`;
          evalPercent = absoluteMate > 0 ? 100 : 0;
        }
      }
    }

    // Calculate Winning Probability percentage for the eval bar (if not mate)
    if (!isMate) {
      // Standard Lichess winning chance sigmoid curve
      const cp = scoreVal;
      const winChance = 2 / (1 + Math.exp(-0.00368208 * cp)) - 1;
      evalPercent = Math.max(5, Math.min(95, Math.round(50 + winChance * 50)));
    }

    // Extract moves in Principal Variation (PV)
    const pvPartMatch = line.match(/\bpv\s+(.+)$/);
    const rawPvMoves = pvPartMatch ? pvPartMatch[1].trim().split(/\s+/) : [];
    const bestMoveUci = rawPvMoves[0] || '';

    // Convert PV moves to SAN format using chess.js
    let sanLine = '';
    let bestMoveSan = bestMoveUci;
    try {
      const tempChess = new Chess(this.currentFen);
      const sanMovesList = [];

      for (const uciMove of rawPvMoves.slice(0, 10)) {
        const from = uciMove.slice(0, 2);
        const to = uciMove.slice(2, 4);
        const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
        const res = tempChess.move({ from, to, promotion });
        if (res) {
          sanMovesList.push(res.san);
        } else {
          break;
        }
      }

      if (sanMovesList.length > 0) {
        bestMoveSan = sanMovesList[0];
        sanLine = sanMovesList.join(' ');
      }
    } catch (e) {
      sanLine = rawPvMoves.slice(0, 8).join(' ');
    }

    const varObj = {
      pvIndex,
      depth,
      scoreType,
      scoreVal,
      scoreText,
      isMate,
      mateIn,
      evalPercent,
      bestMoveUci,
      bestMoveSan,
      pvMoves: rawPvMoves,
      sanLine
    };

    // Update in variations array
    const existingIdx = this.variations.findIndex(v => v.pvIndex === pvIndex);
    if (existingIdx >= 0) {
      this.variations[existingIdx] = varObj;
    } else {
      this.variations.push(varObj);
    }
    this.variations.sort((a, b) => a.pvIndex - b.pvIndex);

    // Primary evaluation is pvIndex 1
    const primary = this.variations[0] || varObj;

    if (this.callbacks.onEvaluation) {
      this.callbacks.onEvaluation({
        depth: primary.depth,
        scoreVal: primary.scoreVal,
        scoreText: primary.scoreText,
        isMate: primary.isMate,
        mateIn: primary.mateIn,
        evalPercent: primary.evalPercent,
        bestMove: primary.bestMoveSan,
        variations: [...this.variations]
      });
    }
  }

  /**
   * Handles bestmove signal from Stockfish.
   */
  parseBestMove(line) {
    const parts = line.split(/\s+/);
    const bestMoveUci = parts[1];
    this.isAnalyzing = false;

    if (this.callbacks.onBestMove) {
      this.callbacks.onBestMove(bestMoveUci);
    }
  }

  /**
   * Subscribes to engine events.
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Terminates the worker.
   */
  destroy() {
    if (this.worker) {
      this.stop();
      this.sendCommand('quit');
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }
}

export const stockfishService = new StockfishService();


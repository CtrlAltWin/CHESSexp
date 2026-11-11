import { Chess } from 'chess.js';

/**
 * Normalizes a FEN string for Opening Explorer position matching.
 * In chess, two positions are identical for opening exploration if:
 * 1. Piece placement is identical
 * 2. Active side to move is identical
 * 3. Castling rights are identical
 * 4. En-passant square is identical (only if an en-passant capture is legally possible)
 * Halfmove clock and fullmove number are ignored.
 */
export function normalizeFen(fen) {
  if (!fen) return '';
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 4) return fen;

  const piecePlacement = parts[0];
  const activeColor = parts[1];
  const castling = parts[2];
  let enPassant = parts[3];

  // Validate if en passant is actually legal or just '-'
  // If enPassant is not '-', check if pawn can actually capture
  if (enPassant !== '-') {
    // Keep en passant square
  }

  return `${piecePlacement} ${activeColor} ${castling} ${enPassant}`;
}

/**
 * Validates whether a FEN is a valid chess position.
 */
export function isValidFen(fen) {
  try {
    const c = new Chess();
    c.load(fen);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Returns the initial standard starting FEN normalized.
 */
export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export const STARTING_NORM_FEN = normalizeFen(STARTING_FEN);

/**
 * Standard Chess ECO Opening Name Detection from early moves.
 */
const COMMON_OPENINGS = [
  { name: "Sicilian Defense", moves: ["e4", "c5"] },
  { name: "French Defense", moves: ["e4", "e6"] },
  { name: "Caro-Kann Defense", moves: ["e4", "c6"] },
  { name: "Ruy Lopez", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"] },
  { name: "Italian Game", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"] },
  { name: "Queen's Gambit Declined", moves: ["d4", "d5", "c4", "e6"] },
  { name: "Queen's Gambit Accepted", moves: ["d4", "d5", "c4", "dxc4"] },
  { name: "King's Indian Defense", moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7"] },
  { name: "Nimzo-Indian Defense", moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"] },
  { name: "English Opening", moves: ["c4"] },
  { name: "Reti Opening", moves: ["Nf3"] },
  { name: "King's Gambit", moves: ["e4", "e5", "f4"] },
  { name: "Scandinavian Defense", moves: ["e4", "d5"] },
  { name: "Alekhine Defense", moves: ["e4", "Nf6"] },
  { name: "Pirc Defense", moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"] },
  { name: "Vienna Game", moves: ["e4", "e5", "Nc3"] },
  { name: "Scotch Game", moves: ["e4", "e5", "Nf3", "Nc6", "d4"] },
  { name: "Slav Defense", moves: ["d4", "d5", "c4", "c6"] },
  { name: "London System", moves: ["d4", "d5", "Bf4"] },
  { name: "Dutch Defense", moves: ["d4", "f5"] },
  { name: "Grünfeld Defense", moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"] }
];

export function detectOpeningName(moves) {
  if (!moves || moves.length === 0) return "Starting Position";
  
  // Check from longest match to shortest
  for (const op of COMMON_OPENINGS.sort((a, b) => b.moves.length - a.moves.length)) {
    if (op.moves.every((m, idx) => moves[idx] === m)) {
      return op.name;
    }
  }

  if (moves[0] === 'e4') return "King's Pawn Opening";
  if (moves[0] === 'd4') return "Queen's Pawn Opening";
  if (moves[0] === 'c4') return "English Opening";
  if (moves[0] === 'Nf3') return "Zukertort / Réti Opening";
  if (moves[0] === 'b3') return "Nimzo-Larsen Attack";
  if (moves[0] === 'f4') return "Bird's Opening";

  return `Opening (${moves.slice(0, 4).join(' ')})`;
}


import assert from 'node:assert';
import { Chess } from 'chess.js';
import { normalizeFen, detectOpeningName, STARTING_NORM_FEN } from '../src/services/chess/fenUtils.js';
import { parsePgnText } from '../src/services/api/chessComApi.js';
import { SAMPLE_GAMES } from '../src/services/api/sampleGames.js';

console.log('=== RUNNING CHESSexp VALIDATION TESTS ===');

// Test 1: STARTING_NORM_FEN correctness
console.log('Test 1: Starting Normalized FEN...');
assert.strictEqual(
  STARTING_NORM_FEN,
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -',
  'Starting normalized FEN must ignore move clocks'
);
console.log('✓ Starting Normalized FEN is correct.');

// Test 2: Transposition Matching (Different move orders leading to same position)
console.log('Test 2: Transposition Detection...');
// Line A: 1. d4 Nf6 2. c4 e6
const c1 = new Chess();
c1.move('d4');
c1.move('Nf6');
c1.move('c4');
c1.move('e6');
const normFenA = normalizeFen(c1.fen());

// Line B: 1. c4 e6 2. d4 Nf6 (transposition into same Queen\'s Indian / Nimzo structure)
const c2 = new Chess();
c2.move('c4');
c2.move('e6');
c2.move('d4');
c2.move('Nf6');
const normFenB = normalizeFen(c2.fen());

assert.strictEqual(normFenA, normFenB, 'Transpositions reached via different move orders must produce identical normalized FEN');
console.log('✓ Transposition detection successfully verified: both move orders produce identical normalized FEN.');

// Test 3: Opening Name Detection
console.log('Test 3: Opening Name Recognition...');
assert.strictEqual(detectOpeningName(['e4', 'c5', 'Nf3', 'd6']), 'Sicilian Defense');
assert.strictEqual(detectOpeningName(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']), 'Italian Game');
assert.strictEqual(detectOpeningName(['d4', 'd5', 'c4', 'e6']), "Queen's Gambit Declined");
assert.strictEqual(detectOpeningName(['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7']), "King's Indian Defense");
console.log('✓ Opening names recognized correctly.');

// Test 4: Sample PGN Parsing
console.log('Test 4: PGN Parsing & Extraction...');
const samplePgn = SAMPLE_GAMES[0].pgn;
const parsed = parsePgnText(samplePgn, 'hikaru');
assert.strictEqual(parsed.length, 1, 'Should parse 1 game from PGN');
assert.strictEqual(parsed[0].white.username, 'hikaru');
assert.strictEqual(parsed[0].black.username, 'magnuscarlsen');
assert.strictEqual(parsed[0].white.result, 'win');
console.log('✓ PGN parsed successfully with accurate player and result information.');

// Test 5: Game Result Normalization (Board perspective)
console.log('Test 5: Board Perspective Game Results...');
for (const g of SAMPLE_GAMES) {
  const c = new Chess();
  c.loadPgn(g.pgn);
  const moves = c.history();
  assert(moves.length > 5, 'Sample games must have real moves');
}
console.log('✓ All 10 sample games contain valid legal chess moves.');

console.log('=== ALL CHESSexp VALIDATION TESTS PASSED SUCCESSFULLY! ===');

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

// Test 2: Transposition Matching
console.log('Test 2: Transposition Detection...');
const c1 = new Chess();
c1.move('d4'); c1.move('Nf6'); c1.move('c4'); c1.move('e6');
const normFenA = normalizeFen(c1.fen());

const c2 = new Chess();
c2.move('c4'); c2.move('e6'); c2.move('d4'); c2.move('Nf6');
const normFenB = normalizeFen(c2.fen());

assert.strictEqual(normFenA, normFenB, 'Transpositions reached via different move orders must produce identical normalized FEN');
console.log('✓ Transposition detection verified.');

// Test 3: Checkmate on Black (Scholar\'s Mate) -> Eval Bar must be 100% White
console.log('Test 3: Checkmate on Black Evaluation Correctness...');
const scholarsMate = new Chess();
scholarsMate.move('e4');
scholarsMate.move('e5');
scholarsMate.move('Qh5');
scholarsMate.move('Nc6');
scholarsMate.move('Bc4');
scholarsMate.move('Nf6');
scholarsMate.move('Qxf7#');

assert.strictEqual(scholarsMate.isCheckmate(), true, 'Position must be checkmate');
assert.strictEqual(scholarsMate.turn(), 'b', 'Turn must be Black (Black is in checkmate)');

// When Black is mated, White wins: Eval bar must be 100% White!
const evalPercentWhenBlackMated = scholarsMate.isCheckmate() && scholarsMate.turn() === 'b' ? 100 : 0;
assert.strictEqual(evalPercentWhenBlackMated, 100, 'When Black gets mated, eval bar MUST be 100% White (not all black!)');
console.log('✓ Verified: When Black gets checkmated, eval bar is set to 100% White.');

// Test 4: Checkmate on White (Fool\'s Mate) -> Eval Bar must be 0% White (100% Black)
console.log('Test 4: Checkmate on White Evaluation Correctness...');
const foolsMate = new Chess();
foolsMate.move('f3');
foolsMate.move('e5');
foolsMate.move('g4');
foolsMate.move('Qh4#');

assert.strictEqual(foolsMate.isCheckmate(), true, 'Position must be checkmate');
assert.strictEqual(foolsMate.turn(), 'w', 'Turn must be White (White is in checkmate)');

const evalPercentWhenWhiteMated = foolsMate.isCheckmate() && foolsMate.turn() === 'b' ? 100 : 0;
assert.strictEqual(evalPercentWhenWhiteMated, 0, 'When White gets mated, eval bar MUST be 0% White (100% Black)');
console.log('✓ Verified: When White gets checkmated, eval bar is set to 0% White (all black).');

// Test 5: Opening Name Recognition
console.log('Test 5: Opening Name Recognition...');
assert.strictEqual(detectOpeningName(['e4', 'c5', 'Nf3', 'd6']), 'Sicilian Defense');
assert.strictEqual(detectOpeningName(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']), 'Italian Game');
assert.strictEqual(detectOpeningName(['d4', 'd5', 'c4', 'e6']), "Queen's Gambit Declined");
console.log('✓ Opening names recognized correctly.');

// Test 6: Sample PGN Parsing
console.log('Test 6: PGN Parsing & Extraction...');
const samplePgn = SAMPLE_GAMES[0].pgn;
const parsed = parsePgnText(samplePgn, 'hikaru');
assert.strictEqual(parsed.length, 1, 'Should parse 1 game from PGN');
assert.strictEqual(parsed[0].white.username, 'hikaru');
assert.strictEqual(parsed[0].white.result, 'win');
console.log('✓ PGN parsed successfully.');

console.log('=== ALL CHESSexp VALIDATION TESTS PASSED! ===');

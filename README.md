# CHESSexp ♙

**Personalized Chess Opening Explorer & Opponent Preparation Platform**

CHESSexp is a high-performance, local-first chess analysis web application inspired by Lichess Opening Explorer and modern SaaS engineering, featuring genuine **Stockfish 19 NNUE WebAssembly** engine analysis and opening statistics built exclusively from imported **Chess.com** historical games.

---

## 🌟 Key Features

### 1. Brand Identity & Visual Design
- **Wordmark**: `CHESS` in bold foreground typography + `exp` in vibrant chess-inspired green (`#48c774`).
- **Logo**: Vector Chess Bishop piece tilted intentionally at **16 degrees**, styled cleanly for both dark and light modes.
- **Minimal, Distraction-Free UX**: Deep contrast palettes, subtle borders, high-performance SVG piece rendering, and zero decorative clutter.

### 2. Personalized Opening Explorer
- **Zero Global / Master Databases**: Statistics are computed strictly from your imported personal games or opponent profile archives.
- **Transposition & Exact Line Matching**: Analyzes positions by normalized FEN (piece placement, side to move, castling rights, and en-passant legality), discovering transpositions regardless of move order.
- **Real-Time Continuations**: Displays move frequency, game counts, White wins, Draws, and Black wins with Lichess-style horizontal percentage bars.
- **True Board Perspective**: White wins count as White wins, Draws as Draws, and Black wins as Black wins.

### 3. Stockfish 19 NNUE WASM Integration
- Genuine **Stockfish 19 WebAssembly** build with single-threaded NNUE evaluation.
- Runs in a background **Web Worker** communicating over the standard **UCI protocol**.
- **Live Evaluation Bar**: Smooth winning chance sigmoid gradient with positive scores for White advantage, negative for Black advantage, and mate notation (`+M3`, `-M2`).
- **Multi-Line Analysis (MultiPV)**: Evaluates up to 3 candidate lines with depth, evaluation, and SAN variations.
- **Clear Separation**: Distinguishes between historical moves played in the database and Stockfish preparation novelties.

### 4. Historical Games & Click-to-Analyze
- Displays every historical game from the selected database matching the current board position.
- Filter games by Result (Win / Draw / Loss), Colour (White / Black), and Speed (Bullet / Blitz / Rapid / Daily).
- **Click-to-Analyze**: Loads any game's complete PGN directly onto the board, jumps to the matching position, and lets you explore forward/backward with Stockfish evaluation.
- **Restore Exploration State**: One-click return restores your previous exploration position without losing your place.

### 5. Opponent Preparation & Repertoire Dashboard
- Opponent profile switcher: study your own repertoire or analyze specific opponents.
- Win rate breakdown as White vs. Black.
- Identification of **Strongest Openings** (repertoire pillars) and **Weakest Openings** (vulnerable lines needing preparation).
- Frequency breakdown of commonly reached positions.

### 6. Chess.com Account Import & Local-First Storage
- Fetches public game archives directly via the **Chess.com Published Data API**.
- Offline-ready **IndexedDB** storage with duplicate detection.
- Fast batch indexing: calculates normalized FENs and continuations at import time for instant $O(1)$ lookups during exploration.
- Also supports direct PGN file upload/paste and pre-indexed Grandmaster sample databases (Hikaru Nakamura, Magnus Carlsen, Daniel Naroditsky).

---

## 🛠 Tech Stack

- **Frontend**: React 18, JavaScript (ES6+), Vite, Tailwind CSS
- **State Management**: Redux Toolkit (7 feature slices: `chessboardSlice`, `opponentSlice`, `explorerSlice`, `gamesSlice`, `engineSlice`, `importSlice`, `settingsSlice`)
- **Chess Engine**: Stockfish 19 NNUE WASM
- **Chess Libraries**: `chess.js`, `react-chessboard`
- **Database**: IndexedDB (`idb`)
- **Sound**: Dynamic Web Audio API synthesizer (offline, no external audio files required)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
npm run preview
```

### 4. Run Automated Validation Tests
```bash
node test/chessValidation.test.js
```

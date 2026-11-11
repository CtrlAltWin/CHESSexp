import { getDb } from './indexedDb.js';
import { Chess } from 'chess.js';
import { normalizeFen, detectOpeningName, STARTING_NORM_FEN } from '../chess/fenUtils.js';

/**
 * Saves or updates an imported player profile.
 */
export async function saveProfile(profile) {
  const db = await getDb();
  await db.put('profiles', {
    ...profile,
    username: profile.username.toLowerCase(),
    updatedAt: Date.now()
  });
}

/**
 * Retrieves all saved profiles.
 */
export async function getProfiles() {
  const db = await getDb();
  return await db.getAll('profiles');
}

/**
 * Retrieves a single profile by username.
 */
export async function getProfile(username) {
  if (!username) return null;
  const db = await getDb();
  return await db.get('profiles', username.toLowerCase());
}

/**
 * Deletes a profile and all its games and indexed positions.
 */
export async function deleteProfile(username) {
  const normUser = username.toLowerCase();
  const db = await getDb();
  
  // Delete profile
  await db.delete('profiles', normUser);

  // Delete all games
  const txGames = db.transaction('games', 'readwrite');
  const gamesIndex = txGames.store.index('by_profile');
  let cursor = await gamesIndex.openCursor(normUser);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await txGames.done;

  // Delete all positions
  const txPos = db.transaction('positions', 'readwrite');
  const posIndex = txPos.store.index('by_profile');
  let posCursor = await posIndex.openCursor(normUser);
  while (posCursor) {
    await posCursor.delete();
    posCursor = await posCursor.continue();
  }
  await txPos.done;

  // Delete all lines
  const txLines = db.transaction('lines', 'readwrite');
  const linesIndex = txLines.store.index('by_profile');
  let lineCursor = await linesIndex.openCursor(normUser);
  while (lineCursor) {
    await lineCursor.delete();
    lineCursor = await lineCursor.continue();
  }
  await txLines.done;
}

/**
 * Indexes a batch of Chess.com raw game objects.
 * Accurately parses PGNs, calculates normalized FENs, updates continuations,
 * and maintains database integrity.
 */
export async function indexGamesForProfile(profileUsername, rawGames, onProgress) {
  const normUser = profileUsername.toLowerCase();
  const db = await getDb();

  const total = rawGames.length;
  let importedCount = 0;
  let duplicateCount = 0;

  // Cache existing positions from DB in memory to avoid repeated DB hits
  const positionsCache = new Map();
  const linesCache = new Map();

  // Load existing positions for this profile into cache
  const existingPositions = await db.getAllFromIndex('positions', 'by_profile', normUser);
  for (const pos of existingPositions) {
    positionsCache.set(pos.normFen, pos);
  }

  const existingLines = await db.getAllFromIndex('lines', 'by_profile', normUser);
  for (const line of existingLines) {
    linesCache.set(line.lineKey, line);
  }

  // Stats accumulators for profile dashboard
  let whiteWins = 0, whiteLosses = 0, whiteDraws = 0;
  let blackWins = 0, blackLosses = 0, blackDraws = 0;
  let opponentRatingSum = 0;
  let opponentCount = 0;
  const openingsCountMap = new Map();

  const BATCH_SIZE = 100;
  const gameRecordsToInsert = [];

  for (let i = 0; i < total; i++) {
    const raw = rawGames[i];
    if (onProgress && i % 25 === 0) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
        status: `Processing game ${i + 1} of ${total}...`
      });
    }

    const gameId = raw.uuid || raw.url || `game_${normUser}_${raw.end_time || Date.now()}_${i}`;

    // Check if game already in DB
    const existingGame = await db.get('games', gameId);
    if (existingGame) {
      duplicateCount++;
      continue;
    }

    // Extract White / Black information
    const whiteUser = (raw.white?.username || 'White').toLowerCase();
    const blackUser = (raw.black?.username || 'Black').toLowerCase();
    const whiteRating = parseInt(raw.white?.rating, 10) || 1500;
    const blackRating = parseInt(raw.black?.rating, 10) || 1500;
    const whiteResult = raw.white?.result || '';
    const blackResult = raw.black?.result || '';

    const isUserWhite = whiteUser === normUser;
    const isUserBlack = blackUser === normUser;

    const opponentRating = isUserWhite ? blackRating : isUserBlack ? whiteRating : null;
    if (opponentRating) {
      opponentRatingSum += opponentRating;
      opponentCount++;
    }

    // Determine standard result from board perspective: '1-0', '0-1', '1/2-1/2'
    let boardResult = '1/2-1/2';
    if (['win'].includes(whiteResult) || ['checkmated', 'resigned', 'timeout', 'abandoned'].includes(blackResult)) {
      boardResult = '1-0';
    } else if (['win'].includes(blackResult) || ['checkmated', 'resigned', 'timeout', 'abandoned'].includes(whiteResult)) {
      boardResult = '0-1';
    }

    // Aggregate user win/loss statistics
    if (isUserWhite) {
      if (boardResult === '1-0') whiteWins++;
      else if (boardResult === '0-1') whiteLosses++;
      else whiteDraws++;
    } else if (isUserBlack) {
      if (boardResult === '0-1') blackWins++;
      else if (boardResult === '1-0') blackLosses++;
      else blackDraws++;
    }

    // Parse PGN or moves using chess.js
    let chess = new Chess();
    let moves = [];
    try {
      if (raw.pgn) {
        chess.loadPgn(raw.pgn);
        moves = chess.history({ verbose: true });
      }
    } catch (e) {
      // If full PGN fails, try raw moves string
      try {
        chess = new Chess();
        const pgnText = (raw.pgn || '').replace(/\{[^}]*\}/g, ''); // strip comments
        chess.loadPgn(pgnText);
        moves = chess.history({ verbose: true });
      } catch (err) {
        moves = [];
      }
    }

    // Determine Opening
    const sanMoves = moves.map(m => m.san);
    const openingName = detectOpeningName(sanMoves.slice(0, 10));
    openingsCountMap.set(openingName, (openingsCountMap.get(openingName) || 0) + 1);

    const gameRecord = {
      id: gameId,
      profileUsername: normUser,
      url: raw.url || '',
      endTime: raw.end_time ? raw.end_time * 1000 : Date.now(),
      date: raw.end_time ? new Date(raw.end_time * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      timeControl: raw.time_control || 'N/A',
      timeClass: raw.time_class || 'blitz',
      rated: raw.rated ?? true,
      white: {
        username: raw.white?.username || 'White',
        rating: whiteRating,
        result: whiteResult
      },
      black: {
        username: raw.black?.username || 'Black',
        rating: blackRating,
        result: blackResult
      },
      boardResult,
      pgn: raw.pgn || '',
      moves: sanMoves,
      openingName
    };

    gameRecordsToInsert.push(gameRecord);
    importedCount++;

    // Replay moves from start to index positions up to 50 plies (25 full moves)
    const replayChess = new Chess();
    const maxPliesToIndex = Math.min(moves.length, 50);

    // Track positions and continuations already visited in THIS game to prevent multi-count
    const visitedFensInThisGame = new Set();
    const visitedContsInThisGame = new Set();

    const isUserWin = (isUserWhite && boardResult === '1-0') || (isUserBlack && boardResult === '0-1');
    const isUserLoss = (isUserWhite && boardResult === '0-1') || (isUserBlack && boardResult === '1-0');
    const isUserDraw = boardResult === '1/2-1/2';

    for (let ply = 0; ply <= maxPliesToIndex; ply++) {
      const currentNormFen = normalizeFen(replayChess.fen());
      const nextMove = moves[ply]; // null at end

      // Update position stats
      let posData = positionsCache.get(currentNormFen);
      if (!posData) {
        posData = {
          profileUsername: normUser,
          normFen: currentNormFen,
          gamesCount: 0,
          whiteWins: 0,
          draws: 0,
          blackWins: 0,
          userWins: 0,
          userDraws: 0,
          userLosses: 0,
          continuations: {},
          gameIds: []
        };
        positionsCache.set(currentNormFen, posData);
      }

      // Only count game once per position
      if (!visitedFensInThisGame.has(currentNormFen)) {
        visitedFensInThisGame.add(currentNormFen);
        if (!posData.gameIds.includes(gameId)) {
          posData.gameIds.push(gameId);
          posData.gamesCount = posData.gameIds.length;
          if (boardResult === '1-0') posData.whiteWins = (posData.whiteWins || 0) + 1;
          else if (boardResult === '0-1') posData.blackWins = (posData.blackWins || 0) + 1;
          else posData.draws = (posData.draws || 0) + 1;

          if (isUserWin) posData.userWins = (posData.userWins || 0) + 1;
          else if (isUserLoss) posData.userLosses = (posData.userLosses || 0) + 1;
          else if (isUserDraw) posData.userDraws = (posData.userDraws || 0) + 1;
        }
      }

      // If there is a next continuation move
      if (nextMove) {
        const san = nextMove.san;
        const uci = `${nextMove.from}${nextMove.to}${nextMove.promotion || ''}`;
        const contKey = `${currentNormFen}_${san}`;

        if (!posData.continuations[san]) {
          posData.continuations[san] = {
            san,
            uci,
            from: nextMove.from,
            to: nextMove.to,
            gamesCount: 0,
            whiteWins: 0,
            draws: 0,
            blackWins: 0,
            userWins: 0,
            userDraws: 0,
            userLosses: 0,
            gameIds: []
          };
        }

        const cont = posData.continuations[san];
        if (!visitedContsInThisGame.has(contKey)) {
          visitedContsInThisGame.add(contKey);
          if (!cont.gameIds.includes(gameId)) {
            cont.gameIds.push(gameId);
            cont.gamesCount = cont.gameIds.length;
            if (boardResult === '1-0') cont.whiteWins = (cont.whiteWins || 0) + 1;
            else if (boardResult === '0-1') cont.blackWins = (cont.blackWins || 0) + 1;
            else cont.draws = (cont.draws || 0) + 1;

            if (isUserWin) cont.userWins = (cont.userWins || 0) + 1;
            else if (isUserLoss) cont.userLosses = (cont.userLosses || 0) + 1;
            else if (isUserDraw) cont.userDraws = (cont.userDraws || 0) + 1;
          }
        }

        // Apply move to replayChess for next ply
        replayChess.move(nextMove);

        // Record exact line up to maxPliesToIndex
        const lineKey = sanMoves.slice(0, ply + 1).join(' ');
        let lineData = linesCache.get(lineKey);
        if (!lineData) {
          lineData = {
            profileUsername: normUser,
            lineKey,
            gameIds: []
          };
          linesCache.set(lineKey, lineData);
        }
        if (!lineData.gameIds.includes(gameId)) {
          lineData.gameIds.push(gameId);
        }
      }
    }
  }

  // Save games into DB in transaction batches
  if (onProgress) {
    onProgress({
      current: total,
      total,
      percentage: 92,
      status: 'Writing indexed positions to database...'
    });
  }

  const tx = db.transaction(['games', 'positions', 'lines'], 'readwrite');
  
  // Save games
  for (const game of gameRecordsToInsert) {
    await tx.objectStore('games').put(game);
  }

  // Save positions
  for (const posData of positionsCache.values()) {
    await tx.objectStore('positions').put(posData);
  }

  // Save lines
  for (const lineData of linesCache.values()) {
    await tx.objectStore('lines').put(lineData);
  }

  await tx.done;

  // Update profile record with aggregated statistics
  const existingProf = (await getProfile(normUser)) || {};
  const totalGamesIndexed = (existingProf.totalGames || 0) + importedCount;
  const totWhite = (existingProf.whiteWins || 0) + whiteWins + (existingProf.whiteLosses || 0) + whiteLosses + (existingProf.whiteDraws || 0) + whiteDraws;
  const totBlack = (existingProf.blackWins || 0) + blackWins + (existingProf.blackLosses || 0) + blackLosses + (existingProf.blackDraws || 0) + blackDraws;
  const totalWins = (existingProf.whiteWins || 0) + whiteWins + (existingProf.blackWins || 0) + blackWins;
  const winRate = totalGamesIndexed > 0 ? Math.round((totalWins / totalGamesIndexed) * 100) : 0;
  const avgOppRating = opponentCount > 0 ? Math.round(opponentRatingSum / opponentCount) : (existingProf.avgOpponentRating || 1500);

  // Top openings array
  const topOpenings = Array.from(openingsCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const updatedProfile = {
    ...existingProf,
    username: normUser,
    displayName: existingProf.displayName || profileUsername,
    totalGames: totalGamesIndexed,
    winRate,
    whiteWins: (existingProf.whiteWins || 0) + whiteWins,
    whiteLosses: (existingProf.whiteLosses || 0) + whiteLosses,
    whiteDraws: (existingProf.whiteDraws || 0) + whiteDraws,
    blackWins: (existingProf.blackWins || 0) + blackWins,
    blackLosses: (existingProf.blackLosses || 0) + blackLosses,
    blackDraws: (existingProf.blackDraws || 0) + blackDraws,
    avgOpponentRating: avgOppRating,
    topOpenings,
    lastImported: Date.now()
  };

  await saveProfile(updatedProfile);

  if (onProgress) {
    onProgress({
      current: total,
      total,
      percentage: 100,
      status: `Successfully imported ${importedCount} games!`
    });
  }

  return {
    importedCount,
    duplicateCount,
    totalGames: totalGamesIndexed
  };
}

/**
 * Retrieves opening explorer statistics for a given position FEN and profile.
 */
export async function getPositionStats(profileUsername, normFen) {
  if (!profileUsername || !normFen) return null;
  const normUser = profileUsername.toLowerCase();
  const db = await getDb();

  const posData = await db.get('positions', [normUser, normFen]);
  if (!posData) {
    return {
      gamesCount: 0,
      whiteWins: 0,
      draws: 0,
      blackWins: 0,
      whiteWinPct: 0,
      drawPct: 0,
      blackWinPct: 0,
      moves: [],
      gameIds: []
    };
  }

  const gameIds = posData.gameIds || [];
  if (gameIds.length === 0) {
    return {
      gamesCount: 0,
      whiteWins: 0,
      draws: 0,
      blackWins: 0,
      whiteWinPct: 0,
      drawPct: 0,
      blackWinPct: 0,
      moves: [],
      gameIds: []
    };
  }

  // Load actual games from DB to calculate 100% verified, consistent stats
  // and heal any legacy doubled/corrupted counts in posData
  const gamesMap = new Map();
  for (const id of gameIds) {
    const g = await db.get('games', id);
    if (g) gamesMap.set(id, g);
  }

  const validGames = Array.from(gamesMap.values());
  const gamesCount = validGames.length > 0 ? validGames.length : gameIds.length;

  let whiteWins = 0, draws = 0, blackWins = 0;
  if (validGames.length > 0) {
    for (const g of validGames) {
      const br = g.boardResult || '1/2-1/2';
      if (br === '1-0') whiteWins++;
      else if (br === '0-1') blackWins++;
      else draws++;
    }
  } else {
    // If games not loaded yet, normalize raw posData so sum strictly equals gamesCount
    const rawW = posData.whiteWins || 0;
    const rawD = posData.draws || 0;
    const rawB = posData.blackWins || 0;
    const rawTot = rawW + rawD + rawB;
    if (rawTot > 0) {
      whiteWins = Math.round((rawW / rawTot) * gamesCount);
      draws = Math.round((rawD / rawTot) * gamesCount);
      blackWins = Math.max(0, gamesCount - whiteWins - draws);
    }
  }

  const whiteWinPct = gamesCount > 0 ? Math.round((whiteWins / gamesCount) * 100) : 0;
  const drawPct = gamesCount > 0 ? Math.round((draws / gamesCount) * 100) : 0;
  const blackWinPct = gamesCount > 0 ? Math.max(0, 100 - whiteWinPct - drawPct) : 0;

  // Active turn on board determines who played the continuation move
  const activeColor = normFen.split(' ')[1] || 'w';

  // Convert continuations map to sorted array with verified, mathematically consistent counts
  const moves = Object.values(posData.continuations || {}).map(c => {
    const cGameIds = c.gameIds || [];
    let cWhiteWins = 0, cDraws = 0, cBlackWins = 0;
    let cUserWins = 0, cUserDraws = 0;

    if (validGames.length > 0 && cGameIds.length > 0) {
      for (const gid of cGameIds) {
        const g = gamesMap.get(gid);
        if (!g) continue;
        const br = g.boardResult || '1/2-1/2';
        if (br === '1-0') cWhiteWins++;
        else if (br === '0-1') cBlackWins++;
        else cDraws++;

        const isUserWhite = (g.white?.username || '').toLowerCase() === normUser;
        const isUserBlack = (g.black?.username || '').toLowerCase() === normUser;
        const isWon = (isUserWhite && br === '1-0') || (isUserBlack && br === '0-1');
        const isDraw = br === '1/2-1/2';
        if (isWon) cUserWins++;
        else if (isDraw) cUserDraws++;
      }
    } else {
      // Safe fallback if games not in store
      const cRawTot = (c.whiteWins || 0) + (c.draws || 0) + (c.blackWins || 0);
      const cCnt = cGameIds.length > 0 ? cGameIds.length : (c.gamesCount || 0);
      if (cRawTot > 0) {
        cWhiteWins = Math.round(((c.whiteWins || 0) / cRawTot) * cCnt);
        cDraws = Math.round(((c.draws || 0) / cRawTot) * cCnt);
        cBlackWins = Math.max(0, cCnt - cWhiteWins - cDraws);
      }
      cUserWins = Math.min(cCnt, c.userWins !== undefined ? c.userWins : (activeColor === 'w' ? cWhiteWins : cBlackWins));
      cUserDraws = Math.min(cCnt - cUserWins, c.userDraws !== undefined ? c.userDraws : cDraws);
    }

    const cGamesCount = (cWhiteWins + cDraws + cBlackWins) || cGameIds.length || (c.gamesCount || 0);
    const freq = gamesCount > 0 ? ((cGamesCount / gamesCount) * 100).toFixed(1) : '0';

    const wPct = cGamesCount > 0 ? Math.round((cWhiteWins / cGamesCount) * 100) : 0;
    const dPct = cGamesCount > 0 ? Math.round((cDraws / cGamesCount) * 100) : 0;
    const bPct = cGamesCount > 0 ? Math.max(0, 100 - wPct - dPct) : 0;

    // Personal score clamped strictly between 0% and 100%
    const rawScore = cGamesCount > 0 
      ? Math.round(((cUserWins + cUserDraws * 0.5) / cGamesCount) * 100) 
      : 0;
    const scorePct = Math.min(100, Math.max(0, rawScore));

    return {
      san: c.san,
      uci: c.uci,
      from: c.from,
      to: c.to,
      gamesCount: cGamesCount,
      frequencyPct: parseFloat(freq),
      whiteWins: cWhiteWins,
      draws: cDraws,
      blackWins: cBlackWins,
      whiteWinPct: wPct,
      drawPct: dPct,
      blackWinPct: bPct,
      scorePct,
      gameIds: cGameIds
    };
  }).sort((a, b) => b.gamesCount - a.gamesCount);

  return {
    gamesCount,
    whiteWins,
    draws,
    blackWins,
    whiteWinPct,
    drawPct,
    blackWinPct,
    moves,
    gameIds
  };
}

/**
 * Retrieves statistics for an exact move line.
 */
export async function getExactLineStats(profileUsername, lineMoves) {
  if (!profileUsername) return null;
  const normUser = profileUsername.toLowerCase();
  const db = await getDb();

  const lineKey = lineMoves.join(' ');
  const lineData = await db.get('lines', [normUser, lineKey]);
  if (!lineData || !lineData.gameIds || lineData.gameIds.length === 0) {
    return null;
  }

  // Get matching games
  return lineData.gameIds;
}

/**
 * Retrieves full Opening Explorer statistics for an exact move line.
 * Guarantees that gamesCount, results bar, candidate moves, and matching games tab
 * all operate on the exact same underlying games that followed this exact move order.
 */
export async function getExactLineFullStats(profileUsername, lineMoves, normFen) {
  if (!profileUsername || !lineMoves || lineMoves.length === 0) {
    return getPositionStats(profileUsername, normFen);
  }
  const normUser = profileUsername.toLowerCase();
  const db = await getDb();

  const lineKey = lineMoves.join(' ');
  const lineData = await db.get('lines', [normUser, lineKey]);
  if (!lineData || !lineData.gameIds || lineData.gameIds.length === 0) {
    return {
      gamesCount: 0,
      whiteWins: 0,
      draws: 0,
      blackWins: 0,
      whiteWinPct: 0,
      drawPct: 0,
      blackWinPct: 0,
      moves: [],
      gameIds: []
    };
  }

  const matchingGameIds = lineData.gameIds;
  const games = [];
  for (const id of matchingGameIds) {
    const g = await db.get('games', id);
    if (g) games.push(g);
  }

  const gamesCount = games.length;
  if (gamesCount === 0) {
    return {
      gamesCount: 0,
      whiteWins: 0,
      draws: 0,
      blackWins: 0,
      whiteWinPct: 0,
      drawPct: 0,
      blackWinPct: 0,
      moves: [],
      gameIds: []
    };
  }

  let whiteWins = 0, draws = 0, blackWins = 0;
  const continuationsMap = new Map();
  const plyIndex = lineMoves.length; // 0-based index of continuation move

  for (const game of games) {
    const boardResult = game.boardResult || '1/2-1/2';
    if (boardResult === '1-0') whiteWins++;
    else if (boardResult === '0-1') blackWins++;
    else draws++;

    const isUserWhite = (game.white?.username || '').toLowerCase() === normUser;
    const isUserBlack = (game.black?.username || '').toLowerCase() === normUser;
    const isUserWin = (isUserWhite && boardResult === '1-0') || (isUserBlack && boardResult === '0-1');
    const isUserDraw = boardResult === '1/2-1/2';

    // Next continuation move in this exact line
    const nextSan = game.moves ? game.moves[plyIndex] : null;
    if (nextSan) {
      if (!continuationsMap.has(nextSan)) {
        continuationsMap.set(nextSan, {
          san: nextSan,
          gamesCount: 0,
          whiteWins: 0,
          draws: 0,
          blackWins: 0,
          userWins: 0,
          userDraws: 0,
          gameIds: []
        });
      }
      const cont = continuationsMap.get(nextSan);
      cont.gamesCount++;
      if (boardResult === '1-0') cont.whiteWins++;
      else if (boardResult === '0-1') cont.blackWins++;
      else cont.draws++;

      if (isUserWin) cont.userWins++;
      else if (isUserDraw) cont.userDraws++;

      if (!cont.gameIds.includes(game.id)) {
        cont.gameIds.push(game.id);
      }
    }
  }

  const whiteWinPct = Math.round((whiteWins / gamesCount) * 100);
  const drawPct = Math.round((draws / gamesCount) * 100);
  const blackWinPct = Math.max(0, 100 - whiteWinPct - drawPct);

  // Compute chess details (from, to, uci) for candidate moves using Chess
  let chessReplay = null;
  try {
    chessReplay = new Chess();
    for (const m of lineMoves) {
      chessReplay.move(m);
    }
  } catch (e) {}

  const moves = Array.from(continuationsMap.values()).map(c => {
    let from = '', to = '', uci = '';
    if (chessReplay) {
      try {
        const testChess = new Chess(chessReplay.fen());
        const moveRes = testChess.move(c.san);
        if (moveRes) {
          from = moveRes.from;
          to = moveRes.to;
          uci = `${moveRes.from}${moveRes.to}${moveRes.promotion || ''}`;
        }
      } catch (e) {}
    }

    const freq = ((c.gamesCount / gamesCount) * 100).toFixed(1);
    const wPct = Math.round((c.whiteWins / c.gamesCount) * 100);
    const dPct = Math.round((c.draws / c.gamesCount) * 100);
    const bPct = Math.max(0, 100 - wPct - dPct);

    const scorePct = Math.round(((c.userWins + c.userDraws * 0.5) / c.gamesCount) * 100);

    return {
      san: c.san,
      uci,
      from,
      to,
      gamesCount: c.gamesCount,
      frequencyPct: parseFloat(freq),
      whiteWins: c.whiteWins,
      draws: c.draws,
      blackWins: c.blackWins,
      whiteWinPct: wPct,
      drawPct: dPct,
      blackWinPct: bPct,
      scorePct,
      gameIds: c.gameIds
    };
  }).sort((a, b) => b.gamesCount - a.gamesCount);

  return {
    gamesCount,
    whiteWins,
    draws,
    blackWins,
    whiteWinPct,
    drawPct,
    blackWinPct,
    moves,
    gameIds: games.map(g => g.id)
  };
}

/**
 * Retrieves game objects by IDs and applies user filters.
 */
export async function getGamesByIds(gameIds, filters = {}) {
  if (!gameIds || gameIds.length === 0) return [];
  const db = await getDb();

  const results = [];
  // Load games (limit to 100 for fast UI performance)
  const idsToFetch = gameIds.slice(0, 100);

  for (const id of idsToFetch) {
    const game = await db.get('games', id);
    if (!game) continue;

    // Apply filters
    if (filters.result && filters.result !== 'all') {
      if (filters.result === 'win' && game.boardResult !== '1-0') continue;
      if (filters.result === 'loss' && game.boardResult !== '0-1') continue;
      if (filters.result === 'draw' && game.boardResult !== '1/2-1/2') continue;
    }

    if (filters.color && filters.color !== 'all') {
      const isWhite = (game.white?.username || '').toLowerCase() === (game.profileUsername || '').toLowerCase();
      if (filters.color === 'white' && !isWhite) continue;
      if (filters.color === 'black' && isWhite) continue;
    }

    if (filters.timeClass && filters.timeClass !== 'all') {
      if (game.timeClass !== filters.timeClass) continue;
    }

    results.push(game);
  }

  // Sort by date / endTime descending
  return results.sort((a, b) => (b.endTime || 0) - (a.endTime || 0));
}

/**
 * Computes deep dashboard analytics for a given player profile.
 */
export async function getProfileDashboardData(profileUsername) {
  if (!profileUsername) return null;
  const normUser = profileUsername.toLowerCase();
  const db = await getDb();

  const profile = await getProfile(normUser);
  if (!profile) return null;

  // Retrieve games to calculate opening win rates
  const games = await db.getAllFromIndex('games', 'by_profile', normUser);

  const openingStatsMap = new Map();
  let bulletCount = 0, blitzCount = 0, rapidCount = 0, dailyCount = 0;

  for (const g of games) {
    const op = g.openingName || 'Other';
    if (!openingStatsMap.has(op)) {
      openingStatsMap.set(op, {
        name: op,
        gamesCount: 0,
        wins: 0,
        draws: 0,
        losses: 0
      });
    }

    const opStat = openingStatsMap.get(op);
    opStat.gamesCount++;

    const isWhite = g.white.username.toLowerCase() === normUser;
    const won = (isWhite && g.boardResult === '1-0') || (!isWhite && g.boardResult === '0-1');
    const lost = (isWhite && g.boardResult === '0-1') || (!isWhite && g.boardResult === '1-0');
    const drawn = g.boardResult === '1/2-1/2';

    if (won) opStat.wins++;
    else if (lost) opStat.losses++;
    else if (drawn) opStat.draws++;

    if (g.timeClass === 'bullet') bulletCount++;
    else if (g.timeClass === 'blitz') blitzCount++;
    else if (g.timeClass === 'rapid') rapidCount++;
    else if (g.timeClass === 'daily') dailyCount++;
  }

  const openingsList = Array.from(openingStatsMap.values()).map(o => ({
    ...o,
    winRate: o.gamesCount > 0 ? Math.round((o.wins / o.gamesCount) * 100) : 0
  })).sort((a, b) => b.gamesCount - a.gamesCount);

  const bestOpenings = [...openingsList]
    .filter(o => o.gamesCount >= 3)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);

  const weakestOpenings = [...openingsList]
    .filter(o => o.gamesCount >= 3)
    .sort((a, b) => a.winRate - b.winRate)
    .slice(0, 5);

  return {
    profile,
    totalGames: games.length,
    openingsList: openingsList.slice(0, 10),
    bestOpenings,
    weakestOpenings,
    timeClassDistribution: {
      bullet: bulletCount,
      blitz: blitzCount,
      rapid: rapidCount,
      daily: dailyCount
    }
  };
}

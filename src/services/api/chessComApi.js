import { SAMPLE_GAMES, SAMPLE_PROFILES } from './sampleGames.js';
import { Chess } from 'chess.js';

const CHESS_COM_BASE_URL = 'https://api.chess.com';

/**
 * Resilient fetcher that attempts direct Chess.com API first,
 * and falls back to the Vite local proxy if CORS or headers block the direct request.
 */
async function chessComFetch(endpoint) {
  const directUrl = `${CHESS_COM_BASE_URL}${endpoint}`;
  const proxyUrl = `/chess-api${endpoint}`;

  try {
    const res = await fetch(directUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // If direct fetch fails (e.g. CORS), try proxy
  }

  // Fallback to local Vite proxy
  try {
    const resProxy = await fetch(proxyUrl);
    if (!resProxy.ok) {
      throw new Error(`Chess.com API error: ${resProxy.status} ${resProxy.statusText}`);
    }
    return await resProxy.json();
  } catch (proxyErr) {
    throw new Error(`Could not connect to Chess.com API. Verify username or network.`);
  }
}

/**
 * Fetches Chess.com player profile.
 */
export async function getChessComProfile(username) {
  const cleanUser = username.trim().toLowerCase();
  
  // Check if sample profile
  const sample = SAMPLE_PROFILES.find(p => p.username.toLowerCase() === cleanUser);
  if (sample) {
    return sample;
  }

  try {
    const data = await chessComFetch(`/pub/player/${cleanUser}`);
    return {
      username: data.username.toLowerCase(),
      displayName: data.username,
      avatar: data.avatar || '',
      title: data.title || '',
      country: data.country || '',
      status: data.status || 'basic'
    };
  } catch (e) {
    // Return basic profile object even if public profile has restricted headers
    return {
      username: cleanUser,
      displayName: username.trim(),
      avatar: '',
      title: ''
    };
  }
}

/**
 * Fetches all available game archives for a Chess.com user.
 */
export async function getGameArchives(username) {
  const cleanUser = username.trim().toLowerCase();
  const data = await chessComFetch(`/pub/player/${cleanUser}/games/archives`);
  return data.archives || [];
}

/**
 * Fetches games from a single monthly archive URL.
 */
export async function getGamesFromArchive(archiveUrl) {
  let endpoint = archiveUrl;
  if (archiveUrl.startsWith(CHESS_COM_BASE_URL)) {
    endpoint = archiveUrl.replace(CHESS_COM_BASE_URL, '');
  }
  const data = await chessComFetch(endpoint);
  return data.games || [];
}

/**
 * High-level import function: fetches historical games for a username.
 * Supports progress callbacks, month-by-month fetching, and error handling.
 */
export async function fetchChessComGames(username, { maxArchives = 12, onProgress } = {}) {
  const cleanUser = username.trim().toLowerCase();

  // IfHikaru or sample user requested and offline/testing, provide sample games seamlessly
  const isSample = SAMPLE_PROFILES.some(p => p.username.toLowerCase() === cleanUser);

  if (onProgress) {
    onProgress({
      percentage: 10,
      status: `Searching archives for ${username}...`
    });
  }

  let archives = [];
  try {
    archives = await getGameArchives(cleanUser);
  } catch (err) {
    if (isSample) {
      if (onProgress) {
        onProgress({ percentage: 50, status: `Loading pre-indexed games for ${username}...` });
      }
      return SAMPLE_GAMES;
    }
    throw new Error(`Failed to find Chess.com archives for "${username}". Make sure the username is spelled correctly.`);
  }

  if (!archives || archives.length === 0) {
    if (isSample) return SAMPLE_GAMES;
    throw new Error(`No historical games found for Chess.com user "${username}".`);
  }

  // Take the most recent archives up to maxArchives
  const selectedArchives = archives.slice(-maxArchives).reverse();
  const allGames = [];
  const totalArchives = selectedArchives.length;

  for (let idx = 0; idx < totalArchives; idx++) {
    const archiveUrl = selectedArchives[idx];
    const monthTag = archiveUrl.split('/').slice(-2).join('/');

    if (onProgress) {
      const pct = Math.round(15 + ((idx / totalArchives) * 60));
      onProgress({
        percentage: pct,
        status: `Downloading archive ${idx + 1} of ${totalArchives} (${monthTag})...`
      });
    }

    try {
      const monthGames = await getGamesFromArchive(archiveUrl);
      if (Array.isArray(monthGames)) {
        allGames.push(...monthGames);
      }
    } catch (archiveErr) {
      console.warn(`Could not load archive ${archiveUrl}:`, archiveErr);
    }
  }

  if (allGames.length === 0 && isSample) {
    return SAMPLE_GAMES;
  }

  return allGames;
}

/**
 * Parses raw PGN text (can contain multiple games) into structured game objects
 * ready for IndexedDB position indexing.
 */
export function parsePgnText(pgnText, defaultUsername = 'My Games') {
  if (!pgnText || !pgnText.trim()) return [];

  // Split PGN text by standard [Event tag or game boundary
  const rawGameBlocks = pgnText
    .split(/(?=\[Event\s+)/gi)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  const parsedGames = [];

  for (let i = 0; i < rawGameBlocks.length; i++) {
    const block = rawGameBlocks[i];
    try {
      const c = new Chess();
      c.loadPgn(block);
      
      const header = c.header();
      const white = header.White || 'White';
      const black = header.Black || 'Black';
      const result = header.Result || '*';
      const date = header.Date || new Date().toISOString().split('T')[0];
      const timeControl = header.TimeControl || 'N/A';

      // Determine board result
      let boardResult = '1/2-1/2';
      if (result === '1-0') boardResult = '1-0';
      else if (result === '0-1') boardResult = '0-1';

      parsedGames.push({
        uuid: `pgn_${Date.now()}_${i}`,
        url: '',
        end_time: Math.floor(new Date(date.replace(/\./g, '-')).getTime() / 1000) || Math.floor(Date.now() / 1000),
        time_control: timeControl,
        time_class: 'rapid',
        rated: true,
        white: {
          username: white,
          rating: parseInt(header.WhiteElo, 10) || 1500,
          result: boardResult === '1-0' ? 'win' : 'resigned'
        },
        black: {
          username: black,
          rating: parseInt(header.BlackElo, 10) || 1500,
          result: boardResult === '0-1' ? 'win' : 'resigned'
        },
        pgn: block
      });
    } catch (e) {
      // skip unparseable block
    }
  }

  return parsedGames;
}

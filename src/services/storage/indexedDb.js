import { openDB } from 'idb';

const DB_NAME = 'chessexp_db';
const DB_VERSION = 1;

let dbPromise = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Profiles store
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'username' });
        }

        // Games store
        if (!db.objectStoreNames.contains('games')) {
          const gamesStore = db.createObjectStore('games', { keyPath: 'id' });
          gamesStore.createIndex('by_profile', 'profileUsername', { unique: false });
          gamesStore.createIndex('by_profile_date', ['profileUsername', 'endTime'], { unique: false });
        }

        // Position statistics store (normalized FEN per profile)
        if (!db.objectStoreNames.contains('positions')) {
          const positionsStore = db.createObjectStore('positions', { keyPath: ['profileUsername', 'normFen'] });
          positionsStore.createIndex('by_profile', 'profileUsername', { unique: false });
        }

        // Exact move lines store
        if (!db.objectStoreNames.contains('lines')) {
          const linesStore = db.createObjectStore('lines', { keyPath: ['profileUsername', 'lineKey'] });
          linesStore.createIndex('by_profile', 'profileUsername', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}


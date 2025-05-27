import { Habit } from '../types';
// It's common to import sql.js and its wasm initializer separately
import initSqlJs from 'sql.js/dist/sql-wasm.js'; 
import { Database } from 'sql.js';

// URL for the WASM file, typically hosted alongside your app or on a CDN
const SQL_WASM_URL = 'https://esm.sh/sql.js@1.10.3/dist/sql-wasm.wasm';
const DB_LOCAL_STORAGE_KEY = 'atomicHabitsSQLiteDB';

let db: Database | null = null;
let SQL: any = null; // To store the initialized SQL library

const initializeDatabase = async (): Promise<void> => {
  if (db) return;

  try {
    if (!SQL) {
      SQL = await initSqlJs({ locateFile: () => SQL_WASM_URL });
    }
    
    const savedDbBinaryString = localStorage.getItem(DB_LOCAL_STORAGE_KEY);
    if (savedDbBinaryString) {
      const dbArray = new Uint8Array(JSON.parse(savedDbBinaryString));
      db = new SQL.Database(dbArray);
      console.log("Loaded database from localStorage.");
    } else {
      db = new SQL.Database();
      console.log("Created new in-memory database.");
    }

    await createTablesIfNeeded();
    if (!savedDbBinaryString) { // Save only if it was a new DB
        saveDatabase(); 
    }
  } catch (error) {
    console.error("Failed to initialize SQLite database:", error);
    db = null; 
    throw error; 
  }
};

const createTablesIfNeeded = async (): Promise<void> => {
    if (!db) throw new Error("Database not initialized for table creation.");
    // Create habits table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cue TEXT NOT NULL,
        intention TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        completions TEXT,
        stackWithHabitId TEXT,
        stackedWithHabitName TEXT,
        twoMinuteRule TEXT,
        identityGoal TEXT,
        temptationBundle TEXT,
        lastReviewDate TEXT,
        reviewNotes TEXT
      );
    `;
    db.run(createTableQuery);
    console.log("'habits' table checked/created.");
};

const saveDatabase = (): void => {
  if (db) {
    try {
      const binaryArray = db.export();
      localStorage.setItem(DB_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(binaryArray)));
      console.log("Database saved to localStorage.");
    } catch (error) {
      console.error("Failed to save database to localStorage:", error);
    }
  }
};

const getHabits = async (): Promise<Habit[]> => {
  if (!db) await initializeDatabase();
  if (!db) return []; 

  try {
    const stmt = db.prepare("SELECT * FROM habits ORDER BY createdAt DESC");
    const dbHabits: Habit[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      dbHabits.push({
        ...row,
        completions: row.completions ? JSON.parse(row.completions) : {},
      });
    }
    stmt.free();
    return dbHabits;
  } catch (error) {
    console.error("Error fetching habits from DB:", error);
    return [];
  }
};

const addHabit = async (habit: Habit): Promise<void> => {
  if (!db) await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  try {
    const stmt = db.prepare(`
      INSERT INTO habits (
        id, name, cue, intention, createdAt, completions, 
        stackWithHabitId, stackedWithHabitName, twoMinuteRule, 
        identityGoal, temptationBundle, lastReviewDate, reviewNotes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);
    stmt.run([
      habit.id,
      habit.name,
      habit.cue,
      habit.intention,
      habit.createdAt,
      JSON.stringify(habit.completions || {}),
      habit.stackWithHabitId || null,
      habit.stackedWithHabitName || null,
      habit.twoMinuteRule || null,
      habit.identityGoal || null,
      habit.temptationBundle || null,
      habit.lastReviewDate || null,
      habit.reviewNotes || null,
    ]);
    stmt.free();
    saveDatabase();
  } catch (error) {
    console.error("Error adding habit to DB:", error);
    throw error;
  }
};

const updateHabit = async (habit: Habit): Promise<void> => {
  if (!db) await initializeDatabase();
  if (!db) throw new Error("Database not initialized");
  
  try {
    const stmt = db.prepare(`
      UPDATE habits SET
        name = ?,
        cue = ?,
        intention = ?,
        createdAt = ?,
        completions = ?,
        stackWithHabitId = ?,
        stackedWithHabitName = ?,
        twoMinuteRule = ?,
        identityGoal = ?,
        temptationBundle = ?,
        lastReviewDate = ?,
        reviewNotes = ?
      WHERE id = ?;
    `);
    stmt.run([
      habit.name,
      habit.cue,
      habit.intention,
      habit.createdAt,
      JSON.stringify(habit.completions || {}),
      habit.stackWithHabitId || null,
      habit.stackedWithHabitName || null,
      habit.twoMinuteRule || null,
      habit.identityGoal || null,
      habit.temptationBundle || null,
      habit.lastReviewDate || null,
      habit.reviewNotes || null,
      habit.id,
    ]);
    stmt.free();
    saveDatabase();
  } catch (error) {
    console.error("Error updating habit in DB:", error);
    throw error;
  }
};


const deleteHabit = async (habitId: string): Promise<void> => {
  if (!db) await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  try {
    const stmt = db.prepare("DELETE FROM habits WHERE id = ?;");
    stmt.run([habitId]);
    stmt.free();
    saveDatabase();
  } catch (error) {
    console.error("Error deleting habit from DB:", error);
    throw error;
  }
};

const getDatabaseBinary = async (): Promise<Uint8Array | null> => {
  if (!db) await initializeDatabase();
  if (!db) {
    console.error("Database not initialized for export.");
    return null;
  }
  return db.export();
};

const replaceDatabaseWithBinary = async (binary: Uint8Array): Promise<void> => {
  if (!SQL) {
    SQL = await initSqlJs({ locateFile: () => SQL_WASM_URL });
  }
  try {
    if (db) {
      // db.close(); // Close existing DB if sql.js supports/requires it.
      // For sql.js, creating a new SQL.Database with the binary effectively replaces it.
    }
    db = new SQL.Database(binary);
    console.log("Database replaced with imported binary.");
    // It's crucial to ensure tables exist in the imported DB, or create them.
    await createTablesIfNeeded(); 
    saveDatabase(); // Persist the new DB state to localStorage
  } catch (error) {
    console.error("Error replacing database with binary:", error);
    // Attempt to re-initialize to a stable state if replacement fails.
    await initializeDatabase(); 
    throw error;
  }
};

export const sqliteService = {
  initializeDatabase,
  getHabits,
  addHabit,
  updateHabit,
  deleteHabit,
  getDatabaseBinary,
  replaceDatabaseWithBinary,
};
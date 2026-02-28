import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, "../../data");
const dbPath = join(dataDir, "app.db");

// Ensure data directory exists
mkdirSync(dataDir, { recursive: true });

let db;

export const initializeDatabase = () => {
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      activeSessionId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      filePath TEXT NOT NULL,
      encrypted BOOLEAN DEFAULT 0,
      uploadedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(uploadedBy) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS accessLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      action TEXT NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      contentId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(contentId) REFERENCES content(id)
    );
  `);

  // Migrations: add columns if missing (allowedUsers, expiry)
  const contentInfo = db.prepare("PRAGMA table_info(content)").all();
  const columns = contentInfo.map(c => c.name);
  if (!columns.includes("allowedUsers")) {
    db.exec("ALTER TABLE content ADD COLUMN allowedUsers TEXT DEFAULT '';");
  }
  if (!columns.includes("expiry")) {
    db.exec("ALTER TABLE content ADD COLUMN expiry DATETIME;");
  }

  console.log("SQLite database initialized");
  return db;
};

export const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
};

export default db;

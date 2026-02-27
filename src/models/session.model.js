import { getDB } from "../config/db.js";

export const createSession = (sessionData) => {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO sessions (userId, token, expiresAt) 
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(sessionData.userId, sessionData.token, sessionData.expiresAt);
  return { id: result.lastInsertRowid, ...sessionData };
};

export const findSessionByToken = (token) => {
  const db = getDB();
  const stmt = db.prepare("SELECT * FROM sessions WHERE token = ? AND expiresAt > CURRENT_TIMESTAMP");
  return stmt.get(token);
};

export const findSessionById = (id) => {
  const db = getDB();
  const stmt = db.prepare("SELECT * FROM sessions WHERE id = ?");
  return stmt.get(id);
};

export const deleteSession = (id) => {
  const db = getDB();
  const stmt = db.prepare("DELETE FROM sessions WHERE id = ?");
  stmt.run(id);
};

export default {
  createSession,
  findSessionByToken,
  findSessionById,
  deleteSession
};
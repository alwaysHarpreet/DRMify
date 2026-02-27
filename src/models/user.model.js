import { getDB } from "../config/db.js";

export const createUser = (userData) => {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO users (email, password, role) 
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(userData.email, userData.password, userData.role || "user");
  return { id: result.lastInsertRowid, ...userData };
};

export const findUserByEmail = (email) => {
  const db = getDB();
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return stmt.get(email);
};

export const findUserById = (id) => {
  const db = getDB();
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  return stmt.get(id);
};

export const updateUser = (id, userData) => {
  const db = getDB();
  const stmt = db.prepare(`
    UPDATE users 
    SET email = ?, password = ?, role = ?, activeSessionId = ?, updatedAt = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  stmt.run(userData.email, userData.password, userData.role, userData.activeSessionId, id);
  return findUserById(id);
};

export const deleteUser = (id) => {
  const db = getDB();
  const stmt = db.prepare("DELETE FROM users WHERE id = ?");
  stmt.run(id);
};

export default {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser
};

import { getDB } from "../config/db.js";

export const createAccessLog = (logData) => {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO accessLogs (userId, action, ipAddress, userAgent, contentId) 
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    logData.userId,
    logData.action,
    logData.ipAddress,
    logData.userAgent,
    logData.contentId
  );
  return { id: result.lastInsertRowid, ...logData };
};

export const findLogsByUserId = (userId) => {
  const db = getDB();
  const stmt = db.prepare("SELECT * FROM accessLogs WHERE userId = ? ORDER BY createdAt DESC");
  return stmt.all(userId);
};

export const findLogsByContentId = (contentId) => {
  const db = getDB();
  const stmt = db.prepare("SELECT * FROM accessLogs WHERE contentId = ? ORDER BY createdAt DESC");
  return stmt.all(contentId);
};

export const getAllAccessLogs = () => {
  const db = getDB();
  const stmt = db.prepare("SELECT * FROM accessLogs ORDER BY createdAt DESC LIMIT 100");
  return stmt.all();
};

export default {
  createAccessLog,
  findLogsByUserId,
  findLogsByContentId,
  getAllAccessLogs
};
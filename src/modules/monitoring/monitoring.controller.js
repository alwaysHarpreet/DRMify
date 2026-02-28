import { getDB } from "../../config/db.js";

export const getAccessLogs = (req, res, next) => {
  try {
    const db = getDB();
    const rows = db.prepare("SELECT * FROM accessLogs ORDER BY createdAt DESC LIMIT 200").all();
    res.json({ logs: rows });
  } catch (err) {
    next(err);
  }
};

export const getUsers = (req, res, next) => {
  try {
    const db = getDB();
    const rows = db.prepare("SELECT id, email, role, createdAt FROM users ORDER BY createdAt DESC").all();
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
};

export default { getAccessLogs, getUsers };

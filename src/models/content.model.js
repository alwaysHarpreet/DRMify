import { getDB } from "../config/db.js";

export const createContent = (contentData) => {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO content (title, filePath, encrypted, uploadedBy) 
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(
    contentData.title,
    contentData.filePath,
    contentData.encrypted || false,
    contentData.uploadedBy
  );
  return { id: result.lastInsertRowid, ...contentData };
};

export const findContentById = (id) => {
  const db = getDB();
  const stmt = db.prepare("SELECT * FROM content WHERE id = ?");
  return stmt.get(id);
};

export const findAllContent = () => {
  const db = getDB();
  const stmt = db.prepare("SELECT * FROM content ORDER BY createdAt DESC");
  return stmt.all();
};

export const updateContent = (id, contentData) => {
  const db = getDB();
  const stmt = db.prepare(`
    UPDATE content 
    SET title = ?, filePath = ?, encrypted = ?, updatedAt = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  stmt.run(contentData.title, contentData.filePath, contentData.encrypted, id);
  return findContentById(id);
};

export const deleteContent = (id) => {
  const db = getDB();
  const stmt = db.prepare("DELETE FROM content WHERE id = ?");
  stmt.run(id);
};

export default {
  createContent,
  findContentById,
  findAllContent,
  updateContent,
  deleteContent
};
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDB } from "../../config/db.js";
import { encryptBufferWithKey, buildStorageBuffer, deriveContentKey, parseStorageBuffer, decryptBufferWithKey } from "./encryption.service.js";
import { applyVisibleWatermark, applyInvisibleWatermark } from "./watermark.service.js";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageDir = path.join(__dirname, "..", "..", "storage");
if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

export const uploadContent = async ({ fileBuffer, filename, title, uploadedBy, userEmail }) => {
	const db = getDB();

	// Create content record (id)
	const stmt = db.prepare("INSERT INTO content (title, filePath, encrypted, uploadedBy) VALUES (?, ?, ?, ?)");
	const placeholderPath = "";
	const result = stmt.run(title, placeholderPath, 1, uploadedBy);
	const contentId = result.lastInsertRowid;

	// Apply watermark for PDFs
	let processedBuffer = fileBuffer;
	if (filename.endsWith(".pdf")) {
		processedBuffer = await applyVisibleWatermark(fileBuffer, `Downloaded by ${userEmail} - ID:${contentId}`);
	}

	// Encrypt with per-content key
	const key = deriveContentKey(contentId);
	const { ciphertext, iv, authTag } = encryptBufferWithKey(processedBuffer, key);
	const storageBuffer = buildStorageBuffer({ ciphertext, iv, authTag });

	const fileNameOnDisk = `${uuidv4()}-${filename}`;
	const filePath = path.join(storageDir, fileNameOnDisk);
	fs.writeFileSync(filePath, storageBuffer);

	// Update DB with real path
	const upd = db.prepare("UPDATE content SET filePath = ? WHERE id = ?");
	upd.run(filePath, contentId);

	return { id: contentId, filePath };
};

export const getContentRecord = (id) => {
	const db = getDB();
	const stmt = db.prepare("SELECT * FROM content WHERE id = ?");
	return stmt.get(id);
};

export const streamContentToResponse = async (contentId, res, user) => {
	const record = getContentRecord(contentId);
	if (!record) throw new Error("NotFound");

	const storageBuffer = fs.readFileSync(record.filePath);
	const { iv, authTag, ciphertext } = parseStorageBuffer(storageBuffer);
	const key = deriveContentKey(contentId);
	const plain = decryptBufferWithKey(ciphertext, key, iv, authTag);

	// For PDFs, apply invisible watermark per-user on-the-fly
	let outBuffer = plain;
	if (record.filePath.endsWith(".pdf")) {
		outBuffer = await applyInvisibleWatermark(plain, { userEmail: user.email, userId: user.id, title: record.title });
		res.setHeader("Content-Type", "application/pdf");
	} else {
		res.setHeader("Content-Type", "application/octet-stream");
	}

	res.setHeader("Content-Disposition", `inline; filename=content-${contentId}`);
	res.send(Buffer.from(outBuffer));
};

export default {
	uploadContent,
	getContentRecord,
	streamContentToResponse
};

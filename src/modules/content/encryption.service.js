import crypto from "crypto";
import { securityConfig } from "../../config/security.js";
import { getDB } from "../../config/db.js";

// Derive a per-content key using HMAC(masterKey, contentId)
export const deriveContentKey = (contentId) => {
  return crypto.createHmac("sha256", securityConfig.masterKey).update(String(contentId)).digest();
};

// Encrypt a Buffer and return iv, authTag and ciphertext
export const encryptBufferWithKey = (buffer, key) => {
  const iv = crypto.randomBytes(12); // 12 bytes recommended for GCM
  const cipher = crypto.createCipheriv(securityConfig.encryptionAlgorithm, key, iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { ciphertext, iv, authTag };
};

// Decrypt with provided key
export const decryptBufferWithKey = (ciphertext, key, iv, authTag) => {
  const decipher = crypto.createDecipheriv(securityConfig.encryptionAlgorithm, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};

// Helper: build storage blob format: iv(12) + authTag(16) + ciphertext
export const buildStorageBuffer = ({ ciphertext, iv, authTag }) => {
  return Buffer.concat([iv, authTag, ciphertext]);
};

export const parseStorageBuffer = (buffer) => {
  const iv = buffer.slice(0, 12);
  const authTag = buffer.slice(12, 28);
  const ciphertext = buffer.slice(28);
  return { iv, authTag, ciphertext };
};

// Convenience: derive key and encrypt
export const encryptBufferForContent = (buffer, contentId) => {
  const key = deriveContentKey(contentId);
  return encryptBufferWithKey(buffer, key);
};

export default {
  deriveContentKey,
  encryptBufferWithKey,
  decryptBufferWithKey,
  buildStorageBuffer,
  parseStorageBuffer,
  encryptBufferForContent
};
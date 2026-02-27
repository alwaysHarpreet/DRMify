import crypto from "crypto";
import { securityConfig } from "../../config/security.js";

export const encryptBuffer = (buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    securityConfig.encryptionAlgorithm,
    Buffer.from(securityConfig.encryptionKey, "hex"),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return { encrypted, iv, authTag };
};

export const decryptBuffer = (encrypted, iv, authTag) => {
  const decipher = crypto.createDecipheriv(
    securityConfig.encryptionAlgorithm,
    Buffer.from(securityConfig.encryptionKey, "hex"),
    iv
  );

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
};
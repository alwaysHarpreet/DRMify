import { createAccessLog } from "../models/accessLog.model.js";

export const logAccess = (userId, action, ip, userAgent, contentId = null) => {
  try {
    createAccessLog({
      userId,
      action,
      ipAddress: ip,
      userAgent: userAgent || "unknown",
      contentId
    });
  } catch (err) {
    console.error("Failed to log access:", err);
  }
};

export const logAction = (message, level = "info") => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
};

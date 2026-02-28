import { createAccessLog } from "../models/accessLog.model.js";
import { analyzeUserActivity } from "../modules/monitoring/riskEngine.service.js";

export const logAccess = (userId, action, ip, userAgent, contentId = null) => {
  try {
    createAccessLog({
      userId,
      action,
      ipAddress: ip,
      userAgent: userAgent || "unknown",
      contentId
    });

    // Run lightweight risk analysis asynchronously
    if (userId) {
      try {
        const result = analyzeUserActivity(userId);
        if (result.flagged) {
          console.warn(`User ${userId} flagged: ${result.reason}`);
        }
      } catch (err) {
        console.error("Risk engine error:", err);
      }
    }
  } catch (err) {
    console.error("Failed to log access:", err);
  }
};

export const logAction = (message, level = "info") => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
};

import { getDB } from "../../config/db.js";
import { revokeUserSessions } from "../auth/session.service.js";

// Simple rule-based risk engine for demo/hackathon
// - If same user has accesses from >3 distinct IPs within last 1 hour, flag and revoke

export const analyzeUserActivity = (userId) => {
  const db = getDB();
  const rows = db.prepare(
    `SELECT ipAddress, COUNT(DISTINCT ipAddress) as ips, COUNT(*) as hits
     FROM accessLogs
     WHERE userId = ? AND createdAt > datetime('now', '-1 hour')
     GROUP BY ipAddress`
  ).all(userId);

  const distinctIps = rows.length;
  if (distinctIps >= 3) {
    // revoke sessions and return true
    revokeUserSessions(userId).catch(err => console.error("risk revoke error", err));
    return { flagged: true, reason: `multiple IPs in last hour: ${distinctIps}` };
  }

  return { flagged: false };
};

export default { analyzeUserActivity };

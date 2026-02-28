import { getRedis } from "../../config/redis.js";
import * as SessionModel from "../../models/session.model.js";
import * as UserModel from "../../models/user.model.js";
import { getDB } from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const SESSION_TTL = 14400; // 4 hours in seconds

/**
 * Create a new session
 * - Stored in SQLite for persistence
 * - Cached in Redis with TTL for fast access
 */
export const createSession = async (userId, fingerprint, ip) => {
  const sessionToken = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_TTL * 1000).toISOString();

  // Store in SQLite (persistent)
  const session = SessionModel.createSession({
    userId,
    token: sessionToken,
    expiresAt
  });

  // Cache in Redis with TTL
  const redis = getRedis();
  if (redis) {
    try {
      await redis.setex(
        `session:${sessionToken}`,
        SESSION_TTL,
        JSON.stringify({
          id: session.id,
          userId,
          fingerprint,
          ip,
          createdAt: new Date().toISOString()
        })
      );
    } catch (err) {
      console.error("Redis cache failed:", err);
      // Continue - SQLite is authoritative
    }
  }

  return session;
};

/**
 * Verify session validity
 * - Check Redis first (fast)
 * - Fallback to SQLite if not in cache
 */
export const verifySession = async (token, fingerprint) => {
  const redis = getRedis();
  let sessionData = null;

  // Try Redis first
  if (redis) {
    try {
      const cached = await redis.get(`session:${token}`);
      if (cached) {
        sessionData = JSON.parse(cached);
      }
    } catch (err) {
      console.error("Redis read failed:", err);
    }
  }

  // Fallback to SQLite
  if (!sessionData) {
    const session = SessionModel.findSessionByToken(token);
    if (!session) {
      throw new Error("Session not found");
    }
    sessionData = session;
  }

  // Verify fingerprint binding (device security)
  if (sessionData.fingerprint && sessionData.fingerprint !== fingerprint) {
    throw new Error("Fingerprint mismatch - session tampered");
  }

  return sessionData;
};

/**
 * Revoke all sessions for a user (enforce single active session)
 */
export const revokeUserSessions = async (userId) => {
  // Find all user sessions in SQLite
  const db = getDB();
  const stmt = db.prepare("SELECT id, token FROM sessions WHERE userId = ?");
  const userSessions = stmt.all(userId);

  // Delete from both Redis and SQLite
  const redis = getRedis();
  userSessions.forEach(session => {
    // Delete from SQLite
    SessionModel.deleteSession(session.id);

    // Delete from Redis cache
    if (redis) {
      try {
        redis.del(`session:${session.token}`).catch(err => {
          console.error("Failed to delete Redis session:", err);
        });
      } catch (err) {
        console.error("Redis delete failed:", err);
      }
    }
  });
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (token) => {
  const session = SessionModel.findSessionByToken(token);
  if (!session) {
    throw new Error("Session not found");
  }

  SessionModel.deleteSession(session.id);

  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`session:${token}`);
    } catch (err) {
      console.error("Redis delete failed:", err);
    }
  }
};

/**
 * Check if user has any active sessions
 */
export const hasActiveSession = (userId) => {
  const db = getDB();
  const stmt = db.prepare(
    "SELECT COUNT(*) as count FROM sessions WHERE userId = ? AND expiresAt > CURRENT_TIMESTAMP"
  );
  const result = stmt.get(userId);
  return result.count > 0;
};

/**
 * Validate session token (returns session data if valid)
 */
export const validateSession = async (token, fingerprint) => {
  return await verifySession(token, fingerprint);
};
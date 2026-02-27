import { v4 as uuidv4 } from "uuid";
import Session from "../../models/session.model.js";
import User from "../../models/user.model.js";
import { getRedis } from "../../config/redis.js";

export const createSession = async (userId, fingerprint, ip) => {
  const redis = getRedis();

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Invalidate previous session
  const user = await User.findById(userId);
  if (user.activeSessionId) {
    await redis.del(`session:${userId}`);
    await Session.updateOne(
      { sessionId: user.activeSessionId },
      { isActive: false }
    );
  }

  await Session.create({
    userId,
    sessionId,
    fingerprint,
    ip,
    expiresAt
  });

  await redis.set(`session:${userId}`, sessionId, "EX", 900);

  user.activeSessionId = sessionId;
  await user.save();

  return sessionId;
};

export const validateSession = async (userId, sessionId) => {
  const redis = getRedis();
  const stored = await redis.get(`session:${userId}`);
  return stored === sessionId;
};

export const revokeSession = async (userId) => {
  const redis = getRedis();
  await redis.del(`session:${userId}`);
};
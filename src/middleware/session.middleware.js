import { validateSession } from "../modules/auth/session.service.js";

export default async (req, res, next) => {
  const { userId, sessionId } = req.user;

  const valid = await validateSession(userId, sessionId);

  if (!valid) {
    return res.status(403).json({ message: "Session invalidated" });
  }

  next();
};
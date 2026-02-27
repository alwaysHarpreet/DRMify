import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import User from "../../models/user.model.js";
import Session from "../../models/session.model.js";
import { securityConfig } from "../../config/security.js";

export const loginUser = async (email, password, fingerprint, ip) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  // Invalidate previous session
  if (user.activeSessionId) {
    await Session.updateOne(
      { sessionId: user.activeSessionId },
      { isActive: false }
    );
  }

  const sessionId = uuidv4();

  await Session.create({
    userId: user._id,
    sessionId,
    fingerprint,
    ipAddress: ip,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  });

  user.activeSessionId = sessionId;
  await user.save();

  const token = jwt.sign(
    { userId: user._id, sessionId },
    securityConfig.jwtSecret,
    { expiresIn: securityConfig.jwtExpiry }
  );

  return token;
};
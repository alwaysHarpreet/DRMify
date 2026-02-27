import bcrypt from "bcrypt";
import * as UserModel from "../../models/user.model.js";
import { generateToken } from "../../utils/token.util.js";
import { createSession, revokeUserSessions } from "./session.service.js";
import { logAction } from "../../utils/logger.js";

export const registerUser = async (email, password) => {
  // Validate email
  if (!email || !email.includes("@")) {
    throw new Error("Invalid email format");
  }

  // Check if user already exists
  const existing = UserModel.findUserByEmail(email);
  if (existing) {
    throw new Error("User already exists");
  }

  // Hash password with bcrypt (12 rounds)
  const hashed = await bcrypt.hash(password, 12);

  // Create user
  const user = UserModel.createUser({
    email,
    password: hashed,
    role: "user"
  });

  logAction(`User registered: ${email}`, "info");
  return user;
};

export const loginUser = async (email, password, fingerprint, ip) => {
  // Find user
  const user = UserModel.findUserByEmail(email);
  if (!user) {
    logAction(`Failed login attempt for non-existent user: ${email}`, "warn");
    throw new Error("Invalid credentials");
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    logAction(`Failed login attempt for user: ${email}`, "warn");
    throw new Error("Invalid credentials");
  }

  // Revoke existing sessions (enforce single active session)
  await revokeUserSessions(user.id);

  // Create new session
  const session = await createSession(user.id, fingerprint, ip);

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    sessionId: session.id,
    fingerprint
  });

  logAction(`User logged in: ${email} (Session: ${session.id})`, "info");
  return { token, user: { id: user.id, email: user.email, role: user.role } };
};

export const logoutUser = async (userId) => {
  await revokeUserSessions(userId);
  logAction(`User logged out: ${userId}`, "info");
};

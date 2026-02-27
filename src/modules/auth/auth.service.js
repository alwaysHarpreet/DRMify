import bcrypt from "bcrypt";
import User from "../../models/user.model.js";
import { generateToken } from "../../utils/token.util.js";
import { createSession } from "./session.service.js";

export const registerUser = async (email, password) => {
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ email, password: hashed });
  return user;
};

export const loginUser = async (email, password, fingerprint, ip) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const sessionId = await createSession(user._id, fingerprint, ip);

  const token = generateToken({
    userId: user._id,
    sessionId
  });

  return token;
};
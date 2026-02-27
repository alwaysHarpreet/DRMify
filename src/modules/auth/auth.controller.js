import { registerUser, loginUser, logoutUser } from "./auth.service.js";
import { generateFingerprint } from "../../utils/fingerprint.js";
import { logAccess } from "../../utils/logger.js";

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const user = await registerUser(email, password);

    logAccess(user.id, "REGISTER", req.ip, req.headers["user-agent"]);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const fingerprint = generateFingerprint(req);
    const result = await loginUser(email, password, fingerprint, req.ip);

    logAccess(result.user.id, "LOGIN", req.ip, req.headers["user-agent"]);

    res.json({
      message: "Login successful",
      token: result.token,
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await logoutUser(userId);
    logAccess(userId, "LOGOUT", req.ip, req.headers["user-agent"]);

    res.json({ message: "Logout successful" });
  } catch (err) {
    next(err);
  }
};

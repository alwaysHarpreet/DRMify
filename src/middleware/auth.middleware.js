import { verifyToken } from "../utils/token.util.js";
import { validateSession } from "../modules/auth/session.service.js";

export default async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];
    const decoded = verifyToken(token);

    // Validate session binding and fingerprint
    const fingerprint = req.headers["x-device-fingerprint"] || (req.headers["user-agent"] + req.ip);
    await validateSession(decoded.sessionId, fingerprint);

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token or session" });
  }
};
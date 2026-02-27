import crypto from "crypto";

export const generateFingerprint = (req) => {
  const raw = req.headers["user-agent"] + req.ip;
  return crypto.createHash("sha256").update(raw).digest("hex");
};
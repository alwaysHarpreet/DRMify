import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sessionId: { type: String, unique: true },
  fingerprint: String,
  ipAddress: String,
  isActive: { type: Boolean, default: true },
  expiresAt: Date
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);
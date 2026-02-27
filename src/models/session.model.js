import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sessionId: { type: String, unique: true },
  fingerprint: String,
  ip: String,
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);
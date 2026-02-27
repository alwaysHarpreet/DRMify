import mongoose from "mongoose";

const accessLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  contentId: mongoose.Schema.Types.ObjectId,
  ip: String,
  fingerprint: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("AccessLog", accessLogSchema);
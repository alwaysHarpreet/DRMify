import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  title: String,
  filePath: String,
  iv: String,
  authTag: String,
  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  expiryTime: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Content", contentSchema);
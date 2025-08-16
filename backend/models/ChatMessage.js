import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  fileId: { type: String, required: true, index: true },
  uid: { type: String, required: true, index: true },

  sender: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);

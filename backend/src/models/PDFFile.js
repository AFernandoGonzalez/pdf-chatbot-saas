import mongoose from "mongoose";

const pdfFileSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true },
  uid: { type: String, required: true, index: true },
  fileName: { type: String, default: "" },
  originalName: { type: String, default: "" },
  fileUrl: { type: String, default: "" },
  status: { type: String, enum: ["processing", "ready", "failed"], default: "processing" },
  summary: { type: String, default: "" },
  questions: { type: [String], default: [] },
  docType: { type: String, default: "" },
  totalPages: { type: Number, default: 0 },
  storageSizeMB: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.PDFFile || mongoose.model("PDFFile", pdfFileSchema);

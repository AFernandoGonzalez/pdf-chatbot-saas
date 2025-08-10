// models/PDFFile.js
import mongoose from 'mongoose';

const pdfFileSchema = new mongoose.Schema({
  fileId: String,                     // unique ID used in Pinecone
  fileName: String,                  // full name: 1754353318733-jdsports_store_return_label.pdf
  originalName: String,              // original uploaded filename
  fileUrl: String,                   // public R2 URL
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  userId: String,                    // if using auth
  // ✅ New fields for summary and questions
  summary: {
    type: String,
    default: '',
  },
  questions: {
    type: [String],
    default: [],
  },
});

export default mongoose.models.PDFFile || mongoose.model('PDFFile', pdfFileSchema);

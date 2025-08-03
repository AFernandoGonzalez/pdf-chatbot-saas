import pdfParse from 'pdf-parse';
import chunkText from '../utils/chunkText.js';
import { saveToPinecone } from '../services/pineconeService.js';
import { uploadFileToR2 } from '../services/r2Service.js';

const parsePDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};

export const handleUpload = async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const fileName = `${Date.now()}-${originalName}`;
    const fileId = `${Date.now()}`;
    console.log("Received file:", {
      fileBuffer,
      originalName,
      mimeType,
      fileName,
      fileId,
    });

    // ✅ Step 1: Upload PDF to R2
    const r2Url = await uploadFileToR2(fileBuffer, fileName, mimeType);
    console.log("File uploaded to R2:", r2Url);

    // ✅ Step 2: Parse the PDF text
    const text = await parsePDF(fileBuffer);
    // console.log("Parsed text from PDF:", text.slice(0, 100)); // Log first 100 chars for debugging

    // ✅ Step 3: Chunk the text
    const chunks = chunkText(text);
    console.log("Number of chunks created:", chunks.length);

    // ✅ Step 4: Send plain text chunks to Pinecone
    await saveToPinecone(fileId, chunks); // ONLY chunks (no embeddings)

    // res.json({ fileId, r2Url });
    res.json({
      fileId,
      fileUrl: r2Url, // ← renamed here
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

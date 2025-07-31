import pdfParse from 'pdf-parse';
import chunkText from '../utils/chunkText.js';
import { embedChunks } from '../services/openaiService.js';
import { saveToPinecone } from '../services/pineconeService.js';

const parsePDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};

export const handleUpload = async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const text = await parsePDF(fileBuffer); // ✅ This now works

    const chunks = chunkText(text);
    const embeddings = await embedChunks(chunks);

    const fileId = `${Date.now()}`;
    await saveToPinecone(fileId, embeddings, chunks);

    res.json({ fileId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

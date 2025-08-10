import express from 'express';
import File from '../models/PDFFile.js'; // import the PDFFile model

const router = express.Router();

// GET /api/files → Get all uploaded files
router.get('/', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 }); // latest first
    res.json(files);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// GET /api/files/:fileId → Get specific file by fileId
router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findOne({ fileId });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (err) {
    console.error('Error fetching file:', err);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

export default router;

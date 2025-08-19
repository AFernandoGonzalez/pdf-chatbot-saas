import File from '../models/PDFFile.js';

export const getAllFiles = async (req, res) => {
  const uid = req.user.uid;

  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const files = await File.find({ uid }).sort({ uploadedAt: -1 });
    res.json(files);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

export const getFileById = async (req, res) => {
  const uid = req.user.uid;

  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { fileId } = req.params;
    const file = await File.findOne({ fileId, uid });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (err) {
    console.error('Error fetching file:', err);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
};


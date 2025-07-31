import { getRelevantChunks } from '../services/pineconeService.js';
import { askOpenAI } from '../services/openaiService.js';

export const handleChat = async (req, res) => {
  const { fileId, question } = req.body;

  try {
    const relevantChunks = await getRelevantChunks(fileId, question);
    const response = await askOpenAI(question, relevantChunks);

    res.json({ answer: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat failed' });
  }
};

import { getRelevantChunks } from '../services/pineconeService.js';
import { askOpenAI } from '../services/openaiService.js';

export const handleChat = async (req, res) => {
  const { fileId, question } = req.body;

  console.log('Chat request:', { fileId, question });
  

  try {
    const relevantChunks = await getRelevantChunks(fileId, question);
    
    console.log('Relevant chunks:', relevantChunks);

    if (!relevantChunks.length) {
      return res.status(404).json({ error: 'No relevant chunks found.' });
    }

    const context = relevantChunks
      .map((match) => match.metadata?.text || '')
      .filter(Boolean);

    const answer = await askOpenAI(question, context);

    res.json({ answer });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat failed' });
  }
};

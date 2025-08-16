import { getRelevantChunks } from '../services/pineconeService.js';
import { askOpenAIStream } from '../services/openaiService.js';
import PDFFile from '../models/PDFFile.js';
import ChatMessage from '../models/ChatMessage.js';
import { askOpenAI } from '../services/openaiService.js';

export const handleChat = async (req, res) => {
  const { fileId, question } = req.body;
  const userId = req.body.userId;


  try {
    const relevantChunks = await getRelevantChunks(fileId, question);

    if (!relevantChunks.length) {
      return res.status(404).json({ error: 'No relevant chunks found.' });
    }

    const context = relevantChunks.map(m => m.metadata?.text || '').filter(Boolean);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    let fullAnswer = '';
    const stream = await askOpenAIStream(question, context);

    for await (const part of stream) {
      const content = part.choices?.[0]?.delta?.content || '';
      res.write(content);
      fullAnswer += content;
    }


    await ChatMessage.create([
      { fileId, userId, sender: 'user', text: question },
      { fileId, userId, sender: 'bot', text: fullAnswer }
    ]);


    res.end();
  } catch (err) {
    console.error('Chat failed:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Chat failed' });
    }
  }
};


export const handleFileSummaryAndQuestions = async (req, res) => {
  const { fileId } = req.params;

  try {
    const existing = await PDFFile.findOne({ fileId });
    if (!existing) {
      return res.status(404).json({ error: "File not found" });
    }

    if (existing.summary && existing.questions?.length > 0) {
      return res.json({
        summary: existing.summary,
        questions: existing.questions,
        docType: existing.docType || "Unknown",
      });
    }

    const relevantChunks = await getRelevantChunks(fileId, 'Summarize the content and identify the document type.');
    const context = relevantChunks.map(c => c.metadata?.text || '').filter(Boolean);

    if (context.length === 0) {
      return res.status(202).json({ status: 'processing' });
    }

    const summary = await askOpenAI('summary', context);

    const rawQuestions = await askOpenAI('questions', context);
    const questions = rawQuestions
      .split('\n')
      .map(q => q.replace(/^\d+\.?\s*/, '').trim())
      .map(q => q.replace(/^["“”](.*)["“”]$/, '$1'))
      .filter(Boolean)
      .slice(0, 3);

    const docType = await askOpenAI('docType', context);

    const updated = await PDFFile.findOneAndUpdate(
      { fileId },
      { summary, questions, docType, status: "ready" },
      { new: true }
    );

    if (!updated) {
      console.error("No existing document found for fileId:", fileId);
      return res.status(404).json({ error: "File not found for updating summary" });
    }

    res.json({ summary, questions, docType });
  } catch (err) {
    console.error('❌ Error generating document info:', err);
    res.status(500).json({ error: 'Failed to generate document info' });
  }
};

export const getChatMessages = async (req, res) => {
  const { fileId } = req.params;

  try {
    const messages = await ChatMessage.find({ fileId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
};
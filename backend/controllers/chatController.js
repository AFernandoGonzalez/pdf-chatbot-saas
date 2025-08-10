import { getRelevantChunks } from '../services/pineconeService.js';
import { askOpenAIStream } from '../services/openaiService.js';
import PDFFile from '../models/PDFFile.js'; // ✅ <-- THIS LINE
import { askOpenAI } from '../services/openaiService.js';

export const handleChat = async (req, res) => {
  const { fileId, question } = req.body;

  try {
    const relevantChunks = await getRelevantChunks(fileId, question);

    if (!relevantChunks.length) {
      return res.status(404).json({ error: 'No relevant chunks found.' });
    }

    const context = relevantChunks.map((m) => m.metadata?.text || '').filter(Boolean);

    // OpenAI streaming response (ReadableStream)
    const stream = await askOpenAIStream(question, context);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value));
    }
    res.end();
  } catch (err) {
    console.error('Chat failed:', err);
    res.status(500).json({ error: 'Chat failed' });
  }
};

export const handleFileSummaryAndQuestions = async (req, res) => {
  const { fileId } = req.params;

  try {
    const existing = await PDFFile.findOne({ fileId });

    if (existing?.summary && existing?.questions?.length > 0 && existing?.docType) {
      return res.json({
        summary: existing.summary,
        questions: existing.questions,
        docType: existing.docType,
      });
    }

    const relevantChunks = await getRelevantChunks(fileId, 'Summarize the content and identify the document type.');
    const context = relevantChunks.map(c => c.metadata?.text || '').filter(Boolean);

    const summary = await askOpenAI('summary', context);

    const rawQuestions = await askOpenAI('questions', context);
    // const questions = rawQuestions
    //   .split('\n')
    //   .map(q => q.replace(/^\d+\.\s*/, '').trim())
    //   .filter(Boolean)
    //   .slice(0, 3);
    const questions = rawQuestions
      .split('\n')
      .map(q => q.replace(/^\d+\.?\s*/, '').trim())
      .map(q => q.replace(/^["“”](.*)["“”]$/, '$1')) // Remove surrounding quotes or smart quotes
      .filter(Boolean)
      .slice(0, 3);


    const docType = await askOpenAI('docType', context);

    await PDFFile.findOneAndUpdate(
      { fileId },
      { summary, questions, docType },
      { upsert: true }
    );

    res.json({ summary, questions, docType });
  } catch (err) {
    console.error('❌ Error generating document info:', err);
    res.status(500).json({ error: 'Failed to generate document info' });
  }
};


// export const handleFileSummaryAndQuestions = async (req, res) => {
//   const { fileId } = req.params;

//   try {
//     const existing = await PDFFile.findOne({ fileId });

//     if (existing?.summary && existing?.questions?.length > 0) {
//       console.log('✅ Returning cached summary/questions');
//       return res.json({
//         summary: existing.summary,
//         questions: existing.questions,
//       });
//     }

//     const relevantChunks = await getRelevantChunks(fileId, 'Summarize the content of this document.');

//     const context = relevantChunks
//       .map(chunk => chunk.metadata?.text || '')
//       .filter(Boolean);

//     const summary = await askOpenAI('Summarize this document in 2–3 sentences.', context);

//     const questionsRaw = await askOpenAI('Based on this document, generate 3 helpful questions someone might ask.', context);

//     const suggestedQuestions = questionsRaw
//       .split('\n')
//       .map((q) => q.replace(/^\d+\.\s*/, '').trim())
//       .filter(Boolean)
//       .slice(0, 3);

//     await PDFFile.findOneAndUpdate(
//       { fileId },
//       {
//         summary,
//         questions: suggestedQuestions,
//       }
//     );

//     res.json({ summary, questions: suggestedQuestions });
//   } catch (err) {
//     console.error('❌ Summary/Question generation error:', err);
//     res.status(500).json({ error: 'Failed to generate summary or questions' });
//   }
// };

// import { getRelevantChunks } from '../services/pineconeService.js';
// import { askOpenAI } from '../services/openaiService.js';

// export const handleChat = async (req, res) => {
//   const { fileId, question } = req.body;

//   console.log('Chat request:', { fileId, question });


//   try {
//     const relevantChunks = await getRelevantChunks(fileId, question);

//     console.log('Relevant chunks:', relevantChunks);

//     if (!relevantChunks.length) {
//       return res.status(404).json({ error: 'No relevant chunks found.' });
//     }

//     const context = relevantChunks
//       .map((match) => match.metadata?.text || '')
//       .filter(Boolean);

//     const answer = await askOpenAI(question, context);

//     res.json({ answer });
//   } catch (err) {
//     console.error('Chat error:', err);
//     res.status(500).json({ error: 'Chat failed' });
//   }
// };

// export const handleSummary = async (req, res) => {
//   const { fileId } = req.params; // get fileId from URL params

//   try {
//     // Fetch relevant chunks for the entire document or summary prompt
//     const relevantChunks = await getRelevantChunks(fileId, "Please provide a summary of the document.");

//     if (!relevantChunks.length) {
//       return res.status(404).json({ error: 'No relevant chunks found for summary.' });
//     }

//     // Extract text from metadata of chunks
//     const context = relevantChunks
//       .map(chunk => chunk.metadata?.text || '')
//       .filter(Boolean);

//     // Call OpenAI to generate summary based on the context
//     const summary = await askOpenAI("Provide a concise summary based on the following context:", context);

//     res.json({ summary });
//   } catch (err) {
//     console.error('Summary error:', err);
//     res.status(500).json({ error: 'Failed to generate summary' });
//   }
// };

// export const handleFileSummaryAndQuestions = async (req, res) => {
//   const { fileId } = req.params;

//   try {
//     const existing = await PDFFile.findOne({ fileId });

//     if (existing?.summary && existing?.questions?.length > 0) {
//       console.log('✅ Returning cached summary/questions');
//       return res.json({
//         summary: existing.summary,
//         questions: existing.questions,
//       });
//     }

//     // fallback if no cache exists (shouldn't happen if saveToPinecone did its job)
//     const relevantChunks = await getRelevantChunks(fileId, 'Summarize the content of this document.');

//     // const context = relevantChunks.map((c) => c.metadata?.text).join('\n\n');
//     const context = relevantChunks
//       .map(chunk => chunk.metadata?.text || '')
//       .filter(Boolean);

//     const summary = await askOpenAI('Summarize this document in 2–3 sentences.', context);
//     const questionsRaw = await askOpenAI('Based on this document, generate 3 helpful questions someone might ask.', context);

//     const suggestedQuestions = questionsRaw
//       .split('\n')
//       .map((q) => q.replace(/^\d+\.\s*/, '').trim())
//       .filter(Boolean)
//       .slice(0, 3);

//     await PDFFile.findOneAndUpdate(
//       { fileId },
//       {
//         summary,
//         questions: suggestedQuestions,
//       }
//     );

//     res.json({ summary, questions: suggestedQuestions });
//   } catch (err) {
//     console.error('❌ Summary/Question generation error:', err);
//     res.status(500).json({ error: 'Failed to generate summary or questions' });
//   }
// };

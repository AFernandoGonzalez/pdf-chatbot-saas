import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  if (Array.isArray(response.data)) return response.data[0].embedding;
  return response.data.embedding;
}

export async function askOpenAI(mode, contextChunks) {
  const context = contextChunks.join('\n\n');

  console.log('Asking OpenAI with context:', context.length > 100 ? context.slice(0, 100) + '...' : context);
  

  let questionPrompt = '';

  switch (mode) {
    case 'summary':
      questionPrompt = `
You are an AI assistant that analyzes a document and creates a short, friendly, confident overview for the user.

Your output should follow this structure:
1. Start with a casual greeting ("Hey there!", "Hi friend!", "Good morning!").
2. One sentence confidently stating the document type and purpose.
3. 3 simple bullet points highlighting key info.
4. End with a friendly closing sentence inviting further questions. ex. "What do you want to explore?" or "I’ve gone through the full 1 page. Ready to help!" or "All clear and ready to sort that return?"  

Do NOT include any questions in this summary.

Avoid long paragraphs or hedging language like "appears to be."

Document content:
${context}
      `.trim();
      break;

    case 'questions':
      questionPrompt = 'Based on this document, generate exactly 3 simple, relevant questions someone might ask about it.';
      break;

    case 'docType':
      questionPrompt = `Determine the primary type of document based on the content provided.
Examples: Resume, Invoice, Delivery Slip, Homework Assignment, Essay, Report, Legal Contract, Letter, Receipt, Academic Paper, Meeting Notes, or Other.
Respond with only the single most likely document type, no extra text or punctuation.
If unsure, respond with "Unknown".`;
      break;

    default:
      questionPrompt = mode;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant. Use the following context from a PDF document to answer the user’s question. If no answer is found in the context, say so politely.',
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${questionPrompt}`,
      },
    ],
  });

  return response.choices[0].message.content.trim();
}

export async function askOpenAIStream(question, contextChunks) {
  const context = contextChunks.join('\n\n');

  console.log('Asking OpenAI with context:', context);
  
  return await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant. Use the following context from a PDF document to answer the user’s question. If no answer is found in the context, say so politely.',
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
    stream: true,
  });
}

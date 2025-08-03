import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getEmbedding(text) {
  // text can be string or array of strings; here assuming string
  const response = await openai.embeddings.create({
    input: text,
    model: 'text-embedding-3-small', // matches your Pinecone index dimension 512
  });
  // response.data can be an array, so handle array or single string
  if (Array.isArray(response.data)) {
    return response.data[0].embedding;
  }
  return response.data.embedding;
}

export async function askOpenAI(question, contextChunks) {
  const context = contextChunks.map(chunk => chunk.metadata?.text || '').join('\n\n');

  console.log('Context sent to OpenAI:', context);

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant. Use the following context extracted from a PDF document to answer the user's question. 
                  If the context does not contain the answer, say so politely. 
                  Provide a concise, informative answer based only on the context.`,
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  return res.choices[0].message.content;
}

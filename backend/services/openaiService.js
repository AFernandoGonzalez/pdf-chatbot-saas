import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function embedChunks(chunks) {
  const embeddings = [];

  for (const chunk of chunks) {
    const res = await openai.embeddings.create({
      input: chunk,
      model: 'text-embedding-3-small',
    });
    embeddings.push(res.data[0].embedding);
  }

  return embeddings;
}

export async function askOpenAI(question, contextChunks) {
  const context = contextChunks.join('\n\n');

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant for answering questions about a PDF document.',
      },
      {
        role: 'user',
        content: `Context: ${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  return res.choices[0].message.content;
}

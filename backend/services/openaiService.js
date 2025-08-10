// import { openai } from '@ai-sdk/openai';
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

// Non-streaming chat completion (for summary, questions)
// export async function askOpenAI(question, contextChunks) {
//   const context = contextChunks.join('\n\n');

//   const response = await openai.chat.completions.create({
//     model: 'gpt-4',
//     messages: [
//       {
//         role: 'system',
//         content:
//           'You are a helpful assistant. Use the following context from a PDF document to answer the user’s question. If no answer is found in the context, say so politely.',
//       },
//       {
//         role: 'user',
//         content: `Context:\n${context}\n\nQuestion: ${question}`,
//       },
//     ],
//   });

//   return response.choices[0].message.content;
// }
// export async function askOpenAI(mode, contextChunks) {
//   const context = contextChunks.join('\n\n');
  
//   let questionPrompt = '';

//   switch (mode) {
//     case 'summary':
//       questionPrompt = 'Summarize this document in 2–3 sentences.';
//       break;
//     case 'questions':
//       questionPrompt = 'Based on this document, generate 3 helpful questions someone might ask.';
//       break;
//     case 'docType':
//       questionPrompt = `Classify what kind of document this is. Examples: Resume, Invoice, Delivery Slip, Homework Assignment, Essay, Report, etc. 
//                         Respond with only the document type.`;
//       break;
//     default:
//       questionPrompt = mode; // fallback if someone passes a raw string
//   }

//   const response = await openai.chat.completions.create({
//     model: 'gpt-4',
//     messages: [
//       {
//         role: 'system',
//         content: 'You are a helpful assistant. Use the following context from a PDF document to answer the user’s question. If no answer is found in the context, say so politely.',
//       },
//       {
//         role: 'user',
//         content: `Context:\n${context}\n\nQuestion: ${questionPrompt}`,
//       },
//     ],
//   });

//   return response.choices[0].message.content.trim();
// }
export async function askOpenAI(mode, contextChunks) {
  const context = contextChunks.join('\n\n');

  let questionPrompt = '';

  switch (mode) {
    case 'summary':
      questionPrompt = `
You are an AI assistant that analyzes a document and creates a short, friendly, confident overview for the user.

Your output should follow this structure:
1. Start with a casual greeting ("Hey there!", "Hi friend!", "Good morning!").
2. One sentence confidently stating the document type and purpose.
3. 3 simple bullet points highlighting key info.
4. End with a friendly closing sentence inviting further questions.

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
      questionPrompt = mode; // fallback for raw string prompts
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
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




// Streaming chat completion for real-time response
export function askOpenAIStream(question, contextChunks) {
  const context = contextChunks.join('\n\n');

  return openai.chat.completions.create({
    model: 'gpt-4o',
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

// import { OpenAI } from 'openai';
// import dotenv from 'dotenv';
// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function getEmbedding(text) {
//   // text can be string or array of strings; here assuming string
//   const response = await openai.embeddings.create({
//     input: text,
//     model: 'text-embedding-3-small', // matches your Pinecone index dimension 512
//   });
//   // response.data can be an array, so handle array or single string
//   if (Array.isArray(response.data)) {
//     return response.data[0].embedding;
//   }
//   return response.data.embedding;
// }

// export async function askOpenAI(question, contextChunks) {
//   // const context = contextChunks.map(chunk => chunk.metadata?.text || '').join('\n\n');
//   console.log('contextChunks length', contextChunks.length);
//   console.log('contextChunks', contextChunks);
//   const context = contextChunks.join('\n\n');

  

//   console.log('Context sent to OpenAI:', context);

//   const res = await openai.chat.completions.create({
//     model: 'gpt-4',
//     messages: [
//       {
//         role: 'system',
//         content: `You are a helpful assistant. Use the following context extracted from a PDF document to answer the user's question. 
//                   If the context does not contain the answer, say so politely. 
//                   Provide a concise, informative answer based only on the context.`,
//       },
//       {
//         role: 'user',
//         content: `Context:\n${context}\n\nQuestion: ${question}`,
//       },
//     ],
//   });

//   return res.choices[0].message.content;
// }

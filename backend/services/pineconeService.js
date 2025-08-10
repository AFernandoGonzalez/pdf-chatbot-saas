import PDFFile from '../models/PDFFile.js';
import { getEmbedding } from './openaiService.js';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  // environment: process.env.PINECONE_ENVIRONMENT,
});

const index = pinecone.index(process.env.PINECONE_INDEX);

export async function saveToPinecone(fileId, chunks, filename) {
  console.log(`Saving ${chunks.length} chunks to Pinecone under fileId: ${fileId}`);

  if (!Array.isArray(chunks)) {
    throw new Error('Expected chunks to be an array of strings');
  }

  const embeddings = await Promise.all(
    chunks.map(async (chunk, idx) => {
      if (typeof chunk !== 'string' || !chunk.trim()) {
        throw new Error(`Chunk at index ${idx} is not a valid non-empty string`);
      }

      const embedding = await getEmbedding(chunk);

      return {
        id: `${fileId}_chunk_${idx}_${Math.random().toString(36).substr(2, 9)}`, // unique id per chunk
        values: embedding,
        metadata: {
          text: chunk,
          pageNumber: idx + 1,
          fileId,
        },
      };
    })
  );

  if (embeddings.length === 0) throw new Error('No embeddings generated');

  await index.namespace(fileId).upsert(embeddings);

  // Save file metadata + basic summary/questions placeholder (optional)
  await PDFFile.findOneAndUpdate(
    { fileId },
    {
      fileId,
      filename,
      uploadDate: new Date(),
      // summary/questions to be generated later
    },
    { upsert: true, new: true }
  );

  return embeddings.length;
}

export async function getRelevantChunks(fileId, query, topK = 8, minScore = 0.15) {
  const queryEmbedding = await getEmbedding(query);

  const result = await index.namespace(fileId).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  const matches = result.matches || [];

  // Filter matches by minScore threshold
  const filtered = matches.filter((m) => {
    const score = typeof m.score === 'string' ? parseFloat(m.score) : m.score;
    return score !== undefined && score >= minScore;
  });

  // Fallback to top 2 if none above threshold
  if (filtered.length === 0) return matches.slice(0, 2);

  return filtered;
}


// import { Pinecone } from '@pinecone-database/pinecone';
// import { getEmbedding } from './openaiService.js'; // ✅ <-- THIS LINE
// import File from '../models/PDFFile.js'; // ✅ <-- THIS LINE

// import dotenv from 'dotenv';
// dotenv.config();

// const pinecone = new Pinecone({
//   apiKey: process.env.PINECONE_API_KEY,
// });

// const index = pinecone.index(process.env.PINECONE_INDEX);

// export async function saveToPinecone(fileId, chunks) {
//   console.log('Saving to Pinecone:', { fileId, chunksCount: chunks.length });

//   if (!Array.isArray(chunks)) {
//     throw new Error('Expected chunks to be an array');
//   }

//   const embeddings = await Promise.all(chunks.map(chunk => getEmbedding(chunk)));
//   console.log('Embeddings generated:', embeddings.length);

//   const vectors = embeddings.map((embedding, i) => ({
//     id: `${fileId}_chunk_${i}`,
//     values: embedding,
//     metadata: {
//       text: chunks[i],
//       fileId,
//     },
//   }));

//   // console.log('Vectors prepared for upsert:', vectors.length);

//   if (vectors.length === 0) {
//     throw new Error('No vectors to upsert');
//   }

//   // ✅ SERVERLESS: Use namespace and pass vectors directly (not wrapped)
//   await index.namespace(fileId).upsert(vectors);

//   // console.log(`Upserted ${vectors.length} vectors to Pinecone`);
//   // --- 🔥 Auto Summary & Questions Below ---

//   const firstFewChunks = chunks.slice(0, 3); // use first 3 chunks for summary
//   const context = firstFewChunks.join('\n\n');

//   const summary = await askOpenAI('Summarize this document in 2–3 sentences.', [ { metadata: { text: context } } ]);
//   console.log('📄 Summary:', summary);

//   const questions = await askOpenAI('Based on this document, generate 3 helpful questions someone might ask.', [ { metadata: { text: context } } ]);
//   const suggestedQuestions = questions
//     .split('\n')
//     .map(q => q.replace(/^\d+\.\s*/, '').trim())
//     .filter(Boolean)
//     .slice(0, 3); // clean and limit

//   console.log('❓ Suggested Questions:', suggestedQuestions);

//   // Optionally save to your DB if you're storing summary/questions
//   await File.findOneAndUpdate(
//     { fileId },
//     {
//       fileId,
//       filename,
//       uploadDate: new Date(),
//       summary,
//       questions: suggestedQuestions,
//     },
//     { upsert: true, new: true }
//   );
//   return {
//     summary,
//     questions: suggestedQuestions,
//   };
// }


// export async function getRelevantChunks(fileId, query) {
//   const queryEmbedding = await getEmbedding(query);

//   const result = await index.namespace(fileId).query({
//     vector: queryEmbedding,
//     topK: 8, // increase topK to give more room for filtering
//     includeMetadata: true,
//   });

//   const matches = result.matches || [];

//   // Log all match scores and metadata
//   console.log('\n🔍 All Match Scores:');
//   matches.forEach((m, i) => {
//     const score = typeof m.score === 'string' ? parseFloat(m.score) : m.score;
//     const preview = m.metadata?.text?.slice(0, 80)?.replace(/\n/g, ' ') ?? '[No Text]';
//     console.log(`#${i + 1} | ID: ${m.id} | Score: ${score?.toFixed(4)} | Preview: "${preview}"`);
//   });

//   // Filter with threshold
//   const MIN_SCORE = 0.15;
//   const filtered = matches.filter(m => {
//     const score = typeof m.score === 'string' ? parseFloat(m.score) : m.score;
//     return score !== undefined && score >= MIN_SCORE;
//   });

//   console.log(`\n📊 Found ${matches.length} matches, filtered to ${filtered.length} with score >= ${MIN_SCORE}`);

//   // Fallback: use top 2 no matter what
//   console.warn(`⚠️ No matches passed threshold (${MIN_SCORE}). Using fallback top 2 chunks.`);

//   // Log fallback scores
//   matches.slice(0, 2).forEach((m, i) => {
//     const score = typeof m.score === 'string' ? parseFloat(m.score) : m.score;
//     const preview = m.metadata?.text?.slice(0, 80)?.replace(/\n/g, ' ') ?? '[No Text]';
//     console.log(`🔁 Fallback #${i + 1} | ID: ${m.id} | Score: ${score?.toFixed(4)} | Preview: "${preview}"`);
//   });

//   return matches.slice(0, 2);
// }



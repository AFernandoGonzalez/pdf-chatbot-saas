import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedding } from './openaiService.js'; // ✅ <-- THIS LINE

import dotenv from 'dotenv';
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index(process.env.PINECONE_INDEX);

// export async function saveToPinecone(fileId, chunks) {
//   console.log('Saving to Pinecone:', {
//     fileId,
//     chunksCount: chunks.length,
//   });
  
//   if (!Array.isArray(chunks)) {
//     throw new Error('Expected chunks to be an array');
//   }

//   const records = chunks.map((chunk, i) => ({
//     _id: `${fileId}_chunk_${i}`, // ✅ required
//     text: chunk,                 // ✅ must be `text` to match field mapping
//     fileId,                      // optional metadata
//   }));

//   console.log('records', records.length);

//   if (records.length === 0) {
//     throw new Error('No records to upsert');
//   }

//   await index.upsertRecords(records);
// }

export async function saveToPinecone(fileId, chunks) {
  console.log('Saving to Pinecone:', { fileId, chunksCount: chunks.length });

  if (!Array.isArray(chunks)) {
    throw new Error('Expected chunks to be an array');
  }

  const embeddings = await Promise.all(chunks.map(chunk => getEmbedding(chunk)));
  console.log('Embeddings generated:', embeddings.length);

  const vectors = embeddings.map((embedding, i) => ({
    id: `${fileId}_chunk_${i}`,
    values: embedding,
    metadata: {
      text: chunks[i],
      fileId,
    },
  }));

  console.log('Vectors prepared for upsert:', vectors.length);

  if (vectors.length === 0) {
    throw new Error('No vectors to upsert');
  }

  // ✅ SERVERLESS: Use namespace and pass vectors directly (not wrapped)
  await index.namespace(fileId).upsert(vectors);

  console.log(`Upserted ${vectors.length} vectors to Pinecone`);
}


export async function getRelevantChunks(fileId, query) {
  const queryEmbedding = await getEmbedding(query);
  console.log('Query embedding:', queryEmbedding);

  const result = await index.namespace(fileId).query({  // <--- THIS IS CRUCIAL
    vector: queryEmbedding,
    topK: 2,
    includeMetadata: true,
  });

  const threshold = 0.19;

  const filteredChunks = (result.matches || []).filter(
    match => match.score !== undefined && match.score >= threshold
  );


  // console.log('Pinecone query result:', result);
  // return result.matches || [];

  if (filteredChunks.length > 0) {
    console.log(`✅ Using ${filteredChunks.length} high-score matches`);
    return filteredChunks;
  }

  // 🛟 Fallback: return top 2 chunks anyway (even if score < threshold)
  const fallbackChunks = result.matches.slice(0, 2);
  console.log('⚠️ No relevant chunks passed threshold. Using fallback:', fallbackChunks);
  return fallbackChunks;
}

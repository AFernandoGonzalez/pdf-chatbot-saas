import PDFFile from '../models/PDFFile.js';
import { getEmbedding } from './openaiService.js';
import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index(process.env.PINECONE_INDEX);

export async function saveToPinecone(fileId, chunks, filename, userId) {

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
        id: `${fileId}_chunk_${idx}_${uuidv4()}`,
        values: embedding,
        metadata: {
          text: chunk,
          pageNumber: idx + 1,
          fileId,
          filename,
          userId,
        },
      };
    })
  );

  if (embeddings.length === 0) throw new Error('No embeddings generated');

  await index.namespace(userId).upsert(embeddings);

  await PDFFile.findOneAndUpdate(
    { fileId },
    {
      fileId,
      filename,
      uploadDate: new Date(),
      status: 'uploaded',
      userId,
    },
    { upsert: true, new: true }
  );

  return embeddings.length;
}

export async function getRelevantChunks(fileId, query, topK = 8, minScore = 0.15) {
  const queryEmbedding = await getEmbedding(query);

  const result = await index.namespace(userId).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: { fileId },
  });

  const matches = result.matches || [];

  const filtered = matches.filter((m) => {
    const score = typeof m.score === 'string' ? parseFloat(m.score) : m.score;
    return score !== undefined && score >= minScore;
  });

  if (filtered.length === 0) return matches.slice(0, 2);

  return filtered;
}


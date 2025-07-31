import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.Index(process.env.PINECONE_INDEX);

export async function saveToPinecone(fileId, embeddings, chunks) {
  const vectors = embeddings.map((embed, i) => ({
    id: `${fileId}_chunk_${i}`,
    values: embed,
    metadata: { chunk: chunks[i], fileId },
  }));

  await index.upsert({ vectors });
}

export async function getRelevantChunks(fileId, questionEmbedding) {
  const res = await index.query({
    topK: 5,
    vector: questionEmbedding,
    filter: { fileId },
    includeMetadata: true,
  });

  return res.matches.map(match => match.metadata.chunk);
}

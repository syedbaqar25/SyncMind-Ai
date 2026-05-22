const { Pinecone } = require('@pinecone-database/pinecone');
const { getOpenAIClient } = require('../../config/openai');

let pinecone;

const getPineconeIndex = () => {
  if (!pinecone) {
    pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }

  return pinecone.index(process.env.PINECONE_INDEX);
};

const chunkText = (text, chunkSize = 500, overlap = 50) => {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(' '));
    if (end === words.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
};

const batch = (items, size) => {
  const batches = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
};

const createEmbedding = async (input) => {
  const response = await getOpenAIClient().embeddings.create({
    model: 'text-embedding-3-small',
    input
  });

  return response.data[0].embedding;
};

const vectorizeTranscript = async ({ meetingId, workspaceId, fullText }) => {
  const chunks = chunkText(fullText);
  const index = getPineconeIndex();

  const indexedChunks = chunks.map((chunk, chunkIndex) => ({ chunk, chunkIndex }));

  for (const group of batch(indexedChunks, 10)) {
    const vectors = await Promise.all(
      group.map(async ({ chunk, chunkIndex }) => {
        return {
          id: `${meetingId}-chunk-${chunkIndex}`,
          values: await createEmbedding(chunk),
          metadata: {
            meetingId,
            workspaceId,
            chunkIndex,
            text: chunk
          }
        };
      })
    );

    await index.upsert(vectors);
  }

  return chunks.length;
};

module.exports = {
  chunkText,
  createEmbedding,
  vectorizeTranscript,
  getPineconeIndex
};

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');

const EMBEDDING_DELAY_MS = Number(process.env.GEMINI_EMBEDDING_DELAY_MS || 15000);
const MAX_EMBEDDING_CHUNKS = Number(process.env.GEMINI_MAX_EMBEDDING_CHUNKS || 4);

let pinecone;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getEmbeddingApiKey = () =>
  process.env.GEMINI_API_KEY_3 || process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;

const getEmbeddingClient = () => new GoogleGenerativeAI(getEmbeddingApiKey());

const getPineconeIndex = () => {
  if (!pinecone) {
    pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return pinecone.index(process.env.PINECONE_INDEX);
};

const getEmbeddingModelName = async (apiKey = getEmbeddingApiKey()) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    const embeddingModels = data.models?.filter((model) =>
      model.supportedGenerationMethods?.includes('embedContent')
    ) || [];
    const preferred = embeddingModels.find((model) => model.name.includes('text-embedding-004'));
    const model = preferred || embeddingModels[0];
    return model ? model.name.replace('models/', '') : 'text-embedding-004';
  } catch {
    return 'text-embedding-004';
  }
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

const createEmbedding = async (input, retries = 3) => {
  const apiKey = getEmbeddingApiKey();
  const modelName = await getEmbeddingModelName(apiKey);

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const model = getEmbeddingClient().getGenerativeModel({ model: modelName });
      const result = await model.embedContent(input);
      return result.embedding.values;
    } catch (error) {
      if (attempt >= retries - 1) throw error;
      await sleep(EMBEDDING_DELAY_MS);
    }
  }

  return [];
};

const vectorizeTranscript = async ({ meetingId, workspaceId, fullText }) => {
  const chunks = chunkText(fullText).slice(0, MAX_EMBEDDING_CHUNKS);
  if (!chunks.length) return 0;

  const index = getPineconeIndex();
  const vectors = [];

  for (let i = 0; i < chunks.length; i += 1) {
    const values = await createEmbedding(chunks[i]);
    vectors.push({
      id: `${meetingId}-chunk-${i}`,
      values,
      metadata: { meetingId, workspaceId, chunkIndex: i, text: chunks[i] }
    });

    if (i < chunks.length - 1) await sleep(EMBEDDING_DELAY_MS);
  }

  await index.upsert(vectors);
  return vectors.length;
};

const deleteMeetingVectors = async (meetingId) => {
  const index = getPineconeIndex();
  if (typeof index.deleteMany === 'function') {
    await index.deleteMany({ filter: { meetingId } });
  }
};

module.exports = {
  chunkText,
  createEmbedding,
  deleteMeetingVectors,
  getEmbeddingModelName,
  getPineconeIndex,
  vectorizeTranscript
};

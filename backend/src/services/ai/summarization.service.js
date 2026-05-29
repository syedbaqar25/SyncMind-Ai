const { GoogleGenerativeAI } = require('@google/generative-ai');

const getAnalysisClient = () => new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY
);

const getModel = () => getAnalysisClient().getGenerativeModel({ model: 'gemini-2.5-flash' });

const stripJsonFence = (content) =>
  String(content || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

const generateText = async (prompt) => {
  const result = await getModel().generateContent(prompt);
  return result.response.text().trim();
};

const summarizeTranscript = async (fullText) =>
  generateText(`You are an expert meeting analyst. Write a concise, professional 3-5 paragraph executive summary covering main topics, key decisions, important context, and outcome.

TRANSCRIPT:
${fullText}`);

const extractKeyTopics = async (fullText) => {
  const content = await generateText(`Extract 5-8 key topics from this transcript.
Return only a JSON array of short noun phrases. No markdown.

TRANSCRIPT:
${fullText}`);

  try {
    const parsed = JSON.parse(stripJsonFence(content));
    return Array.isArray(parsed) ? parsed.map(String).slice(0, 8) : [];
  } catch {
    return [];
  }
};

const parseSentiment = (content) => {
  const normalized = String(content || '').trim().toLowerCase();
  return ['positive', 'negative', 'neutral'].includes(normalized) ? normalized : 'neutral';
};

const analyzeSentiment = async (fullText) => {
  const content = await generateText(`Analyze the overall sentiment of this meeting transcript.
Reply with exactly one word: positive, negative, or neutral.

TRANSCRIPT:
${fullText}`);
  return parseSentiment(content);
};

module.exports = {
  analyzeSentiment,
  extractKeyTopics,
  generateText,
  parseSentiment,
  stripJsonFence,
  summarizeTranscript
};

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Key 2 — dedicated for all text analysis tasks
const getAnalysisClient = () => new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY
);

const getModel = () => {
  return getAnalysisClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
};

const stripJsonFence = (content) =>
  String(content || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

const summarizeTranscript = async (fullText) => {
  const model = getModel();
  const result = await model.generateContent(
    `You are an expert meeting analyst. Write a concise, professional summary.

Write a 3-5 paragraph executive summary of this meeting transcript covering:
main topics discussed, key decisions made, important context, and overall outcome.
Be clear and professional.

TRANSCRIPT:
${fullText}`
  );
  return result.response.text().trim();
};

const extractKeyTopics = async (fullText) => {
  const model = getModel();
  const result = await model.generateContent(
    `Extract key topics from this meeting transcript.
Return ONLY a JSON array of 5-8 short noun phrase strings. No markdown, no explanation.
Example: ["Budget Planning", "Q3 Goals", "Team Hiring"]

TRANSCRIPT:
${fullText}`
  );

  try {
    const parsed = JSON.parse(stripJsonFence(result.response.text()));
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
  const model = getModel();
  const result = await model.generateContent(
    `Analyze the overall sentiment of this meeting transcript.
Reply with exactly one word only: positive, negative, or neutral

TRANSCRIPT:
${fullText}`
  );
  return parseSentiment(result.response.text().trim());
};

module.exports = {
  summarizeTranscript,
  extractKeyTopics,
  analyzeSentiment,
  parseSentiment
};
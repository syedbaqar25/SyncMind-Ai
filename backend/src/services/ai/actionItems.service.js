const { GoogleGenerativeAI } = require('@google/generative-ai');

// Key 2 — dedicated for all text analysis tasks
const getAnalysisClient = () => new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY
);

const stripJsonFence = (content) =>
  String(content || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

const parseActionItems = (content) => {
  if (!content) return [];
  try {
    const parsed = JSON.parse(stripJsonFence(content));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.title === 'string')
      .map((item) => ({
        title: item.title,
        description: typeof item.description === 'string' ? item.description : '',
        priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(item.priority)
          ? item.priority
          : 'MEDIUM',
        suggestedAssignee: item.suggestedAssignee || null,
        dueDate: item.dueDate || null
      }));
  } catch {
    return [];
  }
};

const extractActionItems = async (fullText) => {
  const genAI = getAnalysisClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent(
    `You are a meeting action item extractor.
Return ONLY a valid JSON array. No markdown, no explanation, no backticks.

Extract ALL action items from this transcript. Each item must have:
{
  "title": "short task title",
  "description": "detailed description",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "suggestedAssignee": "person name or null",
  "dueDate": "ISO date string or null"
}

Be thorough — include every task, follow-up, or commitment mentioned.

TRANSCRIPT:
${fullText}`
  );

  return parseActionItems(result.response.text());
};

module.exports = { parseActionItems, extractActionItems };
const { GoogleGenerativeAI } = require('@google/generative-ai');

const getAnalysisClient = () => new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY
);

const stripJsonFence = (content) =>
  String(content || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

const normalizePriority = (priority) =>
  ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority) ? priority : 'MEDIUM';

const parseActionItems = (content) => {
  if (!content) return [];

  try {
    const parsed = JSON.parse(stripJsonFence(content));
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item.title === 'string')
      .map((item) => ({
        title: item.title.trim(),
        description: typeof item.description === 'string' ? item.description.trim() : '',
        priority: normalizePriority(item.priority),
        suggestedAssignee: item.suggestedAssignee || null,
        dueDate: item.dueDate || null
      }));
  } catch {
    return [];
  }
};

const extractActionItems = async (fullText) => {
  const model = getAnalysisClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(`You are a meeting action item extractor.
Return only valid JSON. No markdown, no prose.

Extract every task, follow-up, or commitment from this transcript as an array:
[
  {
    "title": "short task title",
    "description": "clear task details",
    "priority": "LOW|MEDIUM|HIGH|URGENT",
    "suggestedAssignee": "person name or null",
    "dueDate": "ISO date string or null"
  }
]

TRANSCRIPT:
${fullText}`);

  return parseActionItems(result.response.text());
};

module.exports = {
  extractActionItems,
  parseActionItems,
  stripJsonFence
};

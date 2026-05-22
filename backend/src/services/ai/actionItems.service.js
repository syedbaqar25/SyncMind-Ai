const { createChatCompletion } = require('./summarization.service');

const stripJsonFence = (content) =>
  String(content || '')
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
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
        priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(item.priority) ? item.priority : 'MEDIUM',
        suggestedAssignee: item.suggestedAssignee || null,
        dueDate: item.dueDate || null
      }));
  } catch (error) {
    return [];
  }
};

const extractActionItems = async (fullText) => {
  const content = await createChatCompletion({
    max_tokens: 2000,
    system: 'You are a meeting action item extractor. Always respond with valid JSON only. No markdown.',
    user:
      "Extract ALL action items from this transcript. Return a JSON array where each item has: { title: string, description: string, priority: 'LOW'|'MEDIUM'|'HIGH'|'URGENT', suggestedAssignee: string|null, dueDate: ISO-string|null }. Be thorough - include every task, follow-up, or commitment mentioned.\n\nTRANSCRIPT:\n" +
      fullText
  });

  return parseActionItems(content);
};

module.exports = {
  parseActionItems,
  extractActionItems
};

const { getOpenAIClient } = require('../../config/openai');

const getMessageText = (response) => response.choices?.[0]?.message?.content?.trim() || '';

const createChatCompletion = async ({ system, user, max_tokens }) => {
  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    max_tokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  return getMessageText(response);
};

const summarizeTranscript = (fullText) =>
  createChatCompletion({
    max_tokens: 1000,
    system: 'You are an expert meeting analyst. Write concise, professional summaries.',
    user:
      'Write a 3-5 paragraph executive summary of this meeting transcript covering: main topics discussed, key decisions made, important context, and overall outcome.\n\nTRANSCRIPT:\n' +
      fullText
  });

const extractKeyTopics = async (fullText) => {
  const content = await createChatCompletion({
    max_tokens: 200,
    system: 'You extract key topics from meeting transcripts. Always respond with valid JSON only.',
    user:
      'List the 5-8 key topics discussed. Return as a JSON array of short noun phrase strings.\n\nTRANSCRIPT:\n' +
      fullText
  });

  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed.map(String).slice(0, 8) : [];
  } catch (error) {
    return [];
  }
};

const parseSentiment = (content) => {
  const normalized = String(content || '').trim().toLowerCase();
  return ['positive', 'negative', 'neutral'].includes(normalized) ? normalized : 'neutral';
};

const analyzeSentiment = async (fullText) => {
  const content = await createChatCompletion({
    max_tokens: 10,
    system: 'You analyze meeting sentiment. Respond with exactly one word.',
    user: 'What is the overall sentiment of this meeting? Reply with exactly one of: positive, negative, neutral\n\nTRANSCRIPT:\n' + fullText
  });

  return parseSentiment(content);
};

module.exports = {
  createChatCompletion,
  summarizeTranscript,
  extractKeyTopics,
  analyzeSentiment,
  parseSentiment
};

const { parseActionItems } = require('../../services/ai/actionItems.service');
const { parseSentiment } = require('../../services/ai/summarization.service');
const { chunkText } = require('../../services/ai/embedding.service');

describe('AI helpers', () => {
  test('parseActionItems parses valid JSON array correctly', () => {
    const items = parseActionItems('[{"title":"Follow up","description":"Email notes","priority":"HIGH","suggestedAssignee":null,"dueDate":null}]');
    expect(items).toHaveLength(1);
    expect(items[0].priority).toBe('HIGH');
  });

  test('parseActionItems returns [] for malformed JSON', () => {
    expect(parseActionItems('{bad')).toEqual([]);
  });

  test('parseActionItems returns [] for empty string input', () => {
    expect(parseActionItems('')).toEqual([]);
  });

  test('parseSentiment returns positive when GPT says positive', () => {
    expect(parseSentiment('positive')).toBe('positive');
  });

  test('parseSentiment defaults to neutral for unexpected response', () => {
    expect(parseSentiment('excited')).toBe('neutral');
  });

  test('chunkText splits 2000-word text into multiple chunks', () => {
    const text = Array.from({ length: 2000 }, (_, index) => `word${index}`).join(' ');
    expect(chunkText(text).length).toBeGreaterThan(1);
  });

  test('chunkText each chunk <= 500 words', () => {
    const text = Array.from({ length: 2000 }, (_, index) => `word${index}`).join(' ');
    expect(chunkText(text).every((chunk) => chunk.split(/\s+/).length <= 500)).toBe(true);
  });

  test('chunkText chunks have 50-word overlap', () => {
    const text = Array.from({ length: 700 }, (_, index) => `word${index}`).join(' ');
    const chunks = chunkText(text);
    const firstTail = chunks[0].split(/\s+/).slice(-50).join(' ');
    const secondHead = chunks[1].split(/\s+/).slice(0, 50).join(' ');
    expect(secondHead).toBe(firstTail);
  });
});

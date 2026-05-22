const OpenAI = require('openai');

let client;

const getOpenAIClient = () => {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
};

module.exports = {
  getOpenAIClient
};

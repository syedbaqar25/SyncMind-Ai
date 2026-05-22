const fs = require('fs');
const os = require('os');
const path = require('path');
const axios = require('axios');
const { getOpenAIClient } = require('../../config/openai');

const transcribeAudioFromUrl = async ({ meetingId, audioUrl }) => {
  const tempPath = path.join(os.tmpdir(), `${meetingId}.mp3`);

  try {
    const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(tempPath, Buffer.from(response.data));

    return await getOpenAIClient().audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
};

module.exports = {
  transcribeAudioFromUrl
};

const fs = require('fs');
const os = require('os');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Key 1 — dedicated for transcription
const getTranscriptionClient = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.mp3': 'audio/mp3',
    '.mp4': 'video/mp4',
    '.wav': 'audio/wav',
    '.m4a': 'audio/m4a',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/avi',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac'
  };
  return mimeTypes[ext] || 'video/mp4';
};

const getExtension = (url) => {
  const ext = url.split('?')[0].split('.').pop().toLowerCase();
  return ext ? `.${ext}` : '.mp4';
};

const transcribeAudioFromUrl = async ({ meetingId, audioUrl }) => {
  const tempPath = path.join(os.tmpdir(), `${meetingId}${getExtension(audioUrl)}`);

  try {
    const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(tempPath, Buffer.from(response.data));

    const audioData = fs.readFileSync(tempPath);
    const base64Audio = audioData.toString('base64');
    const mimeType = getMimeType(tempPath);

    const genAI = getTranscriptionClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Audio
        }
      },
      {
        text: `Transcribe this audio/video recording completely and accurately.
Return ONLY a JSON object with this exact structure, no markdown:
{
  "text": "full transcription here",
  "language": "en",
  "segments": [
    {
      "text": "segment text",
      "start": 0.0,
      "end": 5.0,
      "speaker": "Speaker 1"
    }
  ]
}

Rules:
- Transcribe every word spoken
- Split into segments of 2-4 sentences each
- Estimate timestamps based on speech pace (average 150 words/minute)
- Identify different speakers if possible (Speaker 1, Speaker 2, etc.)
- Support Hindi, English, and mixed language (Hinglish)
- Return valid JSON only, absolutely no markdown backticks`
      }
    ]);

    const rawText = result.response.text().trim();
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      parsed = {
        text: rawText,
        language: 'en',
        segments: [{ text: rawText, start: 0, end: 60, speaker: 'Speaker 1' }]
      };
    }

    return {
      text: parsed.text || rawText,
      language: parsed.language || 'en',
      segments: Array.isArray(parsed.segments) ? parsed.segments : [
        { text: parsed.text || rawText, start: 0, end: 60, speaker: 'Speaker 1' }
      ]
    };

  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
};

module.exports = { transcribeAudioFromUrl };
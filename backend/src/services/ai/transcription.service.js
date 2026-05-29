const fs = require('fs');
const os = require('os');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const getTranscriptionClient = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extensionMimeTypes = {
  '.avi': 'video/x-msvideo',
  '.flac': 'audio/flac',
  '.m4a': 'audio/mp4',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.webm': 'video/webm'
};

const stripJsonFence = (content) =>
  String(content || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

const getExtension = (url = '') => {
  const cleanPath = url.split('?')[0].split('#')[0];
  const ext = path.extname(cleanPath).toLowerCase();
  return extensionMimeTypes[ext] ? ext : '.mp4';
};

const getMimeType = (filePath) => {
  return extensionMimeTypes[path.extname(filePath).toLowerCase()] || 'video/mp4';
};

const normalizeSegments = (segments, fallbackText) => {
  if (!Array.isArray(segments) || !segments.length) {
    return [{ text: fallbackText, start: 0, end: 60, speaker: 'Speaker 1' }];
  }

  return segments.map((segment, index) => ({
    text: String(segment.text || '').trim(),
    start: Number(segment.start ?? segment.startTime ?? index * 30),
    end: Number(segment.end ?? segment.endTime ?? (index + 1) * 30),
    speaker: segment.speaker || `Speaker ${index + 1}`
  })).filter((segment) => segment.text);
};

const transcribeAudioFromUrl = async ({ meetingId, audioUrl }) => {
  const tempPath = path.join(os.tmpdir(), `${meetingId}${getExtension(audioUrl)}`);

  try {
    const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(tempPath, Buffer.from(response.data));

    const base64Media = fs.readFileSync(tempPath).toString('base64');
    const model = getTranscriptionClient().getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: getMimeType(tempPath),
          data: base64Media
        }
      },
      {
        text: `Transcribe this meeting recording completely and accurately.
Return only valid JSON with this shape:
{
  "text": "full transcription",
  "language": "en",
  "segments": [
    { "text": "segment text", "start": 0, "end": 5, "speaker": "Speaker 1" }
  ]
}
Estimate timestamps based on speech pace when exact timings are unavailable.
Support English, Hindi, and mixed Hinglish. Do not include markdown.`
      }
    ]);

    const rawText = result.response.text().trim();
    let parsed;

    try {
      parsed = JSON.parse(stripJsonFence(rawText));
    } catch {
      parsed = { text: rawText, language: 'en', segments: [] };
    }

    const text = parsed.text || rawText;
    return {
      text,
      language: parsed.language || 'en',
      segments: normalizeSegments(parsed.segments, text)
    };
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
};

module.exports = {
  getExtension,
  getMimeType,
  transcribeAudioFromUrl
};

// server.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import util from 'util';

dotenv.config();
const execAsync = util.promisify(exec);

const app = express();
const port = 3001;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// === File setup ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// === Transcription Endpoint ===
// app.post('/api/transcribe', upload.single('file'), async (req, res) => {
//   const inputPath = req.file.path;
//   const outputPath = path.join(uploadDir, `converted-${Date.now()}.wav`);

//   try {
//     // Convert audio using ffmpeg
//     await execAsync(`ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outputPath}"`);

//     const transcription = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(outputPath),
//       model: 'whisper-1',
//     });

//     // Clean up temp files
//     fs.unlinkSync(inputPath);
//     fs.unlinkSync(outputPath);

//     res.json({ transcript: transcription.text });
//   } catch (err) {
//     console.error('❌ Transcription error:', err);
//     res.status(500).json({ error: 'Transcription failed' });
//   }
// });

// === Transcription Endpoint Placeholder for Testing ===
app.post('/api/transcribe', async (req, res) => {
  try {
    console.log('📦 Received mock transcription request');
    const fakeTranscript = `
      Today we reviewed the concept of photosynthesis. 
      The students worked in groups to identify the parts of the process, 
      and we clarified some common misconceptions about chlorophyll and sunlight absorption. 
      Homework was assigned on page 42 of the workbook.
    `;

    res.json({ transcript: fakeTranscript.trim() });
  } catch (err) {
    console.error('❌ Placeholder transcription error:', err);
    res.status(500).json({ error: 'Mock transcription failed' });
  }
});


// === Summarization Endpoint ===
app.post('/api/summarize', async (req, res) => {
  const { transcript } = req.body;

  if (!transcript || transcript.trim().length === 0) {
    return res.status(400).json({ error: 'No transcript provided' });
  }

  const prompt = `You're an expert classroom assistant. Summarize the following transcript into a clear, concise overview of what happened in the class. Use bullet points when helpful.

Transcript:
"""
${transcript}
"""`;

  try {
    const summaryRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const summary = summaryRes.choices[0].message.content;
    res.json({ summary });
  } catch (err) {
    console.error('❌ Summarization error:', err);
    res.status(500).json({ error: 'Summarization failed' });
  }
});


app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

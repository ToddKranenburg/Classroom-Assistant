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
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(uploadDir, `converted-${Date.now()}.wav`);

  try {
    // Convert audio using ffmpeg
    await execAsync(`ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outputPath}"`);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: 'whisper-1',
    });

    // Clean up temp files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.json({ transcript: transcription.text });
  } catch (err) {
    console.error('❌ Transcription error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// === Summarization Placeholder Endpoint ===
app.post('/api/summarize', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: 'No transcript provided' });

  // 🔧 Placeholder summary logic
  const summary = 'This is a placeholder summary of the transcript.';

  res.json({ summary });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

// server.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// === CORS CONFIG ===
const allowedOrigins = [
  'http://localhost:5173', // Vite local dev server
  'https://classroom-assistant-r2w4e06zw-toddkranenburgs-projects.vercel.app', // Vercel frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS not allowed for this origin'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json());

// === Ensure uploads dir exists ===
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// === Multer setup ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// === Transcription endpoint ===
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
    });

    fs.unlink(filePath, () => {}); // cleanup

    res.json({ transcript: transcription.text });
  } catch (err) {
    console.error('❌ Transcription error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// === Summarization endpoint ===
app.post('/api/summarize', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: 'No transcript provided' });
  }

  const prompt = `From the following classroom transcript:
  ...your summarization instructions here...`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);

    // Ensure all categories exist
    const allCategories = [
      'Direct Instruction',
      'Student Practice',
      'Discussion & Dialogue',
      'Feedback & Assessment',
      'Setup',
      'Interruptions',
      'Other',
    ];
    parsed.category_breakdown = parsed.category_breakdown || {};
    allCategories.forEach((cat) => {
      if (!(cat in parsed.category_breakdown)) {
        parsed.category_breakdown[cat] = 0;
      }
    });

    res.json(parsed);
  } catch (err) {
    console.error('❌ Summarization error:', err);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

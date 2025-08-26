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
    console.error(err.response?.data || err.message)
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
  1. Give a quick summary of the lesson, making it clear what the learning goal was and how they got there. It should be written at an appropriate text level for a 9th grader who missed the lesson. (one string)
  2. Consider the targeted learning objectives in the lesson and come up with a ~10-15 minute at-home activity that a student who missed class could do at home on their own to catch up on what the rest of the class learned. Structure it as a list of instructions (array of strings).
  3. Estimate the total time spent in each of the following categories, in minutes, based on the transcript. Return as an object with keys matching the categories below and integer values (minutes).
    - Direct Instruction (Teacher-led explanation, modeling, lecture, or demonstration of new content or procedures.)
    - Student Practice (Students working independently or in groups on exercises, problems, or tasks related to the lesson content.)
    - Discussion & Dialogue (Class discussions, student questions, and teacher responses that facilitate understanding of the content.)
    - Feedback & Assessment (Activities related to assessing student understanding and providing feedback.)
    - Setup (Time spent preparing for the lesson, including setting up materials and technology.)
    - Interruptions (Unplanned events that disrupt the flow of the lesson.)
    - Other (Any other activities that don't fit into the categories above.)
  4. Divide the lesson into 1-minute intervals (or as close as possible) and, for each interval, estimate which category (from above) was most prominent. Return this as an array of objects, each with keys: start_minute, end_minute, category. It's possible for the same category to appear more than once over the course of the lesson.

Format your response as a JSON object with keys: class_summary, assignment_activities, category_breakdown, category_timeline

Transcript:
"""
${transcript}
"""`;

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

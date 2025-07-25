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
const port = 3001;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// === Handle file uploads ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1'
    });

    fs.unlink(filePath, () => {});

    res.json({ transcript: transcription.text });
  } catch (err) {
    console.error('❌ Transcription error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

app.post('/api/summarize', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: 'No transcript provided' });
  }

  const prompt = `From the following classroom transcript:
  1. Give a quick summary of the lesson, making it clear what the learning goal was and how they got there. It should be written at an appropriate text level for a 9th grader who missed the lesson. (one string)
  2. Consider the targeted learning objectives in the lesson and come up with a ~10-15 minute at-home activity that a student who missed class could do at home on their own to catch up on what the rest of the class learned. Structure it as a list of instructions (array of strings).
  3. Estimate the total time spent in each of the following categories, in minutes, based on the transcript. Return as an object with keys matching the categories below and integer values (minutes). If unsure, make your best guess based on the transcript. Categories:
    - Direct Instruction (Teacher-led explanation, modeling, lecture, or demonstration of new content or procedures.)
    - Student Practice (Activities where students engage with the material, practice skills, or apply concepts.)
    - Discussion & Dialogue (Whole-class or small-group discussions, student-to-student dialogue, or Q&A sessions.)
    - Feedback & Assessment (Formative assessments, quizzes, or feedback provided to students on their work.)
    - Setup (Time spent preparing for the lesson, including setting up materials or technology.)
    - Interruptions (Unplanned events that disrupt the flow of the lesson, such as misbehavior, fire drills or technical issues.)
    - Other

Format your response as a JSON object with keys: class_summary, assignment_activities, category_breakdown

Transcript:
"""
${transcript}
"""`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (err) {
    console.error('❌ Summarization error:', err);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

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

// === Transcription Endpoint Placeholder for Testing ===
// app.post('/api/transcribe', async (req, res) => {
//   try {
//     console.log('📦 Received mock transcription request');
//     const fakeTranscript = `
//       0:06 I'm gonna sort of show you an example on the planning sheet of how you might sort of be that, how you would pick out a quote.
//       0:12 Um, and I'm gonna sort of show it on the planning sheet. So if you're one of those people who was wondering- about evidence, let's sort of work on that together.
//       0:19 Umm, we're gonna do that first, I'll give you a little more time with your plan and then we'll move to writing.
//       0:24 Okay. So. Alright, so. I- On page eight. And I'm thinking, again, this is a plan and cheat, so I might not write, um, for paragraphs.
//       0:40 Full paragraphs, full sentences, I mean. So I'm going back to my example and I'm thinking, okay, here's an example of the body paragraphs.
//       0:46 So I know I need to talk about their reasons or s- othe claim and pull up, maybe a quote, and talk about its judgment.
//       0:53 So uhm, let's say for example, who is using, uhm, the claim number one, it's a government gave more water to a rich and poor.
//       1:01 Who's using that claim? Okay, so a number. So I'm gonna say, that's what I'm gonna be my first sentence, is one reason water is unequal.
//       1:17 Again, this isn't a full sentence, I'm just jotting down, is. Government gave more water to reach them.
//       1:32 Six meters, for those of you using that, what's- Source, could we recommend to PBS NewsHour that helps us prove that claim, right?
//       1:42 Put that away. Uh, Courtney, what source? Source number two. So let's flip back to source number two. And you know, Courtney, source number two, we didn't talk about a lot.
//       1:55 Could we do source three? Because I think we- or source one and source three. Okay, so let's go to source number three.
//       2:03 Um, okay. So I'm looking through source three and I'm looking at s- some of the- the things that I underlined.
//       2:13 Again, this is the process of finding evidence. If you're someone who is wondering about this, this is your time. So I'm looking at something I underlined, and I'm going right to the bottom here and says, because these colonias were illegal, those neighborhoods.
//       2:25 I'm never- The government said they did not have any responsibility to provide the colonial services, especially water and sewage. Does this last line support what I'm saying about the government giving more access to water to the rich and the poor?
//       2:41 Okay, so I could use this. This is a quotation. This is textual evidence to support what I'm saying. So I'm actually going to sort of in my planning sheet.
//       2:51 I'm going to flip back. Um, and it's a little tricky because I have to, Sort of clip between. So I'm going to do that.
//       3:01 You see how I'm sort of flipping my page up. Beautiful. This actually works nicely. So I'm going to say source number.
//       3:09 What source was this? Source three. And I'm going to quote right here. So it says, uhm, I'm going to sort of say in poor neighborhoods.
//       3:22 And then I'm going to, that's a little introduction to my quote. In poor neighborhoods. Uhm. The government. And here's my quotation marks right here.
//       3:34 That's the beginning of my quote, so you know it's not my words. Government. If you want to use this quote, you can.
//       3:41 Michael, take it right off. Government said. They did not have any responsibility to provide.
//       4:00 Bye. Colonia with services. What's up? Yes, thank you, Jennifer. Um, especially. actually Water and sewage.
//       4:21 Okay, and I'm gonna put a close right here so that I know this is my quote that is directly from our source.
//       4:29 And I'm just gonna jot right down here. It's a little messy and that's okay because it's a plan. Umm, here's my judgment.
//       4:35 It is, I trust, because it was written by a professor, by Jonathan Lee. Okay. Six gurus, put someone- I don't what I did in order to find evidence to support my claim.
//       4:55 Okay, Michael, what was the first thing I did? Okay, went to Source 3. And I know s-

//     `;

//     res.json({ transcript: fakeTranscript.trim() });
//   } catch (err) {
//     console.error('❌ Placeholder transcription error:', err);
//     res.status(500).json({ error: 'Mock transcription failed' });
//   }
// });


// === Summarization Endpoint ===
app.post('/api/summarize', async (req, res) => {
  const { transcript } = req.body;

  if (!transcript || transcript.trim().length === 0) {
    return res.status(400).json({ error: 'No transcript provided' });
  }

  const prompt = `You're an expert classroom co-teacher and helper. Summarize the following transcript from today's class to share with students who were absent so that they're prepared to jump back in when they return for our next class.
  - start by identifying the learning objective and any essential questions (if relevant)
  - list out the key takeaways that students should understand by the end of the lesson
  - don't just describe what you hear - really think like a teacher and interpret the lesson, and then provide something to the absent students that will actually help them learn what was intended.

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

// server.js
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/transcribe', (req, res) => {
  console.log('Received transcription request');
  res.json({ transcript: 'This is a placeholder transcript from the server.' });
});

app.post('/api/summarize', (req, res) => {
  console.log('Received summarization request');
  res.json({ summary: 'This is a placeholder summary from the server.' });
});

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});

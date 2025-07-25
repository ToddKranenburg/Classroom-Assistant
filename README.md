# Class Summary App

A web app that records classroom audio, transcribes it using OpenAI Whisper, and generates a summary using GPT for students who were absent.

## Stack
- Frontend: HTML + JS (Vite)
- Backend: Node.js (server.js)
- AI Services: OpenAI Whisper (for transcription) and GPT (for summarization)

## Setup
```bash
npm install
# Start the backend
node server.js
# In a separate terminal, start the frontend
npm run dev

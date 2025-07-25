# Class Summary App

A web app that records classroom audio, transcribes it using OpenAI Whisper, and generates a summary using GPT for students who were absent.

## Stack
- Frontend: HTML + JS (Vite)
- Backend: Node.js (server.js)
- AI Services: OpenAI Whisper (for transcription) and GPT (for summarization)

## Environment Variables

Create a `.env` file in the project root with the following:

    OPENAI_API_KEY=your-api-key-here

Your API key must have access to both:
- Whisper (`whisper-1`) — for audio transcription
- a GPT model (`gpt-3.5-turbo`) — for summarization

You can generate or manage your API key at:  
[https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)

## Running locally

    npm install
    # Start the backend
    node server.js
    # In a separate terminal, start the frontend
    npm run dev
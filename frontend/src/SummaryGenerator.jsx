// SummaryGenerator.jsx
import React, { useState } from 'react';
import axios from 'axios';
import CategoryBreakdownChart from './CategoryBreakdownChart';
import CategoryTimeline from './CategoryTimeline';

const API_URL = import.meta.env.VITE_API_URL;

function SummaryGenerator() {
  const [transcript, setTranscript] = useState('');
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setTranscript('');
    setSummary(null);
    setProgress('Transcribing…');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const transcriptionRes = await axios.post(`${API_URL}/api/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const transcriptText = transcriptionRes.data.transcript;
      setTranscript(transcriptText);
      setProgress('Summarizing…');

      const summaryRes = await axios.post(`${API_URL}/api/summarize`, { transcript: transcriptText });
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Error during upload:', err);
      setTranscript('(error during transcription/summarization)');
    }

    setIsLoading(false);
    setProgress('');
  };

  const MAX_CHARS = 300;
  const shortTranscript = transcript.length > MAX_CHARS ? transcript.slice(0, MAX_CHARS) + '…' : transcript;

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>🎙️ Upload Class Audio</h2>
      <input type="file" accept="audio/*" onChange={handleFileUpload} />
      {isLoading && <p>⏳ {progress}</p>}
      {transcript && (
        <div style={{ marginTop: '1rem', border: '1px solid #ddd', padding: '1rem' }}>
          <h3>📝 Transcript</h3>
          <p>{showFullTranscript ? transcript : shortTranscript}</p>
          {transcript.length > MAX_CHARS && (
            <button onClick={() => setShowFullTranscript(!showFullTranscript)}>
              {showFullTranscript ? 'Hide Full Transcript' : 'See Full Transcript'}
            </button>
          )}
        </div>
      )}
      {summary && (
        <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>📚 What We Did Today</h2>

          <h3>📝 Class Summary</h3>
            {summary.class_summary}


          {/* Add this below the assignment section */}
          <CategoryBreakdownChart breakdown={summary.category_breakdown} />
          <CategoryTimeline timeline={summary.category_timeline} />

          <h3>Make-Up Assignment</h3>
          <ol>
            {summary.assignment_activities.map((item, idx) => <li key={idx}>{item}</li>)}
          </ol>


        </div>
      )}
    </div>
  );
}

export default SummaryGenerator;

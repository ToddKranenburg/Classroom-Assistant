import React, { useState } from 'react';
import axios from 'axios';

function SummaryGenerator() {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [file, setFile] = useState(null);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setIsLoading(true);
    setTranscript('');
    setSummary('');
    setProgress('Transcribing…');
    setFile(selectedFile);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const transcriptionRes = await axios.post('http://localhost:3001/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTranscript(transcriptionRes.data.transcript);
    } catch (err) {
      console.error('Error during transcription:', err);
      setTranscript('(error during transcription)');
    }

    setIsLoading(false);
    setProgress('');
  };

  const handleSummarize = async () => {
    if (!transcript) return;
    setIsLoading(true);
    setProgress('Summarizing…');

    try {
      const summaryRes = await axios.post('http://localhost:3001/api/summarize', { transcript });
      setSummary(summaryRes.data.summary);
    } catch (err) {
      console.error('Error during summarization:', err);
      setSummary('(error during summarization)');
    }

    setIsLoading(false);
    setProgress('');
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>🎙️ Upload Class Audio</h2>
      <input type="file" accept="audio/*" onChange={handleFileUpload} />
      {isLoading && <p>⏳ {progress}</p>}

      {transcript && (
        <div style={{ marginTop: '1rem', border: '1px solid #ddd', padding: '1rem' }}>
          <h3>📝 Transcript</h3>
          <p>{transcript}</p>
        </div>
      )}

      {transcript && !isLoading && (
        <button onClick={handleSummarize} style={{ marginTop: '1rem' }}>
          📋 Summarize
        </button>
      )}

      {summary && (
        <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
          <h3>📋 Summary</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default SummaryGenerator;

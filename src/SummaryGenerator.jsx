import React, { useState } from 'react';
import axios from 'axios';

function SummaryGenerator() {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('⚠️ File is too large! OpenAI Whisper API only supports files up to 25MB.');
      return;
    }

    setIsLoading(true);
    setTranscript('');
    setSummary('');
    setProgress('Transcribing…');

    try {
      const formData = new FormData();
      formData.append('file', file, file.name); // ✅ Correct field name and filename

      const transcriptionRes = await axios.post(
        'http://localhost:3001/api/transcribe',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const transcriptText = transcriptionRes.data.transcript;
      setTranscript(transcriptText);
      setProgress('Summarizing…');

      const summaryRes = await axios.post(
        'http://localhost:3001/api/summarize',
        { transcript: transcriptText }
      );

      setSummary(summaryRes.data.summary);
    } catch (err) {
      console.error('Error during upload:', err);
      setTranscript('(error during transcription/summarization)');
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

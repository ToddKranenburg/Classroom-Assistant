import React, { useState, useRef } from 'react';
import SummaryGenerator from './SummaryGenerator';

function App() {
  const [loadingExample, setLoadingExample] = useState(false);
  const exampleUploadRef = useRef(null);

  const handleLoadExample = async () => {
    setLoadingExample(true);
    try {
      // Fetch the example audio file from the public/src directory
      const response = await fetch('src/example-ela-audio.mp3');
      const blob = await response.blob();
      // Create a File object (name can be anything)
      const file = new File([blob], 'example-ela-audio.mp3', { type: blob.type });
      // Use the upload handler from SummaryGenerator
      if (exampleUploadRef.current) {
        await exampleUploadRef.current(file);
      }
    } catch (err) {
      alert('Failed to load example audio.');
    }
    setLoadingExample(false);
  };

  return (
    <div className="app">
      <h1>🎙️ Class Summary Generator</h1>
      <SummaryGenerator onExampleUpload={exampleUploadRef} />
      <button onClick={handleLoadExample} disabled={loadingExample} style={{ marginBottom: 16 }}>
        {loadingExample ? 'Loading Example...' : 'Try Example Audio'}
      </button>
      <footer>
        <p>
          🔒 No data is stored in our servers beyond runtime, but it is shared with OpenAI for transcription and summarization. Please be sure you comply with privacy laws when uploading audio.
        </p>
      </footer>
    </div>
  );
}

export default App;

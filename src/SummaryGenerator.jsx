import { useState } from 'react';

function SummaryGenerator() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);

    // TODO: Run local Whisper transcription + summarization here
    // Placeholder simulation
    setTimeout(() => {
      setSummary(
        `Today in class, we reviewed the water cycle and discussed student questions around evaporation. 
        A few students shared examples from their own experiences. 
        We clarified the difference between condensation and precipitation.`
      );
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileUpload} />
      {isLoading && <p>Processing audio…</p>}
      {summary && (
        <div className="summary-box">
          <h2>📝 Summary</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default SummaryGenerator;

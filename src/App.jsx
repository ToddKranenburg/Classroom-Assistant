import SummaryGenerator from './SummaryGenerator';

function App() {
  return (
    <div className="app">
      <h1>🎙️ Class Summary Generator</h1>
      <SummaryGenerator />
      <footer>
        <p>
          🔒 No data is stored in our servers beyond runtime, but it is shared with OpenAI for transcription and summarization. Please be sure you comply with privacy laws when uploading audio.
        </p>
      </footer>
    </div>
  );
}

export default App;

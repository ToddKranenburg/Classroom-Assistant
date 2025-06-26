import SummaryGenerator from './SummaryGenerator';

function App() {
  return (
    <div className="app">
      <h1>🎙️ Class Summary Generator</h1>
      <SummaryGenerator />
      <footer>
        <p>
          🔒 All processing happens locally. No audio or transcript is uploaded or stored.
        </p>
      </footer>
    </div>
  );
}

export default App;

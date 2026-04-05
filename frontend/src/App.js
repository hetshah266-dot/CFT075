import React, { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startAnalysis = async () => {
    if(!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/quiz?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if(data.success && data.quiz.length > 0) { 
        setQuestions(data.quiz); 
        setShowResult(false); 
      } else {
        setError("AI busy or no questions found. Try Demo Mode below.");
      }
    } catch(e) { 
      setError("Is main.py running in your terminal?"); 
    } finally { setLoading(false); }
  };

  const loadDemo = () => {
    setQuestions([{ question: "What is the team name?", answer: "Logical Legends", options: ["Logical Legends", "Alpha", "Beta", "Gamma"] }]);
    setShowResult(false);
  };

  const handleAnswer = (opt) => {
    if(opt === questions[current].answer) setScore(s => s + 1);
    if(current + 1 < questions.length) setCurrent(current + 1);
    else setShowResult(true);
  };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div style={ui.container}>
      <nav style={ui.nav}>
        <div style={ui.logo}>LOGICAL <span style={{color: '#00f2ff'}}>LEGENDS</span></div>
      </nav>

      <div style={ui.hero}>
        <h1 style={ui.title}>Master the Content.<br/><span style={ui.cyanText}>Understand the Why.</span></h1>

        <div style={ui.card}>
          {error && <div style={ui.error}>{error} <button onClick={loadDemo} style={ui.demoBtn}>Run Demo</button></div>}
          
          {showResult ? (
            <div style={{textAlign:'center'}}>
              <h2 style={ui.resHeader}>Quiz Complete!</h2>
              <div style={ui.bigScore}>{pct}%</div>
              <button onClick={() => window.location.reload()} style={ui.btn}>RESTART</button>
            </div>
          ) : questions.length === 0 ? (
            <div style={ui.inputGroup}>
              <input style={ui.input} value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste YouTube URL..." />
              <button onClick={startAnalysis} style={ui.btn}>{loading ? "PROCESSING..." : "GET ANALYSIS"}</button>
            </div>
          ) : (
            <div style={ui.quiz}>
              <p style={ui.qText}>{questions[current].question}</p>
              {questions[current].options.map(o => (
                <button key={o} onClick={() => handleAnswer(o)} style={ui.optBtn}>{o}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ui = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #003344 0%, #009999 50%, #00cc99 100%)', fontFamily: 'Arial', color: 'white' },
  nav: { padding: '30px 60px' },
  logo: { fontSize: '28px', fontWeight: '900' },
  hero: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' },
  title: { fontSize: '64px', fontWeight: '900', marginBottom: '30px', width: '85%' },
  cyanText: { color: '#00f2ff' },
  card: { width: '85%', maxWidth: '1000px', background: '#051937', padding: '50px', borderRadius: '4px', borderBottom: '8px solid #00f2ff' },
  inputGroup: { display: 'flex' },
  input: { flex: 1, padding: '20px', fontSize: '18px' },
  btn: { background: '#00ced1', color: 'white', border: 'none', padding: '0 40px', fontWeight: 'bold', cursor: 'pointer' },
  qText: { fontSize: '28px', marginBottom: '30px' },
  optBtn: { display: 'block', width: '100%', padding: '18px', margin: '10px 0', background: 'rgba(255,255,255,0.05)', color: 'white', textAlign: 'left', cursor: 'pointer' },
  bigScore: { fontSize: '160px', fontWeight: '900', color: '#00f2ff' },
  error: { background: '#d32f2f', padding: '15px', borderRadius: '4px', marginBottom: '15px' },
  demoBtn: { background: 'white', color: 'black', border: 'none', padding: '5px 10px', marginLeft: '10px', cursor: 'pointer' }
};

export default App; 
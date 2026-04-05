import React, { useState } from 'react';

function QuizApp() {
  const [url, setUrl] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  const startQuiz = async () => {
    if (!url) return alert("Please enter a YouTube URL");
    setLoading(true);
    setQuestions([]);
    
    try {
      // Connects to local Python server on port 8000
      const res = await fetch(`http://127.0.0.1:8000/quiz?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (data.success) {
        setQuestions(data.quiz);
        setCurrentIdx(0);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Could not connect to server. Ensure main.py is running!");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      alert("Quiz Finished!");
      setQuestions([]);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Arial' }}>
      <h1>YouTube Quiz Generator</h1>
      <input 
        type="text" 
        placeholder="Paste YouTube Link" 
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ padding: '10px', width: '400px' }}
      />
      <button 
        onClick={startQuiz} 
        disabled={loading}
        style={{ padding: '10px 20px', marginLeft: '10px' }}
      >
        {loading ? "AI is transcribing (may take 1 min)..." : "Generate 15 Questions"}
      </button>

      {questions.length > 0 && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc' }}>
          <h3>Question {currentIdx + 1} of {questions.length}</h3>
          <p>{questions[currentIdx].question}</p>
          <div>
            {questions[currentIdx].options.map(opt => (
              <button 
                key={opt} 
                onClick={() => alert(opt === questions[currentIdx].answer ? "Correct!" : "Wrong")}
                style={{ margin: '5px', padding: '5px 15px' }}
              >
                {opt}
              </button>
            ))}
          </div>
          <button onClick={handleNext} style={{ marginTop: '20px' }}>
            {currentIdx + 1 === questions.length ? "Finish" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizApp; 
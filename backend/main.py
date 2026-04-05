from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import yt_dlp, os, re, random, uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tiny model for fastest CPU performance
model = WhisperModel("tiny", device="cpu", compute_type="int8", cpu_threads=4)

@app.get("/quiz")
async def make_quiz(url: str = Query(...)):
    try:
        v_id = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})", url).group(1)
        
        # SPEED FIX: Only download 45 seconds for the demo
        opts = {
            'format': 'ba', 'outtmpl': v_id, 'quiet': True,
            'external_args': ['-ss', '00:00:00', '-t', '00:00:45'],
            'postprocessors': [{'key': 'FFmpegExtractAudio','preferredcodec': 'mp3'}]
        }
        
        with yt_dlp.YoutubeDL(opts) as ydl: 
            ydl.download([url])
        
        path = f"{v_id}.mp3"
        segs, _ = model.transcribe(path, vad_filter=True, beam_size=1)
        
        quiz = []
        for s in segs:
            txt = s.text.strip()
            if len(txt) < 40: continue
            words = [w for w in txt.split() if len(w) > 6]
            if not words: continue
            ans = random.choice(words)
            quiz.append({
                "question": txt.replace(ans, "_______"),
                "answer": ans,
                "options": list(set([ans, "Algorithm", "Variable", "Logic", "Protocol"]))[:4]
            })
            if len(quiz) >= 5: break 
            
        if os.path.exists(path): os.remove(path)
        return {"success": True, "quiz": quiz}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 
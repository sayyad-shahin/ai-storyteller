import { useState } from "react";
import { generateStory } from "../api/storyApi";

const GENRES = ["Fantasy","Sci-Fi","Mystery","Romance","Horror","Adventure","Thriller","Historical","General"];
const TONES  = ["Dark","Whimsical","Serious","Humorous","Romantic","Suspenseful","Inspiring","Melancholic"];

const IcoPen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
const IcoWand = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 4-1 1"/><path d="m9 20-1 1"/><path d="m4 9-1-1"/><path d="m20 15 1 1"/>
    <path d="m5 5 14 14"/><path d="M5 19 19 5"/>
  </svg>
);
const IcoAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default function StoryForm({ setStory, setStoryMeta, loading, setLoading }) {
  const [theme,  setTheme]  = useState("");
  const [tone,   setTone]   = useState("Whimsical");
  const [genre,  setGenre]  = useState("Fantasy");
  const [length, setLength] = useState(200);
  const [error,  setError]  = useState("");

  const pct = ((length - 50) / (1000 - 50)) * 100;

  const handleSubmit = async () => {
    if (!theme.trim()) { setError("Please enter a story theme."); return; }
    setError(""); setLoading(true); setStory(""); setStoryMeta(null);
    try {
      const data = await generateStory({ theme: theme.trim(), tone, genre, length });
      setStory(data.story);
      setStoryMeta({ theme: data.theme, tone: data.tone, genre: data.genre, wordCount: data.word_count });
    } catch (err) {
      setError(
        err.message?.includes("ERR_CONNECTION_REFUSED") || err.message?.includes("Network")
          ? "Backend not running. Open terminal → activate venv → run: uvicorn main:app --reload --port 8000"
          : err.message || "Story generation failed. Try again."
      );
    } finally { setLoading(false); }
  };

  return (
    <div className="card fade-up" style={{ animationDelay: ".1s" }}>
      <div className="card-header">
        <div className="card-icon"><IcoPen /></div>
        <h2 className="card-title">Craft Your Story</h2>
      </div>

      <div className="form-grid">

        {/* Theme */}
        <div className="form-group span2">
          <label className="form-label">Story Theme</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. A dragon afraid of fire who discovers a hidden power…"
            value={theme}
            onChange={e => setTheme(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && handleSubmit()}
            maxLength={150}
          />
        </div>

        {/* Genre */}
        <div className="form-group">
          <label className="form-label">Genre</label>
          <div className="select-wrap">
            <select className="form-select" value={genre} onChange={e => setGenre(e.target.value)}>
              {GENRES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Tone */}
        <div className="form-group">
          <label className="form-label">Tone</label>
          <div className="select-wrap">
            <select className="form-select" value={tone} onChange={e => setTone(e.target.value)}>
              {TONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Length */}
        <div className="form-group span2">
          <label className="form-label">Length</label>
          <div className="slider-wrap">
            <div className="slider-track">
              <div className="slider-fill" style={{ width: `${pct}%` }} />
              <div className="slider-thumb" style={{ left: `${pct}%` }} />
              <input
                className="slider-input"
                type="range"
                min={50} max={600} step={25}
                value={length}
                onChange={e => setLength(Number(e.target.value))}
              />
            </div>
            <div className="slider-labels">
              <span className="slider-val">{length} tokens</span>
              <span className="slider-hint">≈ {Math.round(length * 0.75)} words</span>
            </div>
          </div>
        </div>

      </div>

      <button className="btn-generate" onClick={handleSubmit} disabled={loading}>
        <span className="btn-inner">
          {loading
            ? <><div className="spinner" />Weaving your story…</>
            : <><IcoWand />Generate Story</>
          }
        </span>
      </button>

      {error && (
        <div className="error-bar">
          <IcoAlert />{error}
        </div>
      )}
    </div>
  );
}
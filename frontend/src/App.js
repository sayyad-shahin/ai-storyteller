import { useState } from "react";
import StoryForm from "./components/StoryForm";
import StoryDisplay from "./components/StoryDisplay";
import "./App.css";

function App() {
  const [story, setStory]       = useState("");
  const [storyMeta, setStoryMeta] = useState(null);
  const [loading, setLoading]   = useState(false);

  return (
    <div className="app-root">
      <div className="ambient">
        <div className="amb amb-1" />
        <div className="amb amb-2" />
      </div>

      <div className="shell">

        {/* ── NAVBAR ── */}
        <nav className="navbar">
          <div className="nav-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            StoryForge
          </div>
          <div className="nav-right">
            <div className="pill">
              <span className="dot" />
              AI Ready
            </div>
            <div className="badge">v2.0</div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <header className="hero fade-up">
          <div className="hero-eyebrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            GPT-2 Powered Story Generation
          </div>
          <h1 className="hero-h1">
            Every idea deserves<br />
            <em>an unforgettable story</em>
          </h1>
          <p className="hero-sub">
            Set your theme, pick your world — your narrative comes alive in seconds.
          </p>
          <div className="hero-tags">
            <span className="tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Fast Generation
            </span>
            <span className="tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              Voice Narration
            </span>
            <span className="tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              9 Genres
            </span>
            <span className="tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Story
            </span>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <main className="main">
          <StoryForm
            setStory={setStory}
            setStoryMeta={setStoryMeta}
            loading={loading}
            setLoading={setLoading}
          />
          <StoryDisplay story={story} meta={storyMeta} loading={loading} />
        </main>

        <footer className="footer">
          StoryForge v2.0 &nbsp;·&nbsp; GPT-2 Medium &nbsp;·&nbsp; FastAPI &nbsp;·&nbsp; React
        </footer>

      </div>
    </div>
  );
}

export default App;
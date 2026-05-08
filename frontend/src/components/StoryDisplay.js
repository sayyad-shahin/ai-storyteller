import { useState, useEffect, useRef } from "react";

/* ── Icons ── */
const IcoBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const IcoScroll = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
  </svg>
);
const IcoCopy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IcoCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcoDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IcoMic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const IcoStop = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);
const IcoRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const SKEL_WIDTHS = [100,88,95,72,90,65,82,78,94,60];

/* ── Clean text for TTS: remove special chars, fix spacing ── */
function cleanForSpeech(text) {
  return text
    .replace(/[\u2014\u2013]/g, ", ")   // em/en dash → pause
    .replace(/\.{2,}/g, ". ")           // ellipsis → pause
    .replace(/[*_~`#]/g, "")            // markdown
    .replace(/\s+/g, " ")               // extra spaces
    .trim();
}

/* ── Pick best available voice ── */
function pickVoice(voices) {
  const preferred = [
    "Google US English",
    "Google UK English Female",
    "Microsoft Aria Online",
    "Microsoft Jenny Online",
    "Samantha",
    "Karen",
    "Moira",
    "Daniel",
    "Google UK English Male",
  ];
  for (const name of preferred) {
    const match = voices.find(v => v.name === name);
    if (match) return match;
  }
  // fallback: first English voice
  return voices.find(v => v.lang.startsWith("en")) || voices[0] || null;
}

export default function StoryDisplay({ story, meta, loading }) {
  const [copied,   setCopied]   = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voiceErr, setVoiceErr] = useState("");
  const timerRef               = useRef(null);
  const startTimeRef           = useRef(null);
  const durationRef            = useRef(0);

  useEffect(() => { stopVoice(); }, [story]);
  useEffect(() => () => stopVoice(), []);

  function stopVoice() {
    try { window.speechSynthesis?.cancel(); } catch (_) {}
    clearInterval(timerRef.current);
    setSpeaking(false);
    setProgress(0);
    setVoiceErr("");
  }

  function handleVoice() {
    if (!story) return;
    if (!("speechSynthesis" in window)) {
      setVoiceErr("Your browser does not support voice. Try Chrome or Edge.");
      return;
    }
    if (speaking) { stopVoice(); return; }

    setVoiceErr("");

    // Voices may not be loaded yet — wait for them
    const trySpeak = () => {
      const voices  = window.speechSynthesis.getVoices();
      const voice   = pickVoice(voices);
      const cleaned = cleanForSpeech(story);

      // Split into paragraphs for more natural pauses
      const chunks  = cleaned.split(/\n+/).filter(Boolean);
      const fullText = chunks.join(" ... ");

      const utter      = new SpeechSynthesisUtterance(fullText);
      utter.rate        = 0.90;   // slightly slower = clearer
      utter.pitch       = 1.00;
      utter.volume      = 1.00;
      if (voice) utter.voice = voice;

      // Estimate duration: ~130 words/min at rate 0.9
      const wordCount   = fullText.split(/\s+/).length;
      const estMs       = (wordCount / (130 * 0.9)) * 60 * 1000;
      durationRef.current = estMs;

      utter.onstart = () => {
        setSpeaking(true);
        setProgress(0);
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
          const elapsed = Date.now() - startTimeRef.current;
          setProgress(Math.min((elapsed / durationRef.current) * 100, 98));
        }, 250);
      };

      utter.onend = () => {
        clearInterval(timerRef.current);
        setSpeaking(false);
        setProgress(100);
        setTimeout(() => setProgress(0), 1500);
      };

      utter.onerror = e => {
        clearInterval(timerRef.current);
        setSpeaking(false);
        setProgress(0);
        if (e.error !== "canceled") {
          setVoiceErr("Voice narration failed. Try a different browser.");
        }
      };

      window.speechSynthesis.cancel(); // clear queue
      window.speechSynthesis.speak(utter);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      trySpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => { trySpeak(); };
      // Trigger load
      window.speechSynthesis.getVoices();
    }
  }

  function handleCopy() {
    if (!story) return;
    navigator.clipboard.writeText(story).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  function handleDownload() {
    if (!story) return;
    const name = meta?.theme
      ? `${meta.theme.toLowerCase().replace(/\s+/g, "-")}.txt`
      : "storyforge.txt";
    const blob = new Blob([story], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Loading ── */
  if (loading) return (
    <div className="card fade-up" style={{ animationDelay: ".2s" }}>
      <div className="card-header">
        <div className="card-icon"><IcoBook /></div>
        <h2 className="card-title">Generating…</h2>
      </div>
      <div className="skel-wrap">
        {SKEL_WIDTHS.map((w, i) => (
          <div key={i} className="skel" style={{ width: `${w}%`, animationDelay: `${i * .06}s` }} />
        ))}
      </div>
    </div>
  );

  /* ── Empty ── */
  if (!story) return (
    <div className="card story-empty fade-up" style={{ animationDelay: ".2s" }}>
      <div className="empty-icon"><IcoScroll /></div>
      <p className="empty-title">Your story will appear here</p>
      <p className="empty-sub">Fill in the form above and click Generate Story</p>
    </div>
  );

  /* ── Story ── */
  return (
    <div className="card fade-up" style={{ animationDelay: ".2s" }}>
      <div className="card-header">
        <div className="card-icon"><IcoBook /></div>
        <h2 className="card-title">Generated Story</h2>
      </div>

      {meta && (
        <div className="story-meta">
          <span className="meta-chip">{meta.genre}</span>
          <span className="meta-chip">{meta.tone}</span>
          <span className="meta-chip dim">{meta.wordCount} words</span>
        </div>
      )}

      <div className="story-divider" />
      <p className="story-body">{story}</p>

      {/* Voice progress bar */}
      {speaking && (
        <div className="voice-bar">
          <div className="voice-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Voice error */}
      {voiceErr && (
        <div className="error-bar" style={{ marginTop: "12px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {voiceErr}
        </div>
      )}

      <div className="story-actions">
        {/* Voice */}
        <button
          className={`btn-action voice ${speaking ? "active" : ""}`}
          onClick={handleVoice}
          title={speaking ? "Stop narration" : "Read story aloud"}
        >
          {speaking ? <><IcoStop />Stop</> : <><IcoMic />Read Aloud</>}
        </button>

        {/* Copy */}
        <button className={`btn-action ${copied ? "copied" : ""}`} onClick={handleCopy}>
          {copied ? <><IcoCheck />Copied!</> : <><IcoCopy />Copy</>}
        </button>

        {/* Download */}
        <button className="btn-action download" onClick={handleDownload}>
          <IcoDown />Download
        </button>

        {/* New story */}
        <button
          className="btn-action new"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <IcoRefresh />New Story
        </button>
      </div>
    </div>
  );
}
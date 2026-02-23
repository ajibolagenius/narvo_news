import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// ===========================================
// LOADING SCREEN COMPONENT
// ===========================================
const LoadingScreen = ({ onComplete, duration = 3000 }) => {
  const [status, setStatus] = useState('Initializing Narrative Engine...');

  useEffect(() => {
    const statuses = [
      'Initializing Narrative Engine...',
      'Connecting to Broadcast Network...',
      'Loading Regional Voices...',
      'Calibrating Signal...',
      'System Ready'
    ];

    let currentIndex = 0;
    const statusInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % statuses.length;
      setStatus(statuses[currentIndex]);
    }, duration / statuses.length);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearInterval(statusInterval);
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  return (
    <div className="h-screen w-full flex flex-col justify-between relative overflow-hidden bg-background-dark" data-testid="loading-screen">
      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <div className="h-full w-full grid grid-cols-6 gap-0">
          {[...Array(6)].map((_, i) => <div key={i} className="border-r border-forest h-full" />)}
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <div className="h-full w-full grid grid-rows-6 gap-0">
          {[...Array(6)].map((_, i) => <div key={i} className="border-b border-forest w-full" />)}
        </div>
      </div>

      {/* Scanning Line */}
      <div className="scanning-line z-0" />

      {/* Header */}
      <header className="relative z-10 w-full p-6 flex justify-between items-start">
        <div className="mono-ui text-[10px] text-forest">
          <span className="block">NARVO_OS_BUILD</span>
          <span className="block opacity-60 mt-1">SECURE_CHANNEL // ENCRYPTED</span>
        </div>
        <div className="mono-ui text-[10px] text-right">
          <span className="block text-primary">SIGNAL_STATUS: OPTIMAL</span>
          <span className="block text-forest opacity-60 mt-1">LATENCY: 12MS</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center">
        <div className="relative">
          <h1 className="font-display text-8xl md:text-9xl font-bold tracking-tighter text-white mb-12">NARVO</h1>
          <div className="absolute -top-6 -right-10">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
        <div className="w-64 md:w-96 relative h-16 flex items-center justify-center">
          <div className="absolute w-full h-[1px] bg-forest breathing-grid" />
          <div className="absolute w-[1px] h-4 bg-forest left-0 top-1/2 -translate-y-1/2 opacity-50" />
          <div className="absolute w-[1px] h-4 bg-forest right-0 top-1/2 -translate-y-1/2 opacity-50" />
          <div className="absolute left-0 h-[3px] bg-primary loading-bar" style={{ width: '20%', boxShadow: '0 0 10px rgba(235, 213, 171, 0.4)' }} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-8 pb-12 flex flex-col items-center justify-end">
        <div className="mono-ui text-sm tracking-widest text-text-secondary uppercase">
          <span className="mr-2 text-primary">&gt;&gt;&gt;</span>
          <span className="blink-cursor">[{status}]</span>
        </div>
        <div className="mt-6 flex gap-1 items-end h-4">
          {[2, 3, 1, 4, 2, 1].map((h, i) => (
            <div key={i} className={`w-[2px] signal-bar ${i === 3 ? 'bg-primary' : 'bg-forest'}`} style={{ height: `${h * 4}px` }} />
          ))}
        </div>
      </footer>
    </div>
  );
};

// ===========================================
// AUDIO CONTEXT & PROVIDER
// ===========================================
const AudioContext = createContext();
export const useAudio = () => useContext(AudioContext);

const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.addEventListener('timeupdate', () => setProgress(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => { setDuration(audio.duration); setIsLoading(false); });
    audio.addEventListener('ended', () => { setIsPlaying(false); setProgress(0); });
    audio.addEventListener('error', () => { setIsLoading(false); setIsPlaying(false); });
    setAudioElement(audio);
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  const playTrack = async (track) => {
    if (!audioElement) return;
    setIsLoading(true);
    setCurrentTrack(track);
    if (track.audio_url) {
      audioElement.src = track.audio_url;
      await audioElement.play();
      setIsPlaying(true);
    } else {
      try {
        const response = await fetch(`${API_URL}/api/tts/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: track.narrative || track.summary || track.title, voice_id: track.voice_id || 'nova' })
        });
        if (response.ok) {
          const data = await response.json();
          audioElement.src = data.audio_url;
          await audioElement.play();
          setIsPlaying(true);
          track.audio_url = data.audio_url;
        }
      } catch (error) { console.error('TTS error:', error); setIsLoading(false); }
    }
  };

  const togglePlay = () => {
    if (!audioElement) return;
    if (isPlaying) audioElement.pause(); else audioElement.play();
    setIsPlaying(!isPlaying);
  };

  const seek = (time) => { if (audioElement) { audioElement.currentTime = time; setProgress(time); } };
  const setVolumeLevel = (level) => { setVolume(level); if (audioElement) audioElement.volume = level; };

  return (
    <AudioContext.Provider value={{ currentTrack, isPlaying, progress, duration, volume, isLoading, playTrack, togglePlay, seek, setVolumeLevel }}>
      {children}
    </AudioContext.Provider>
  );
};

// ===========================================
// CLOCK COMPONENT
// ===========================================
const Clock = () => {
  const [time, setTime] = useState('00:00:00');
  useEffect(() => {
    const update = () => setTime(new Date().toISOString().split('T')[1].split('.')[0]);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return <span>{time}</span>;
};

// ===========================================
// STRATEGIC LANDING PAGE
// ===========================================
const LandingPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=4`).then(res => res.json()).then(setNews).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex flex-col border-x border-forest max-w-[1440px] mx-auto relative bg-background-dark" data-testid="landing-page">
      {/* Header */}
      <header className="flex flex-col border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-forest" viewBox="0 0 256 256" fill="currentColor">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM168,128a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V88a8,8,0,0,1,16,0v32h24A8,8,0,0,1,168,128Z"/>
              </svg>
              <h1 className="font-display text-2xl font-bold tracking-tighter text-white">NARVO</h1>
            </div>
            <div className="hidden md:flex items-center gap-4 border-l border-forest pl-6 h-10">
              <span className="mono-ui text-[10px] text-forest">SYSTEM_STATUS:</span>
              <span className="mono-ui text-[10px] text-primary">BROADCAST_READY: 100%</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            <a className="mono-ui text-[11px] hover:text-primary transition-colors text-slate-400" href="#">ABOUT</a>
            <a className="mono-ui text-[11px] hover:text-primary transition-colors text-slate-400" href="#">WHY NARVO?</a>
            <a className="mono-ui text-[11px] hover:text-primary transition-colors text-slate-400" href="#">TECHNOLOGY</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="mono-ui text-[11px] bg-forest/20 px-3 py-1 border border-forest text-forest">
              UTC: <Clock />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-forest">
        {/* Left Panel */}
        <div className="lg:col-span-9 flex flex-col justify-center p-8 lg:p-16 border-r border-forest">
          <div className="mono-ui text-[12px] text-forest mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-forest block"></span>
            BROADCAST_INITIATED // VOICE-FIRST NEWS PLATFORM
          </div>
          <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tighter text-white mb-8">
            NARVO:<br />THE LOCAL PULSE, REFINED.
          </h1>
          <p className="text-lg lg:text-xl text-slate-400 max-w-xl mb-12">
            Engineered for total accessibility. Subscribed news, summarized and translated into your
            native tongue, delivered through an audio-first broadcast instrument.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="bg-primary text-background-dark font-display font-bold px-8 py-4 text-lg hover:bg-white transition-all"
              data-testid="start-broadcast-btn"
            >
              [Start Broadcast]
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="border border-forest text-forest font-display font-bold px-8 py-4 text-lg hover:bg-forest hover:text-white transition-all"
              data-testid="demo-btn"
            >
              [Oya, Play]
            </button>
          </div>

          {/* News Scroller */}
          <div className="mt-8 w-full border border-forest py-2 px-4 bg-forest/5 overflow-hidden">
            <div className="animate-marquee font-mono text-[14px] text-primary font-bold whitespace-nowrap">
              YORUBA: ÌRÒYÌN AYÉ - ỌJỌ́ AJÉ /// HAUSA: LABARAN DUNIYA - LITININ /// IGBO: AKUKO N'UWA - MANDA ///
              BREAKING: NAIROBI MARKET INDEX UP 2.4% /// LAGOS TECH SUMMIT ANNOUNCES NEW PARTNERSHIP ///
            </div>
          </div>
        </div>

        {/* Right Panel - Incoming Transmissions */}
        <div className="lg:col-span-3 bg-background-dark flex flex-col">
          <div className="h-12 border-b border-forest flex items-center px-4 justify-between bg-forest/5 shrink-0">
            <span className="mono-ui text-[10px] text-forest">INCOMING_TRANSMISSIONS</span>
            <svg className="w-5 h-5 text-forest" viewBox="0 0 256 256" fill="currentColor">
              <path d="M56,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM88,24a8,8,0,0,0-8,8V224a8,8,0,0,0,16,0V32A8,8,0,0,0,88,24Zm40,32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V64A8,8,0,0,0,128,56Zm40,32a8,8,0,0,0-8,8v64a8,8,0,0,0,16,0V96A8,8,0,0,0,168,88Zm40-16a8,8,0,0,0-8,8v96a8,8,0,0,0,16,0V80A8,8,0,0,0,208,72Z"/>
            </svg>
          </div>
          <div className="flex flex-col flex-1">
            {news.map((item, idx) => (
              <article
                key={item.id}
                className={`p-6 ${idx < news.length - 1 ? 'border-b border-forest' : ''} group cursor-pointer hover:bg-forest/10 transition-all flex-1 flex flex-col justify-center`}
                onClick={() => navigate(`/news/${item.id}`)}
                data-testid={`transmission-${idx}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="mono-ui text-[9px] text-primary border border-primary px-1">AUDIO</span>
                  <span className="mono-ui text-[9px] text-forest">
                    {item.truth_score ? `TRUTH_TAG: ${item.truth_score}%` : '04m 12s'}
                  </span>
                </div>
                <h3 className="font-display text-md font-bold leading-snug mb-2 group-hover:text-primary transition-colors text-white line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-1 h-3 bg-primary animate-pulse"></span>
                  <span className="mono-ui text-[8px] text-forest">[PROCESSING_PULSE]</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-forest">
        {[
          { num: '01', title: 'NATIVE TRANSLATION', desc: 'Summarized and translated into your mother tongue.', icon: 'translate' },
          { num: '02', title: 'AUDIO-FIRST', desc: 'Studio-quality regional voices tailored for your ride.', icon: 'waveform' },
          { num: '03', title: 'PRECISION GRID', desc: 'Swiss-engineered layout for high-density scanning.', icon: 'grid' },
          { num: '04', title: 'TRUTH PROTOCOL', desc: 'Transparent AI synthesis and verification tags.', icon: 'shield' },
        ].map((pillar, idx) => (
          <div
            key={idx}
            className={`p-8 ${idx < 3 ? 'border-r border-forest' : ''} ${idx % 2 === 0 ? 'bg-forest/5' : 'bg-background-dark'} h-64 flex flex-col justify-between group hover:bg-forest/10 transition-all`}
          >
            <span className="mono-ui text-[10px] text-forest">{pillar.num}. {pillar.title}</span>
            <h4 className="font-display text-xl text-white">{pillar.desc}</h4>
            <div className="flex justify-end">
              <div className="w-12 h-12 text-forest opacity-30 group-hover:opacity-60 transition-opacity" />
            </div>
          </div>
        ))}
      </section>

      {/* Technical Modules Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-forest">
        {[
          { id: '0x01', title: 'THE CONSOLE', desc: 'Your news dashboard is a precision workstation. Designed for commuters in Lagos, chefs in Owerri, and traders in Kano.', metric: '99.9%', label: 'UPTIME_PROTOCOL' },
          { id: '0x02', title: 'NATIVE VOICES', desc: 'Regional accents (Yoruba, Hausa, Pidgin, Igbo, etc.) synthesized with zero fidelity loss and natural rhythmic flow.', metric: '1,420', label: 'VOICE_NODES' },
          { id: '0x03', title: 'TRUTH TAG', desc: 'Total transparency. Drill into any broadcast to see the original source, translation logic, and verification score.', metric: '0.8s', label: 'FACT_LATENCY' },
        ].map((mod, idx) => (
          <div key={idx} className={`p-8 ${idx < 2 ? 'border-r border-forest' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <p className="mono-ui text-[10px] text-forest">MOD_ID: {mod.id}</p>
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 uppercase text-white">{mod.title}</h3>
            <p className="text-slate-400 text-sm mb-6">{mod.desc}</p>
            <div className="border-t border-forest pt-4 flex justify-between items-center">
              <span className="mono-ui text-[10px] text-forest">{mod.label}</span>
              <span className="mono-ui text-[14px] text-primary">{mod.metric}</span>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-forest">
        <div className="p-8 lg:p-16 border-r border-forest bg-forest/5 flex flex-col justify-center">
          <h2 className="font-display text-4xl font-bold mb-8 text-white">SYSTEM_CORE // LINGUISTIC ACCESSIBILITY</h2>
          <div className="space-y-4">
            {[
              { num: '01', title: 'RSS_SUMMARIZATION', desc: 'Multi-source ingestion filtered per user subscription.' },
              { num: '02', title: 'NATIVE_TRANSLATION', desc: 'Real-time localized translation into regional dialects.' },
              { num: '03', title: 'AUDIO_SYNTHESIS', desc: 'ElevenLabs powered high-fidelity voice delivery.' },
            ].map((step, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-forest bg-background-dark">
                <div className="w-10 h-10 flex items-center justify-center border border-forest text-primary font-mono text-xs shrink-0">
                  {step.num}
                </div>
                <div>
                  <h4 className="mono-ui text-sm text-white mb-1">{step.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="p-8 flex-1 border-b border-forest flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <svg className="w-6 h-6 text-forest" viewBox="0 0 256 256" fill="currentColor">
                <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z"/>
              </svg>
              <h4 className="mono-ui text-lg text-white">Broadcast_Control_Unit</h4>
            </div>
            {/* Visual Bars */}
            <div className="aspect-video w-full bg-forest/10 border border-forest relative overflow-hidden flex items-end p-8 gap-1">
              {[25, 50, 75, 66, 100, 33, 50].map((h, i) => (
                <div key={i} className={`flex-1 ${i % 2 === 1 ? 'bg-primary' : 'bg-forest/40'} ${i === 3 ? 'animate-pulse' : ''}`} style={{ height: `${h}%` }} />
              ))}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="mono-ui text-primary text-[10px] bg-background-dark px-4 py-2 border border-forest">SIGNAL_OPTIMIZED</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-primary/10 flex items-center justify-between">
            <div>
              <h5 className="mono-ui text-xs text-forest mb-1">INITIATE CONNECTION</h5>
              <p className="font-display font-bold text-xl text-primary uppercase">Join the Broadcast Generation.</p>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="bg-primary text-background-dark font-display font-bold px-8 py-4 hover:bg-white transition-all"
              data-testid="start-listening-btn"
            >
              [Start Listening]
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto grid grid-cols-1 md:grid-cols-4 border-t border-forest bg-background-dark">
        <div className="p-6 border-r border-forest flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-8 text-white">
            <svg className="w-6 h-6 text-forest" viewBox="0 0 256 256" fill="currentColor">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/>
            </svg>
            <span className="font-display font-bold text-white tracking-tighter">NARVO</span>
          </div>
          <p className="mono-ui text-[9px] text-forest">V.2.5.0_STABLE_BUILD<br />©2026 NARVO</p>
        </div>

        <div className="p-6 border-r border-forest">
          <h6 className="mono-ui text-[10px] text-forest mb-4">SYSTEM_LINKS</h6>
          <ul className="space-y-2">
            <li><a className="mono-ui text-[11px] text-slate-400 hover:text-primary transition-colors" href="#">STATION_MAP</a></li>
            <li><a className="mono-ui text-[11px] text-slate-400 hover:text-primary transition-colors" href="#">CORE_RAG_PROTOCOLS</a></li>
            <li><a className="mono-ui text-[11px] text-slate-400 hover:text-primary transition-colors" href="#">VOICE_MATRIX</a></li>
          </ul>
        </div>

        <div className="p-6 border-r border-forest">
          <h6 className="mono-ui text-[10px] text-forest mb-4">PROTOCOL_STATUS</h6>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-forest" />
            <span className="mono-ui text-[10px] text-slate-400">TRANSLATION: V.2.1</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-primary animate-pulse" />
            <span className="mono-ui text-[10px] text-slate-400">ENCRYPTION: AES_X</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-forest" />
            <span className="mono-ui text-[10px] text-slate-400">SYNTHESIS: OPTIMIZED</span>
          </div>
        </div>

        <div className="p-6 flex flex-col justify-between">
          <h6 className="mono-ui text-[10px] text-forest mb-4">CONNECT_SYSTEM</h6>
          <div className="flex gap-4 text-forest">
            <a className="hover:text-primary transition-colors" href="#">
              <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
                <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68Z"/>
              </svg>
            </a>
          </div>
          <p className="mono-ui text-[9px] text-forest mt-4">LOG_STAMP: 2026.02.23</p>
        </div>
      </footer>
    </div>
  );
};

// ===========================================
// AUTH PAGE - Secure Access Center
// ===========================================
const AuthPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = { email, name: email.split('@')[0] };
    localStorage.setItem('narvo_user', JSON.stringify(user));
    navigate('/onboarding');
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-background-dark" data-testid="auth-page">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-forest bg-background-dark z-10 shrink-0">
        <div className="flex items-center gap-4">
          <svg className="w-6 h-6 text-primary" viewBox="0 0 256 256" fill="currentColor">
            <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,160H48V56H208V200ZM64,96a8,8,0,0,1,8-8H184a8,8,0,0,1,0,16H72A8,8,0,0,1,64,96Zm0,32a8,8,0,0,1,8-8H184a8,8,0,0,1,0,16H72A8,8,0,0,1,64,128Zm0,32a8,8,0,0,1,8-8h72a8,8,0,0,1,0,16H72A8,8,0,0,1,64,160Z"/>
          </svg>
          <div className="font-display text-xl tracking-tight font-bold uppercase text-white">
            NARVO <span className="text-forest font-light mx-2">//</span> ACCESS_CENTER
          </div>
          <div className="h-4 w-[1px] bg-forest mx-2" />
          <div className="mono-ui text-[10px] text-forest">V.2.5.0_STABLE</div>
        </div>
        <div className="flex items-center gap-8 mono-ui text-[10px] text-forest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            <span>SECURE_CONNECTION: ACTIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span>UTC <Clock /></span>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 h-full">
        {/* Left Sidebar */}
        <div className="hidden lg:block lg:col-span-3 border-r border-forest h-full relative">
          <div className="absolute inset-0 grid grid-rows-6">
            <div className="border-b border-forest p-6 flex flex-col justify-end">
              <span className="mono-ui text-[9px] text-forest block mb-1">NODE_ID</span>
              <span className="mono-ui text-[10px] text-white">NRV-LGS-X1</span>
            </div>
            <div className="border-b border-forest p-6 flex flex-col justify-end">
              <span className="mono-ui text-[9px] text-forest block mb-1">ENCRYPTION</span>
              <span className="mono-ui text-[10px] text-primary">AES-256-GCM</span>
            </div>
            <div className="border-b border-forest" />
            <div className="border-b border-forest" />
            <div className="border-b border-forest" />
            <div className="p-6 flex items-end">
              <span className="mono-ui text-[9px] text-forest animate-pulse">AWAITING_INPUT_SIGNAL...</span>
            </div>
          </div>
        </div>

        {/* Center - Auth Form */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-center items-center relative p-6">
          {/* Grid overlay */}
          <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-5">
            {[...Array(4)].map((_, i) => <div key={i} className="border-r border-forest h-full" />)}
          </div>

          <div className="w-full max-w-md z-10 relative">
            {/* Header */}
            <div className="border border-forest bg-background-dark mb-[-1px]">
              <div className="p-4 flex justify-between items-center border-b border-forest">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white">Initialize Session</h2>
                <svg className="w-6 h-6 text-primary" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M184,128a56,56,0,1,1-56-56A56,56,0,0,1,184,128Z"/>
                </svg>
              </div>
              <div className="h-1 w-full bg-surface overflow-hidden border-b border-forest">
                <div className="h-full w-1/3 bg-primary" />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="border border-forest border-t-0 bg-surface/50 p-8 flex flex-col gap-6">
              <div className="group relative">
                <label className="mono-ui text-[10px] text-forest mb-2 block font-bold">Operator Credential</label>
                <div className="flex items-center border border-forest bg-background-dark h-12 px-4 focus-within:border-primary transition-all">
                  <svg className="w-5 h-5 text-forest mr-3" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M200,112H184V88a56,56,0,0,0-112,0v24H56a8,8,0,0,0-8,8v80a8,8,0,0,0,8,8H200a8,8,0,0,0,8-8V120A8,8,0,0,0,200,112Z"/>
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white mono-ui text-sm"
                    placeholder="ID-XXXX-XXXX"
                    required
                    data-testid="email-input"
                  />
                  <div className="w-1.5 h-1.5 bg-forest opacity-30" />
                </div>
              </div>

              <div className="group relative">
                <div className="flex justify-between mb-2">
                  <label className="mono-ui text-[10px] text-forest font-bold">Access Code</label>
                  <a className="mono-ui text-[9px] text-primary hover:underline" href="#">[Recover_Key]</a>
                </div>
                <div className="flex items-center border border-forest bg-background-dark h-12 px-4 focus-within:border-primary transition-all">
                  <svg className="w-5 h-5 text-forest mr-3" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M216.57,39.43A80,80,0,0,0,83.91,120.78L28.69,176A15.86,15.86,0,0,0,24,187.31V216a16,16,0,0,0,16,16H72a8,8,0,0,0,8-8V208H96a8,8,0,0,0,8-8V184h16a8,8,0,0,0,5.66-2.34l9.56-9.57A80,80,0,0,0,216.57,39.43Z"/>
                  </svg>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white mono-ui text-sm"
                    placeholder="••••••••••••"
                    required
                    data-testid="password-input"
                  />
                  <div className="w-1.5 h-1.5 bg-forest opacity-30" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-14 bg-primary text-background-dark font-display font-bold uppercase tracking-tighter text-lg hover:bg-white transition-all flex items-center justify-between px-6 mt-2 group"
                data-testid="auth-submit-btn"
              >
                <span>Initiate Sync</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
                </svg>
              </button>
            </form>

            {/* Footer Metrics */}
            <div className="grid grid-cols-2 border border-forest border-t-0 bg-background-dark">
              <div className="p-4 border-r border-forest flex items-center gap-3">
                <svg className="w-5 h-5 text-forest" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8Z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="mono-ui text-[9px] text-forest">AUTHENTICATION</span>
                  <span className="mono-ui text-[10px] text-white">Biometric_Ready</span>
                </div>
              </div>
              <div className="p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-forest" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="mono-ui text-[9px] text-forest">PROTOCOL</span>
                  <span className="mono-ui text-[10px] text-white">2FA_ENFORCED</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="mono-ui text-[9px] text-forest leading-relaxed">
                Authorized Access Only. Internal Signal NRV-00-1.<br />
                Clearance Level: [LEVEL_4_BROADCAST]
              </p>
            </div>

            <Link to="/" className="block text-center mono-ui text-[10px] text-forest mt-6 hover:text-primary">
              ← [BACK_TO_LANDING]
            </Link>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-3 border-l border-forest h-full relative">
          <div className="absolute inset-0 grid grid-rows-6">
            <div className="border-b border-forest p-6 flex justify-end items-end">
              <span className="mono-ui text-[10px] text-forest">SECURE_HANDSHAKE: <span className="text-primary">PASS</span></span>
            </div>
            <div className="border-b border-forest p-6 flex flex-col justify-end items-end gap-1">
              <div className="h-[1px] w-12 bg-forest" />
              <div className="h-[1px] w-8 bg-forest opacity-50" />
              <div className="h-[1px] w-4 bg-forest opacity-30" />
            </div>
            <div className="border-b border-forest" />
            <div className="border-b border-forest" />
            <div className="border-b border-forest" />
            <div className="p-6 flex flex-col justify-end items-end text-right">
              <span className="mono-ui text-[9px] text-forest uppercase">Node_Location</span>
              <span className="mono-ui text-[10px] text-white">6.5244° N, 3.3792° E</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-forest bg-surface/30 flex items-center justify-between px-8 text-forest mono-ui text-[9px] z-10 shrink-0">
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors pr-6 border-r border-forest/30">HELP_TERMINAL</a>
          <a href="#" className="hover:text-primary transition-colors">PRIVACY_PROTOCOL_2026</a>
        </div>
        <div className="flex items-center gap-2">
          <span>SYSTEM_STORAGE: 84% READ_ONLY</span>
        </div>
      </footer>
    </div>
  );
};

// ===========================================
// ONBOARDING PAGE - Multi-Panel Setup
// ===========================================
const OnboardingPage = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('lagos');
  const [selectedVoice, setSelectedVoice] = useState('pidgin');
  const [selectedInterests, setSelectedInterests] = useState(['politics', 'sports', 'afrobeats']);

  const regions = [
    { id: 'lagos', name: 'Lagos / West Africa', tz: 'UTC+1', country: 'NIGERIA' },
    { id: 'nairobi', name: 'Nairobi / East Africa', tz: 'UTC+3', country: 'KENYA' },
    { id: 'johannesburg', name: 'Johannesburg / South', tz: 'UTC+2', country: 'SOUTH AFRICA' },
    { id: 'accra', name: 'Accra / West Africa', tz: 'UTC+0', country: 'GHANA' },
  ];

  const voices = [
    { id: 'pidgin', name: 'Pidgin // Sabi-Work Node', desc: 'Metropolitan rhythm, dialectal precision, zero-loss fidelity.' },
    { id: 'yoruba', name: 'Yoruba // Tonal-Pulse', desc: 'Strict tonal accuracy, broadcast-grade regional nuance.' },
    { id: 'igbo', name: 'Igbo // Core-Flow', desc: 'Rhythmic regional accent, synthesized with natural cadence.' },
  ];

  const interests = [
    { id: 'politics', name: 'Politics' },
    { id: 'tech', name: 'Tech' },
    { id: 'sports', name: 'Sports' },
    { id: 'finance', name: 'Finance' },
    { id: 'afrobeats', name: 'Afrobeats' },
    { id: 'culture', name: 'Culture' },
  ];

  const toggleInterest = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    const preferences = { region: selectedRegion, voice: selectedVoice, interests: selectedInterests };
    localStorage.setItem('narvo_preferences', JSON.stringify(preferences));
    navigate('/dashboard');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background-dark" data-testid="onboarding-page">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-forest bg-background-dark z-10">
        <div className="flex items-center gap-4">
          <svg className="w-6 h-6 text-primary" viewBox="0 0 256 256" fill="currentColor">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/>
          </svg>
          <h1 className="font-display text-xl tracking-tight font-bold text-white uppercase">
            NARVO <span className="text-forest font-light mx-2">//</span> SETUP_CONSOLE
          </h1>
        </div>
        <div className="mono-ui text-[10px] text-forest">
          SYSTEM_ACCESS_ID: <span className="text-primary">009-AF-X</span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 h-full overflow-hidden">
        {/* Section 01: Region */}
        <section className="col-span-12 md:col-span-3 border-r border-forest h-full flex flex-col bg-background-dark">
          <div className="p-6 border-b border-forest">
            <span className="mono-ui text-[10px] text-forest block mb-2">P-01 // LOCALE_MATRIX</span>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white">Regional Node</h2>
            <p className="text-forest text-xs mt-2 leading-relaxed font-mono">Select production node for regional news calibration.</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ul className="flex flex-col">
              {regions.map((region) => (
                <li key={region.id} className="border-b border-forest">
                  <label
                    className={`cursor-pointer group flex items-center justify-between p-5 transition-colors ${
                      selectedRegion === region.id ? 'bg-primary text-background-dark' : 'hover:bg-forest/10'
                    }`}
                    data-testid={`region-${region.id}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-display text-lg font-bold uppercase">{region.name}</span>
                      <span className={`mono-ui text-[10px] ${selectedRegion === region.id ? 'opacity-80' : 'text-forest'}`}>
                        {region.tz} • {region.country}
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="region"
                      checked={selectedRegion === region.id}
                      onChange={() => setSelectedRegion(region.id)}
                      className="hidden"
                    />
                    {selectedRegion === region.id && (
                      <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                      </svg>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-surface border-t border-forest">
            <div className="flex justify-between items-center text-forest text-[10px] mono-ui">
              <span>SIGNAL_QUALITY</span>
              <span className="text-primary">98.4%</span>
            </div>
            <div className="w-full bg-background-dark h-1 mt-2 border border-forest">
              <div className="h-full w-[98%] bg-primary" />
            </div>
          </div>
        </section>

        {/* Section 02: Voice */}
        <section className="col-span-12 md:col-span-4 border-r border-forest h-full flex flex-col bg-background-dark">
          <div className="p-6 border-b border-forest">
            <span className="mono-ui text-[10px] text-forest block mb-2">P-02 // VOICE_SYNTHESIS_ENGINE</span>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white">Vocal Matrix</h2>
            <p className="text-forest text-xs mt-2 leading-relaxed font-mono">Calibrate the regional synthesis engine for high-fidelity audio delivery.</p>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {voices.map((voice) => (
              <div key={voice.id} className="relative group">
                <input
                  type="radio"
                  id={voice.id}
                  name="voice"
                  checked={selectedVoice === voice.id}
                  onChange={() => setSelectedVoice(voice.id)}
                  className="peer hidden"
                />
                <label
                  htmlFor={voice.id}
                  className={`block border p-5 cursor-pointer transition-all ${
                    selectedVoice === voice.id
                      ? 'bg-primary text-background-dark border-primary'
                      : 'border-forest hover:border-primary'
                  }`}
                  data-testid={`voice-${voice.id}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-display text-lg font-bold uppercase">{voice.name}</span>
                    <svg className={`w-5 h-5 ${selectedVoice !== voice.id ? 'opacity-40' : ''}`} viewBox="0 0 256 256" fill="currentColor">
                      <path d="M56,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM88,24a8,8,0,0,0-8,8V224a8,8,0,0,0,16,0V32A8,8,0,0,0,88,24Zm40,32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V64A8,8,0,0,0,128,56Z"/>
                    </svg>
                  </div>
                  <p className="mono-ui text-[10px] opacity-70 mb-4">{voice.desc}</p>
                  <div className="flex items-center gap-2 text-[10px] mono-ui font-bold">
                    <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
                      <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/>
                    </svg>
                    <span>AUDITION_MODE</span>
                  </div>
                </label>
              </div>
            ))}
          </div>
          <div className="h-20 border-t border-forest flex items-center justify-center relative overflow-hidden bg-surface">
            <div className="absolute inset-0 flex items-center justify-center gap-[3px] opacity-30">
              {[4, 8, 12, 6, 16, 8, 12, 4].map((h, i) => (
                <div key={i} className={`w-1 bg-forest ${i === 4 ? 'bg-primary animate-pulse' : ''}`} style={{ height: `${h}px` }} />
              ))}
            </div>
            <span className="relative z-10 mono-ui text-[9px] text-forest bg-surface px-2">SIGNAL_ANALYZER // STANDBY</span>
          </div>
        </section>

        {/* Section 03: Interests */}
        <section className="col-span-12 md:col-span-5 h-full flex flex-col bg-background-dark">
          <div className="p-6 border-b border-forest">
            <span className="mono-ui text-[10px] text-forest block mb-2">P-03 // NARRATIVE_CALIBRATION</span>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white">Interest Matrix</h2>
            <p className="text-forest text-xs mt-2 leading-relaxed font-mono">Map your cognitive interest grid for precise news delivery.</p>
          </div>
          <div className="flex-1 p-6 flex flex-col">
            <div className="grid grid-cols-3 gap-[1px] border border-forest bg-forest">
              {interests.map((interest, idx) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <label
                    key={interest.id}
                    className={`cursor-pointer group relative h-28 flex flex-col justify-between p-3 transition-colors ${
                      isSelected ? 'bg-primary text-background-dark' : 'bg-background-dark hover:bg-forest/10 text-white'
                    }`}
                    data-testid={`interest-${interest.id}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleInterest(interest.id)}
                      className="hidden"
                    />
                    <div className="flex justify-between items-start">
                      <span className={`mono-ui text-[9px] ${isSelected ? '' : 'text-forest'}`}>{String(idx + 1).padStart(2, '0')}</span>
                      {isSelected && (
                        <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
                          <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM181.66,109.66l-72,72a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L104,164.69l66.34-66.35a8,8,0,0,1,11.32,11.32Z"/>
                        </svg>
                      )}
                    </div>
                    <span className={`font-display text-lg font-bold uppercase leading-none ${!isSelected ? 'group-hover:text-primary' : ''}`}>
                      {interest.name}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-auto pt-8">
              <div className="flex justify-between items-center mb-4">
                <span className="mono-ui text-[10px] text-forest">SYSTEM_STATUS: <span className="text-primary">INITIAL_LINK_READY</span></span>
                <span className="mono-ui text-[10px] text-forest">CALIBRATION_PROGRESS: {Math.round((selectedInterests.length / interests.length) * 100)}%</span>
              </div>
              <button
                onClick={handleComplete}
                className="w-full bg-primary text-background-dark font-display font-bold text-lg py-5 hover:bg-white active:bg-primary/80 transition-all flex items-center justify-center gap-3"
                data-testid="complete-onboarding-btn"
              >
                <span className="uppercase tracking-tighter">Initialize Narrative Feed</span>
                <svg className="w-6 h-6" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// ===========================================
// DASHBOARD PAGE
// ===========================================
const DashboardPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying, isLoading: audioLoading } = useAudio();
  const user = JSON.parse(localStorage.getItem('narvo_user') || '{}');

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=10`)
      .then(res => res.json())
      .then(data => { setNews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background-dark" data-testid="dashboard-page">
      {/* Header */}
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <svg className="w-6 h-6 text-primary" viewBox="0 0 256 256" fill="currentColor">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/>
            </svg>
            <span className="font-display text-lg font-bold text-white">NARVO</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="mono-ui text-[10px] text-forest">
              STATUS: <span className="text-primary">ONLINE</span>
            </span>
            <Link to="/search">
              <svg className="w-5 h-5 text-forest hover:text-primary" viewBox="0 0 256 256" fill="currentColor">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32Z"/>
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-forest min-h-screen hidden lg:block">
          <nav className="p-4">
            <span className="mono-ui text-[10px] text-forest block mb-4">NAVIGATION</span>
            
            <Link to="/briefing" className="flex items-center gap-3 p-3 border border-primary bg-primary/10 mb-2" data-testid="nav-briefing">
              <svg className="w-4 h-4 text-primary" viewBox="0 0 256 256" fill="currentColor">
                <path d="M80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,120,64Z"/>
              </svg>
              <span className="mono-ui text-xs text-primary">Morning Briefing</span>
            </Link>
            
            <Link to="/dashboard" className="flex items-center gap-3 p-3 border border-forest mb-2">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 256 256" fill="currentColor">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Z"/>
              </svg>
              <span className="mono-ui text-xs text-forest">Primary Stream</span>
            </Link>
            
            <Link to="/voices" className="flex items-center gap-3 p-3 border border-forest mb-2">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 256 256" fill="currentColor">
                <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176Z"/>
              </svg>
              <span className="mono-ui text-xs text-forest">Voice Studio</span>
            </Link>
            
            <Link to="/settings" className="flex items-center gap-3 p-3 border border-forest">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 256 256" fill="currentColor">
                <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Z"/>
              </svg>
              <span className="mono-ui text-xs text-forest">Settings</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl text-white mb-1">[Live Feed]</h2>
              <span className="mono-ui text-[10px] text-text-secondary">Welcome, Oga {user.name || 'Guest'}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="flex items-end gap-1 h-8 justify-center mb-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="w-2 bg-forest breathing-grid" style={{ height: `${Math.random() * 80 + 20}%` }} />
                  ))}
                </div>
                <span className="mono-ui text-xs text-text-secondary">[PROCESSING SIGNAL...]</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4" data-testid="news-feed">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="border border-forest bg-surface p-6 hover:border-text-secondary cursor-pointer transition-colors"
                  onClick={() => navigate(`/news/${item.id}`)}
                  data-testid={`news-card-${item.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="mono-ui text-[9px] text-primary border border-primary px-1">{item.category?.toUpperCase()}</span>
                    <span className="mono-ui text-[10px] text-forest">{item.source}</span>
                  </div>
                  
                  <h3 className="font-display text-lg text-white mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.summary}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {item.tags?.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="mono-ui text-[9px] text-forest border border-forest px-1">{tag}</span>
                      ))}
                    </div>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); playTrack(item); }}
                      className="bg-primary text-background-dark font-display font-bold px-4 py-2 text-xs hover:bg-white transition-all flex items-center gap-2"
                      disabled={audioLoading && currentTrack?.id === item.id}
                      data-testid={`play-btn-${item.id}`}
                    >
                      {currentTrack?.id === item.id && isPlaying ? '[PAUSE]' : '[LISTEN]'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ===========================================
// PLACEHOLDER PAGES
// ===========================================
const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  useEffect(() => {
    fetch(`${API_URL}/api/news/${id}`).then(res => res.json()).then(setNews).catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  if (!news) return <LoadingScreen duration={2000} />;

  return (
    <div className="min-h-screen bg-background-dark" data-testid="news-detail-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-forest hover:text-primary">← [BACK]</button>
          <span className="mono-ui text-[10px] text-forest">[TRUTH TAG: <span className="text-primary">{news.truth_score}%</span>]</span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6">
        <span className="mono-ui text-[9px] text-primary border border-primary px-1 mb-4 inline-block">{news.category?.toUpperCase()}</span>
        <h1 className="font-display text-3xl text-white mb-6">{news.title}</h1>
        <div className="border border-forest bg-surface p-6 mb-8">
          <button onClick={() => playTrack(news)} className="bg-primary text-background-dark font-display font-bold px-6 py-3 hover:bg-white transition-all flex items-center gap-2">
            {currentTrack?.id === news.id && isPlaying ? '[PAUSE BROADCAST]' : '[OYA, PLAY]'}
          </button>
        </div>
        <div className="border border-forest bg-surface p-6">
          <h3 className="font-display text-lg text-white mb-4">[The Full Gist]</h3>
          <p className="text-slate-400 leading-relaxed">{news.narrative || news.summary}</p>
        </div>
      </div>
    </div>
  );
};

const VoiceStudioPage = () => {
  const navigate = useNavigate();
  const [voices, setVoices] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/voices`).then(res => res.json()).then(data => { setVoices(data); setSelected(data[0]); });
  }, []);

  return (
    <div className="min-h-screen bg-background-dark" data-testid="voice-studio-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-forest hover:text-primary">← [BACK]</button>
          <span className="font-display text-lg text-white">[Regional Voice Studio]</span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {voices.map((voice) => (
            <div
              key={voice.id}
              className={`border p-6 cursor-pointer transition-all ${selected?.id === voice.id ? 'bg-primary text-background-dark border-primary' : 'border-forest hover:border-primary'}`}
              onClick={() => setSelected(voice)}
            >
              <h3 className="font-display text-lg font-bold uppercase mb-1">{voice.name}</h3>
              <span className="mono-ui text-[10px] opacity-70">{voice.accent}</span>
              <p className="text-sm mt-3 opacity-80">{voice.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MorningBriefingPage = () => {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const generateBriefing = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/briefing/generate?voice_id=nova`);
      if (response.ok) setBriefing(await response.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { generateBriefing(); }, []);

  return (
    <div className="min-h-screen bg-background-dark" data-testid="briefing-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-forest hover:text-primary">← [BACK]</button>
          <span className="font-display text-lg text-white">[Morning Briefing]</span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-20">
            <span className="mono-ui text-xs text-text-secondary">[GENERATING BRIEFING...]</span>
          </div>
        ) : briefing ? (
          <>
            <div className="border border-forest bg-surface p-6 mb-6">
              <h2 className="font-display text-xl text-white mb-2">{briefing.title}</h2>
              <span className="mono-ui text-[9px] text-forest border border-forest px-1">{briefing.duration_estimate}</span>
              <button
                onClick={() => playTrack({ id: briefing.id, title: briefing.title, audio_url: briefing.audio_url })}
                className="bg-primary text-background-dark font-display font-bold px-6 py-3 hover:bg-white transition-all mt-4 block"
              >
                {currentTrack?.id === briefing.id && isPlaying ? '[PAUSE]' : '[PLAY BRIEFING]'}
              </button>
            </div>
            <div className="border border-forest bg-surface p-6">
              <h3 className="font-display text-lg text-white mb-4">Stories Included</h3>
              {briefing.stories?.map((story, i) => (
                <div key={i} className="border border-forest p-4 mb-2 flex gap-3">
                  <span className="mono-ui text-[10px] text-primary">{i + 1}.</span>
                  <span className="text-slate-400 text-sm">{story.title}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <button onClick={generateBriefing} className="bg-primary text-background-dark font-display font-bold px-6 py-3 hover:bg-white transition-all">
            [GENERATE BRIEFING]
          </button>
        )}
      </div>
    </div>
  );
};

const SearchPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background-dark" data-testid="search-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-forest hover:text-primary">← [BACK]</button>
          <span className="font-display text-lg text-white">[Search Center]</span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6">
        <input type="text" placeholder="Search news..." className="w-full bg-surface border border-forest text-white p-4 mono-ui" />
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background-dark" data-testid="settings-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-forest hover:text-primary">← [BACK]</button>
          <span className="font-display text-lg text-white">[System Settings]</span>
        </div>
      </header>
      <div className="max-w-2xl mx-auto p-6">
        <div className="border border-forest bg-surface p-6 mb-4">
          <span className="mono-ui text-[10px] text-forest block mb-4">DISPLAY</span>
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">Night Vision Mode</span>
            <div className="w-12 h-6 bg-primary" />
          </div>
        </div>
        <button
          onClick={() => { localStorage.removeItem('narvo_user'); navigate('/'); }}
          className="w-full border border-forest text-forest font-display font-bold py-4 hover:bg-forest hover:text-white transition-all"
        >
          [END SESSION / LOG OUT]
        </button>
      </div>
    </div>
  );
};

// ===========================================
// AUDIO PLAYER
// ===========================================
const AudioPlayer = () => {
  const { currentTrack, isPlaying, progress, duration, togglePlay, seek, isLoading } = useAudio();
  if (!currentTrack) return null;

  const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-forest bg-background-dark z-50" data-testid="audio-player">
      <div className="flex items-center gap-4 px-6 py-3">
        <div className="flex-1 min-w-0">
          <span className="mono-ui text-[10px] text-forest block truncate">{currentTrack.source || 'NARVO'}</span>
          <span className="font-display text-sm text-white block truncate">{currentTrack.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => seek(Math.max(0, progress - 10))} className="text-forest hover:text-primary">
            <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
              <path d="M199.81,34a16,16,0,0,0-16.24.43L64,109.23V40a8,8,0,0,0-16,0V216a8,8,0,0,0,16,0V146.77l119.57,74.78A15.95,15.95,0,0,0,208,208.12V47.88A15.86,15.86,0,0,0,199.81,34Z"/>
            </svg>
          </button>
          <button onClick={togglePlay} className="w-10 h-10 bg-primary flex items-center justify-center" disabled={isLoading}>
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-background-dark border-t-transparent animate-spin" />
            ) : isPlaying ? (
              <svg className="w-5 h-5 text-background-dark" viewBox="0 0 256 256" fill="currentColor">
                <path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-background-dark" viewBox="0 0 256 256" fill="currentColor">
                <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/>
              </svg>
            )}
          </button>
          <button onClick={() => seek(Math.min(duration, progress + 10))} className="text-forest hover:text-primary">
            <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
              <path d="M208,40V216a8,8,0,0,1-16,0V146.77L72.43,221.55A15.95,15.95,0,0,1,48,208.12V47.88A15.86,15.86,0,0,1,56.19,34a16,16,0,0,1,16.24.43L192,109.23V40a8,8,0,0,1,16,0Z"/>
            </svg>
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-2 w-48">
          <span className="mono-ui text-[10px] text-forest">{formatTime(progress)}</span>
          <input type="range" min={0} max={duration || 100} value={progress} onChange={(e) => seek(Number(e.target.value))} className="flex-1" />
          <span className="mono-ui text-[10px] text-forest">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// MAIN APP
// ===========================================
function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} duration={3500} />;
  }

  return (
    <AudioProvider>
      <Router>
        <div className="pb-20">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/briefing" element={<MorningBriefingPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/voices" element={<VoiceStudioPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AudioPlayer />
        </div>
      </Router>
    </AudioProvider>
  );
}

export default App;

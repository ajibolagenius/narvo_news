import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  Radio, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Search, Menu, Settings, User, Bookmark, Archive, Globe, Map,
  Mic, Building, TrendingUp, Cpu, Trophy, Heart, Newspaper,
  ChevronRight, Signal, Clock, CheckCircle, AlertCircle, X, LogOut,
  Coffee, Sunrise, RefreshCw, List
} from 'lucide-react';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Context for audio player
const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

// Audio Provider Component
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
    
    audio.addEventListener('timeupdate', () => {
      setProgress(audio.currentTime);
    });
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      setIsLoading(false);
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
    });
    
    audio.addEventListener('error', () => {
      setIsLoading(false);
      setIsPlaying(false);
    });
    
    setAudioElement(audio);
    
    return () => {
      audio.pause();
      audio.src = '';
    };
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
      // Generate TTS
      try {
        const response = await fetch(`${API_URL}/api/tts/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: track.narrative || track.summary || track.title,
            voice_id: track.voice_id || 'nova'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          audioElement.src = data.audio_url;
          await audioElement.play();
          setIsPlaying(true);
          track.audio_url = data.audio_url;
        }
      } catch (error) {
        console.error('TTS error:', error);
        setIsLoading(false);
      }
    }
  };

  const togglePlay = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time) => {
    if (audioElement) {
      audioElement.currentTime = time;
      setProgress(time);
    }
  };

  const setVolumeLevel = (level) => {
    setVolume(level);
    if (audioElement) {
      audioElement.volume = level;
    }
  };

  return (
    <AudioContext.Provider value={{
      currentTrack, isPlaying, progress, duration, volume, isLoading,
      playTrack, togglePlay, seek, setVolumeLevel
    }}>
      {children}
    </AudioContext.Provider>
  );
};

// Landing Page
const LandingPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/metrics`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-narvo-bg" data-testid="landing-page">
      {/* Header */}
      <header className="swiss-grid border-b border-narvo-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Radio className="text-narvo-primary w-8 h-8" />
            <span className="font-header text-xl font-bold text-narvo-text">NARVO</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-narvo-text-secondary">
              SYSTEM_STATUS: <span className="text-narvo-primary">ONLINE</span>
            </span>
            <button
              onClick={() => navigate('/auth')}
              className="btn-command text-sm"
              data-testid="login-btn"
            >
              [INIT_AUTH]
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="swiss-grid border-b border-narvo-border">
        <div className="grid md:grid-cols-2">
          <div className="swiss-cell p-12 flex flex-col justify-center">
            <h1 className="font-header text-4xl md:text-5xl font-bold text-narvo-text mb-6 leading-tight">
              [NARVO: THE LOCAL PULSE, REFINED.]
            </h1>
            <p className="text-narvo-text-secondary text-lg mb-8 leading-relaxed">
              Precision-engineered news broadcast platform. High-fidelity regional audio. 
              Broadcast-grade narrative synthesis powered by advanced AI.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="btn-command text-base"
                data-testid="join-broadcast-btn"
              >
                [Join the Broadcast]
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-command-outline text-base"
                data-testid="demo-btn"
              >
                [Oya, Play]
              </button>
            </div>
          </div>
          
          <div className="swiss-cell p-8 bg-narvo-surface">
            {/* Signal Visualization */}
            <div className="border border-narvo-border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-narvo-text-dim">SIGNAL_WAVEFORM</span>
                <span className="font-mono text-xs text-narvo-primary">LIVE</span>
              </div>
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="waveform-bar w-2 rounded-t grid-breathing"
                    style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.05}s` }}
                  />
                ))}
              </div>
            </div>
            
            {/* Stats Grid */}
            {metrics && (
              <div className="grid grid-cols-2 gap-4">
                <div className="swiss-cell p-4">
                  <span className="font-mono text-xs text-narvo-text-dim block mb-2">LISTENERS_TODAY</span>
                  <span className="font-header text-2xl text-narvo-text">{metrics.listeners_today}</span>
                </div>
                <div className="swiss-cell p-4">
                  <span className="font-mono text-xs text-narvo-text-dim block mb-2">SOURCES_ONLINE</span>
                  <span className="font-header text-2xl text-narvo-text">{metrics.sources_online}</span>
                </div>
                <div className="swiss-cell p-4">
                  <span className="font-mono text-xs text-narvo-text-dim block mb-2">SIGNAL_STRENGTH</span>
                  <span className="font-header text-2xl text-narvo-primary">{metrics.signal_strength}</span>
                </div>
                <div className="swiss-cell p-4">
                  <span className="font-mono text-xs text-narvo-text-dim block mb-2">NETWORK_LOAD</span>
                  <span className="font-header text-2xl text-narvo-text">{metrics.network_load}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="swiss-grid">
        <div className="grid md:grid-cols-3">
          <div className="swiss-cell p-8">
            <Building className="w-8 h-8 text-narvo-text-secondary mb-4" />
            <h3 className="font-header text-lg text-narvo-text mb-3">[THE STATION]</h3>
            <p className="text-narvo-text-dim text-sm leading-relaxed">
              Your personalized broadcast hub. Continuous news stream engineered for high-fidelity consumption.
            </p>
          </div>
          
          <div className="swiss-cell p-8">
            <Mic className="w-8 h-8 text-narvo-text-secondary mb-4" />
            <h3 className="font-header text-lg text-narvo-text mb-3">[REGIONAL VOICES]</h3>
            <p className="text-narvo-text-dim text-sm leading-relaxed">
              Authentic local accents. Pidgin, Yoruba, Hausa, Igbo. The voices of Africa, refined.
            </p>
          </div>
          
          <div className="swiss-cell p-8">
            <CheckCircle className="w-8 h-8 text-narvo-text-secondary mb-4" />
            <h3 className="font-header text-lg text-narvo-text mb-3">[TRUTH PROTOCOL]</h3>
            <p className="text-narvo-text-dim text-sm leading-relaxed">
              Every narrative tagged. Source verified. Transparency engineered into every broadcast.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="swiss-grid border-t border-narvo-border">
        <div className="p-6 flex items-center justify-between">
          <span className="font-mono text-xs text-narvo-text-dim">
            © 2026 NARVO BROADCAST SYSTEMS
          </span>
          <span className="font-mono text-xs text-narvo-text-dim">
            THE LOCAL PULSE, REFINED.
          </span>
        </div>
      </footer>
    </div>
  );
};

// Auth Page
const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // For MVP, just store user in localStorage and navigate
    try {
      const user = { email, name: name || email.split('@')[0] };
      localStorage.setItem('narvo_user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-narvo-bg flex" data-testid="auth-page">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex flex-col w-1/2 swiss-cell p-12 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <Radio className="text-narvo-primary w-10 h-10" />
            <span className="font-header text-2xl font-bold text-narvo-text">NARVO</span>
          </div>
          <h2 className="font-header text-3xl text-narvo-text mb-4">
            [ACCESS THE BROADCAST]
          </h2>
          <p className="text-narvo-text-secondary leading-relaxed">
            Initialize your connection to the precision-engineered news network.
            High-fidelity regional audio awaits.
          </p>
        </div>
        
        <div className="border border-narvo-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Signal className="w-4 h-4 text-narvo-primary" />
            <span className="font-mono text-xs text-narvo-primary">SYSTEM_READY</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="waveform-bar w-1.5 rounded-t grid-breathing"
                style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="swiss-cell p-8">
            <h3 className="font-header text-xl text-narvo-text mb-6">
              [{isLogin ? 'LOGIN_CONSOLE' : 'REGISTER_CONSOLE'}]
            </h3>
            
            {error && (
              <div className="border border-red-500 bg-red-500/10 p-3 mb-6 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="font-mono text-xs text-red-500">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="mb-4">
                  <label className="font-mono text-xs text-narvo-text-dim block mb-2">
                    USER_NAME
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                    placeholder="Enter your name"
                    data-testid="name-input"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="font-mono text-xs text-narvo-text-dim block mb-2">
                  EMAIL_ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  placeholder="user@narvo.io"
                  required
                  data-testid="email-input"
                />
              </div>
              
              <div className="mb-6">
                <label className="font-mono text-xs text-narvo-text-dim block mb-2">
                  ACCESS_KEY
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  placeholder="••••••••"
                  required
                  data-testid="password-input"
                />
              </div>
              
              <button
                type="submit"
                className="btn-command w-full mb-4"
                disabled={loading}
                data-testid="auth-submit-btn"
              >
                {loading ? '[PROCESSING...]' : isLogin ? '[AUTHENTICATE]' : '[REGISTER]'}
              </button>
            </form>
            
            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-mono text-xs text-narvo-text-secondary hover:text-narvo-primary"
                data-testid="toggle-auth-mode"
              >
                {isLogin ? '[CREATE_NEW_ACCESS]' : '[EXISTING_USER_LOGIN]'}
              </button>
            </div>
          </div>
          
          <Link
            to="/"
            className="block text-center font-mono text-xs text-narvo-text-dim mt-6 hover:text-narvo-primary"
          >
            ← [BACK_TO_LANDING]
          </Link>
        </div>
      </div>
    </div>
  );
};

// Dashboard Page
const DashboardPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [trending, setTrending] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { playTrack, currentTrack, isPlaying, isLoading: audioLoading } = useAudio();

  const user = JSON.parse(localStorage.getItem('narvo_user') || '{}');

  useEffect(() => {
    fetchNews();
    fetchMetrics();
    fetchTrending();
  }, [selectedRegion, selectedCategory]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/news?limit=15`;
      if (selectedRegion) url += `&region=${selectedRegion}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/metrics`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trending`);
      const data = await response.json();
      setTrending(data);
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('narvo_user');
    navigate('/');
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Politics': Building,
      'Economy': TrendingUp,
      'Tech': Cpu,
      'Sports': Trophy,
      'Health': Heart,
      'General': Newspaper
    };
    const Icon = icons[category] || Newspaper;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-narvo-bg" data-testid="dashboard-page">
      {/* Top Bar */}
      <header className="swiss-grid border-b border-narvo-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Radio className="text-narvo-primary w-6 h-6" />
            <span className="font-header text-lg font-bold text-narvo-text">NARVO</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-narvo-text-secondary">
              SYSTEM_STATUS: <span className="text-narvo-primary">ONLINE</span> • UPDATING
            </span>
            <Link to="/search" className="text-narvo-text-dim hover:text-narvo-primary" data-testid="search-btn">
              <Search className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Navigation */}
        <aside className="w-64 swiss-cell min-h-screen hidden lg:block">
          <nav className="p-4">
            <div className="mb-8">
              <span className="font-mono text-xs text-narvo-text-dim block mb-4">NAVIGATION</span>
              
              <Link
                to="/dashboard"
                className="flex items-center gap-3 p-3 border border-narvo-primary bg-narvo-primary/10 mb-2"
                data-testid="nav-primary-stream"
              >
                <Radio className="w-4 h-4 text-narvo-primary" />
                <span className="font-mono text-sm text-narvo-primary">Primary Stream</span>
              </Link>
              
              <button
                onClick={() => { setSelectedRegion('Nigeria'); setSelectedCategory(null); }}
                className={`flex items-center gap-3 p-3 border border-narvo-border hover:border-narvo-text-secondary mb-2 w-full text-left ${selectedRegion === 'Nigeria' ? 'border-narvo-text-secondary' : ''}`}
                data-testid="nav-regional-pulse"
              >
                <Globe className="w-4 h-4 text-narvo-text-dim" />
                <span className="font-mono text-sm text-narvo-text-dim">Regional Pulse</span>
              </button>
              
              <Link
                to="/search"
                className="flex items-center gap-3 p-3 border border-narvo-border hover:border-narvo-text-secondary mb-2 w-full"
                data-testid="nav-archives"
              >
                <Archive className="w-4 h-4 text-narvo-text-dim" />
                <span className="font-mono text-sm text-narvo-text-dim">Archives</span>
              </Link>
              
              <Link
                to="/voices"
                className="flex items-center gap-3 p-3 border border-narvo-border hover:border-narvo-text-secondary mb-2 w-full"
                data-testid="nav-voice-studio"
              >
                <Mic className="w-4 h-4 text-narvo-text-dim" />
                <span className="font-mono text-sm text-narvo-text-dim">Voice Studio</span>
              </Link>
            </div>
            
            <div className="mb-8">
              <span className="font-mono text-xs text-narvo-text-dim block mb-4">SYSTEM</span>
              <Link
                to="/settings"
                className="flex items-center gap-3 p-3 border border-narvo-border hover:border-narvo-text-secondary w-full"
                data-testid="nav-settings"
              >
                <Settings className="w-4 h-4 text-narvo-text-dim" />
                <span className="font-mono text-sm text-narvo-text-dim">Settings</span>
              </Link>
            </div>
          </nav>
          
          {/* User Profile */}
          <div className="absolute bottom-20 left-0 w-64 p-4 border-t border-narvo-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-narvo-surface border border-narvo-border flex items-center justify-center">
                <User className="w-5 h-5 text-narvo-text-secondary" />
              </div>
              <div>
                <span className="font-mono text-sm text-narvo-text block">{user.name || 'Guest'}</span>
                <span className="font-mono text-xs text-narvo-text-dim">PRO_MEMBER</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 mt-3 text-narvo-text-dim hover:text-narvo-primary"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-mono text-xs">[LOGOUT]</span>
            </button>
          </div>
        </aside>

        {/* Main Content - Live Feed */}
        <main className="flex-1 swiss-cell">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-header text-2xl text-narvo-text mb-1" data-testid="feed-title">
                  [Live Feed]
                </h2>
                <span className="font-mono text-xs text-narvo-text-secondary">
                  Welcome, Oga {user.name || 'Guest'}
                </span>
              </div>
              
              {/* Category Filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`tag cursor-pointer ${!selectedCategory ? 'border-narvo-primary text-narvo-primary' : ''}`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setSelectedCategory('Politics')}
                  className={`tag cursor-pointer ${selectedCategory === 'Politics' ? 'border-narvo-primary text-narvo-primary' : ''}`}
                >
                  POLITICS
                </button>
                <button
                  onClick={() => setSelectedCategory('Economy')}
                  className={`tag cursor-pointer ${selectedCategory === 'Economy' ? 'border-narvo-primary text-narvo-primary' : ''}`}
                >
                  ECONOMY
                </button>
                <button
                  onClick={() => setSelectedCategory('Tech')}
                  className={`tag cursor-pointer ${selectedCategory === 'Tech' ? 'border-narvo-primary text-narvo-primary' : ''}`}
                >
                  TECH
                </button>
              </div>
            </div>

            {/* News Feed */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="flex items-end gap-1 h-8 justify-center mb-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="waveform-bar w-2 rounded-t grid-breathing"
                        style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-sm text-narvo-text-secondary">[PROCESSING SIGNAL...]</span>
                </div>
              </div>
            ) : news.length === 0 ? (
              <div className="swiss-cell p-8 text-center">
                <span className="font-mono text-sm text-narvo-text-dim">[No Gist Yet. System Refreshing...]</span>
              </div>
            ) : (
              <div className="space-y-4" data-testid="news-feed">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="swiss-cell p-6 hover:border-narvo-text-secondary transition-colors cursor-pointer"
                    onClick={() => navigate(`/news/${item.id}`)}
                    data-testid={`news-card-${item.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        <span className="font-mono text-xs text-narvo-text-secondary">{item.category.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-narvo-text-dim">{item.source}</span>
                        <span className="font-mono text-xs text-narvo-text-dim">
                          {new Date(item.published).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-header text-lg text-narvo-text mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-narvo-text-dim text-sm mb-4 line-clamp-2">
                      {item.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {item.tags?.map((tag, idx) => (
                          <span key={idx} className="tag">{tag}</span>
                        ))}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(item);
                        }}
                        className="btn-command text-xs flex items-center gap-2"
                        disabled={audioLoading && currentTrack?.id === item.id}
                        data-testid={`play-btn-${item.id}`}
                      >
                        {audioLoading && currentTrack?.id === item.id ? (
                          <>[LOADING...]</>
                        ) : currentTrack?.id === item.id && isPlaying ? (
                          <><Pause className="w-3 h-3" /> [PAUSE]</>
                        ) : (
                          <><Play className="w-3 h-3" /> [Listen]</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Data Stream */}
        <aside className="w-80 swiss-cell hidden xl:block">
          <div className="p-4">
            <span className="font-mono text-xs text-narvo-text-dim block mb-4">DATA_STREAM</span>
            
            {/* Live Metrics */}
            {metrics && (
              <div className="swiss-cell p-4 mb-4">
                <span className="font-mono text-xs text-narvo-text-dim block mb-3">LIVE_METRICS</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-header text-xl text-narvo-text">{metrics.listeners_today}</span>
                    <span className="font-mono text-xs text-narvo-text-dim block">LISTENERS</span>
                  </div>
                  <div>
                    <span className="font-header text-xl text-narvo-text">{metrics.sources_online}</span>
                    <span className="font-mono text-xs text-narvo-text-dim block">SOURCES</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Trending Tags */}
            {trending && (
              <div className="swiss-cell p-4 mb-4">
                <span className="font-mono text-xs text-narvo-text-dim block mb-3">TRENDING_TAGS</span>
                <div className="flex flex-wrap gap-2">
                  {trending.tags?.map((tag, idx) => (
                    <span key={idx} className="tag cursor-pointer hover:border-narvo-primary hover:text-narvo-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Active Region */}
            <div className="swiss-cell p-4">
              <span className="font-mono text-xs text-narvo-text-dim block mb-3">ACTIVE_REGION</span>
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-narvo-text-secondary" />
                <div>
                  <span className="font-mono text-sm text-narvo-text block">Nigeria</span>
                  <span className="font-mono text-xs text-narvo-text-dim">West Africa</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// News Detail Page
const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying, isLoading: audioLoading } = useAudio();

  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  const fetchNewsDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/news/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch news detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-narvo-bg flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-end gap-1 h-8 justify-center mb-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="waveform-bar w-2 rounded-t grid-breathing"
                style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <span className="font-mono text-sm text-narvo-text-secondary">[LOADING BROADCAST...]</span>
        </div>
      </div>
    );
  }

  if (!news) return null;

  return (
    <div className="min-h-screen bg-narvo-bg" data-testid="news-detail-page">
      {/* Header */}
      <header className="swiss-grid border-b border-narvo-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-narvo-text-dim hover:text-narvo-primary"
              data-testid="back-btn"
            >
              ← [BACK]
            </button>
            <span className="font-mono text-xs text-narvo-text-secondary">THE_DEEP_DIVE</span>
          </div>
          <span className="font-mono text-xs text-narvo-text-secondary">
            [TRUTH TAG: <span className="text-narvo-primary">{news.truth_score}%</span>]
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-6">
          <span className="tag">{news.category?.toUpperCase()}</span>
          <span className="font-mono text-xs text-narvo-text-dim">{news.source}</span>
          <span className="font-mono text-xs text-narvo-text-dim">
            {new Date(news.published).toLocaleDateString()}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-header text-3xl text-narvo-text mb-6" data-testid="news-title">
          {news.title}
        </h1>

        {/* Play Button */}
        <div className="swiss-cell p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-narvo-text-dim block mb-2">BROADCAST_CONSOLE</span>
              <span className="font-mono text-sm text-narvo-text">Ready to play narrative briefing</span>
            </div>
            <button
              onClick={() => playTrack(news)}
              className="btn-command flex items-center gap-2"
              disabled={audioLoading && currentTrack?.id === news.id}
              data-testid="play-narrative-btn"
            >
              {audioLoading && currentTrack?.id === news.id ? (
                <>[GENERATING AUDIO...]</>
              ) : currentTrack?.id === news.id && isPlaying ? (
                <><Pause className="w-4 h-4" /> [PAUSE BROADCAST]</>
              ) : (
                <><Play className="w-4 h-4" /> [Oya, Play]</>
              )}
            </button>
          </div>
        </div>

        {/* Key Takeaways */}
        {news.key_takeaways && news.key_takeaways.length > 0 && (
          <div className="swiss-cell p-6 mb-8">
            <h3 className="font-header text-lg text-narvo-text mb-4">[The Sharp-Sharp Summary]</h3>
            <ul className="space-y-2">
              {news.key_takeaways.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-narvo-primary mt-1 flex-shrink-0" />
                  <span className="text-narvo-text-secondary text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Narrative */}
        <div className="swiss-cell p-6 mb-8">
          <h3 className="font-header text-lg text-narvo-text mb-4">[The Full Gist]</h3>
          <p className="text-narvo-text leading-relaxed whitespace-pre-wrap" data-testid="news-narrative">
            {news.narrative || news.summary}
          </p>
        </div>

        {/* Source Attribution */}
        <div className="swiss-cell p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-narvo-text-dim">
              Originally from: <span className="text-narvo-text-secondary">{news.source}</span>
            </span>
            <a
              href={news.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-narvo-primary hover:underline"
              data-testid="source-link"
            >
              [VIEW_ORIGINAL]
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Voice Studio Page
const VoiceStudioPage = () => {
  const navigate = useNavigate();
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [previewText] = useState("Welcome to Narvo. The local pulse, refined. Your broadcast is ready.");
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewAudio, setPreviewAudio] = useState(null);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/voices`);
      const data = await response.json();
      setVoices(data);
      if (data.length > 0) setSelectedVoice(data[0]);
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    }
  };

  const playPreview = async (voice) => {
    setIsPlaying(true);
    setSelectedVoice(voice);
    
    try {
      const response = await fetch(`${API_URL}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: previewText,
          voice_id: voice.id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const audio = new Audio(data.audio_url);
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setPreviewAudio(audio);
      }
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-narvo-bg" data-testid="voice-studio-page">
      {/* Header */}
      <header className="swiss-grid border-b border-narvo-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-narvo-text-dim hover:text-narvo-primary"
              data-testid="back-btn"
            >
              ← [BACK]
            </button>
            <span className="font-header text-lg text-narvo-text">[Regional Voice Studio]</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="swiss-cell p-6 mb-8">
          <h2 className="font-header text-xl text-narvo-text mb-2">Select Your Broadcast Voice</h2>
          <p className="text-narvo-text-secondary text-sm">
            Choose from our collection of high-fidelity regional voices. Each voice is crafted to deliver news with authentic local flavor.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4" data-testid="voice-grid">
          {voices.map((voice) => (
            <div
              key={voice.id}
              className={`swiss-cell p-6 cursor-pointer transition-colors ${
                selectedVoice?.id === voice.id ? 'border-narvo-primary' : 'hover:border-narvo-text-secondary'
              }`}
              onClick={() => setSelectedVoice(voice)}
              data-testid={`voice-card-${voice.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-header text-lg text-narvo-text mb-1">{voice.name}</h3>
                  <span className="tag">{voice.accent}</span>
                </div>
                {selectedVoice?.id === voice.id && (
                  <CheckCircle className="w-5 h-5 text-narvo-primary" />
                )}
              </div>
              
              <p className="text-narvo-text-dim text-sm mb-4">{voice.description}</p>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playPreview(voice);
                }}
                className="btn-command-outline text-xs w-full flex items-center justify-center gap-2"
                disabled={isPlaying && selectedVoice?.id === voice.id}
                data-testid={`preview-btn-${voice.id}`}
              >
                {isPlaying && selectedVoice?.id === voice.id ? (
                  <>[PLAYING...]</>
                ) : (
                  <><Play className="w-3 h-3" /> [Listen to Sample]</>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Save Selection */}
        <div className="swiss-cell p-6 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-narvo-text-dim block mb-2">SELECTED_VOICE</span>
              <span className="font-header text-lg text-narvo-text">
                {selectedVoice?.name || 'None'} - {selectedVoice?.accent || ''}
              </span>
            </div>
            <button
              className="btn-command"
              onClick={() => {
                localStorage.setItem('narvo_voice', JSON.stringify(selectedVoice));
                navigate('/dashboard');
              }}
              data-testid="save-voice-btn"
            >
              [SAVE_PREFERENCE]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Page
const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { playTrack, currentTrack, isPlaying, isLoading: audioLoading } = useAudio();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Search through all news
      const response = await fetch(`${API_URL}/api/news?limit=50`);
      const data = await response.json();
      
      // Filter by query
      const filtered = data.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.summary.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchByCategory = async (category) => {
    setLoading(true);
    setQuery(category);
    try {
      const response = await fetch(`${API_URL}/api/news?category=${category}&limit=20`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Category search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-narvo-bg" data-testid="search-page">
      {/* Header */}
      <header className="swiss-grid border-b border-narvo-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-narvo-text-dim hover:text-narvo-primary"
              data-testid="back-btn"
            >
              ← [BACK]
            </button>
            <span className="font-header text-lg text-narvo-text">[Search Center Console]</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="swiss-cell p-6 mb-8">
          <label className="font-mono text-xs text-narvo-text-dim block mb-3">
            FIND_PARTICULAR_GIST
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search news, topics, sources..."
              className="flex-1"
              data-testid="search-input"
            />
            <button type="submit" className="btn-command" data-testid="search-submit">
              [SEARCH]
            </button>
          </div>
        </form>

        {/* Category Filters */}
        <div className="swiss-cell p-6 mb-8">
          <span className="font-mono text-xs text-narvo-text-dim block mb-4">BROWSE_BY_CATEGORY</span>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => searchByCategory(cat.name)}
                className="tag cursor-pointer hover:border-narvo-primary hover:text-narvo-primary"
                data-testid={`category-${cat.id}`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="font-mono text-sm text-narvo-text-secondary">[SEARCHING...]</span>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4" data-testid="search-results">
            <span className="font-mono text-xs text-narvo-text-dim">
              FOUND: {results.length} RESULTS
            </span>
            {results.map((item) => (
              <div
                key={item.id}
                className="swiss-cell p-6 hover:border-narvo-text-secondary cursor-pointer"
                onClick={() => navigate(`/news/${item.id}`)}
                data-testid={`search-result-${item.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="tag">{item.category?.toUpperCase()}</span>
                  <span className="font-mono text-xs text-narvo-text-dim">{item.source}</span>
                </div>
                <h3 className="font-header text-lg text-narvo-text mb-2">{item.title}</h3>
                <p className="text-narvo-text-dim text-sm line-clamp-2">{item.summary}</p>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="swiss-cell p-8 text-center">
            <span className="font-mono text-sm text-narvo-text-dim">[No Results. Adjust Filter.]</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Settings Page
const SettingsPage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const user = JSON.parse(localStorage.getItem('narvo_user') || '{}');

  return (
    <div className="min-h-screen bg-narvo-bg" data-testid="settings-page">
      {/* Header */}
      <header className="swiss-grid border-b border-narvo-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-narvo-text-dim hover:text-narvo-primary"
              data-testid="back-btn"
            >
              ← [BACK]
            </button>
            <span className="font-header text-lg text-narvo-text">[System Config Console]</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        {/* User Profile */}
        <div className="swiss-cell p-6 mb-6">
          <span className="font-mono text-xs text-narvo-text-dim block mb-4">USER_ID_CONSOLE</span>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-narvo-surface border border-narvo-border flex items-center justify-center">
              <User className="w-8 h-8 text-narvo-text-secondary" />
            </div>
            <div>
              <h3 className="font-header text-xl text-narvo-text">{user.name || 'Guest User'}</h3>
              <span className="font-mono text-xs text-narvo-text-dim">{user.email || 'Not logged in'}</span>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="swiss-cell p-6 mb-6">
          <span className="font-mono text-xs text-narvo-text-dim block mb-4">DISPLAY_SETTINGS</span>
          
          <div className="flex items-center justify-between py-4 border-b border-narvo-border">
            <div>
              <span className="font-mono text-sm text-narvo-text block">Night Vision</span>
              <span className="font-mono text-xs text-narvo-text-dim">Dark mode display</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-narvo-primary' : 'bg-narvo-surface border border-narvo-border'
              }`}
              data-testid="dark-mode-toggle"
            >
              <div className={`w-5 h-5 rounded-full bg-narvo-bg transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between py-4">
            <div>
              <span className="font-mono text-sm text-narvo-text block">Feel the Pulse</span>
              <span className="font-mono text-xs text-narvo-text-dim">Haptic feedback</span>
            </div>
            <button
              onClick={() => setHaptics(!haptics)}
              className={`w-12 h-6 rounded-full transition-colors ${
                haptics ? 'bg-narvo-primary' : 'bg-narvo-surface border border-narvo-border'
              }`}
              data-testid="haptics-toggle"
            >
              <div className={`w-5 h-5 rounded-full bg-narvo-bg transition-transform ${
                haptics ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="swiss-cell p-6 mb-6">
          <span className="font-mono text-xs text-narvo-text-dim block mb-4">VOICE_SETTINGS</span>
          <button
            onClick={() => navigate('/voices')}
            className="flex items-center justify-between w-full py-4"
            data-testid="voice-settings-btn"
          >
            <div>
              <span className="font-mono text-sm text-narvo-text block">Regional Voice Studio</span>
              <span className="font-mono text-xs text-narvo-text-dim">Select your preferred accent</span>
            </div>
            <ChevronRight className="w-5 h-5 text-narvo-text-dim" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem('narvo_user');
            navigate('/');
          }}
          className="btn-command-outline w-full"
          data-testid="logout-btn"
        >
          [End Session / Log out]
        </button>
      </div>
    </div>
  );
};

// Persistent Audio Player
const AudioPlayer = () => {
  const { currentTrack, isPlaying, progress, duration, volume, togglePlay, seek, setVolumeLevel, isLoading } = useAudio();
  const [showVolume, setShowVolume] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 swiss-grid border-t border-narvo-border bg-narvo-bg z-50" data-testid="audio-player">
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <span className="font-mono text-xs text-narvo-text-secondary block truncate">
            {currentTrack.source || 'NARVO BROADCAST'}
          </span>
          <span className="font-header text-sm text-narvo-text block truncate">
            {currentTrack.title}
          </span>
        </div>

        {/* Waveform */}
        <div className="hidden md:flex items-end gap-0.5 h-8 w-32">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-t transition-all ${isPlaying ? 'grid-breathing' : ''} ${
                isPlaying ? 'bg-narvo-primary' : 'bg-narvo-text-secondary'
              }`}
              style={{ 
                height: `${Math.random() * 80 + 20}%`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => seek(Math.max(0, progress - 10))}
            className="text-narvo-text-dim hover:text-narvo-primary"
            data-testid="skip-back-btn"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-narvo-primary flex items-center justify-center"
            disabled={isLoading}
            data-testid="play-pause-btn"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-narvo-bg border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 text-narvo-bg" />
            ) : (
              <Play className="w-5 h-5 text-narvo-bg ml-0.5" />
            )}
          </button>
          
          <button
            onClick={() => seek(Math.min(duration, progress + 10))}
            className="text-narvo-text-dim hover:text-narvo-primary"
            data-testid="skip-forward-btn"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="hidden sm:flex items-center gap-2 w-48">
          <span className="font-mono text-xs text-narvo-text-dim w-10">
            {formatTime(progress)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1 h-1 bg-narvo-border rounded appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-primary) ${(progress / (duration || 100)) * 100}%, var(--color-border) ${(progress / (duration || 100)) * 100}%)`
            }}
            data-testid="progress-slider"
          />
          <span className="font-mono text-xs text-narvo-text-dim w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume */}
        <div className="relative">
          <button
            onClick={() => setShowVolume(!showVolume)}
            className="text-narvo-text-dim hover:text-narvo-primary"
            data-testid="volume-btn"
          >
            {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          {showVolume && (
            <div className="absolute bottom-full right-0 mb-2 swiss-cell p-3 bg-narvo-bg">
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => setVolumeLevel(Number(e.target.value))}
                className="w-24 h-1 bg-narvo-border rounded appearance-none cursor-pointer"
                data-testid="volume-slider"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App
function App() {
  return (
    <AudioProvider>
      <Router>
        <div className="pb-20">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
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

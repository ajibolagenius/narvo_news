import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { useBookmarks } from '../hooks/useBookmarks';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying, isLoading: audioLoading } = useAudio();
  const { user } = useAuth();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=10`)
      .then(res => res.json())
      .then(data => { setNews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const displayName = user?.email?.split('@')[0] || 'Guest';

  const toggleBookmark = (e, item) => {
    e.stopPropagation();
    if (isBookmarked(item.id)) {
      removeBookmark(item.id);
    } else {
      addBookmark(item);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark" data-testid="dashboard-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <svg className="w-6 h-6 text-primary" viewBox="0 0 256 256" fill="currentColor">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/>
            </svg>
            <span className="font-display text-lg font-bold text-white">NARVO</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="mono-ui text-[10px] text-forest">STATUS: <span className="text-primary">ONLINE</span></span>
            <Link to="/search" data-testid="nav-search">
              <svg className="w-5 h-5 text-forest hover:text-primary" viewBox="0 0 256 256" fill="currentColor">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32Z"/>
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r border-forest min-h-screen hidden lg:block">
          <nav className="p-4">
            <span className="mono-ui text-[10px] text-forest block mb-4">NAVIGATION</span>
            <Link to="/briefing" className="flex items-center gap-3 p-3 border border-primary bg-primary/10 mb-2" data-testid="nav-briefing">
              <svg className="w-4 h-4 text-primary" viewBox="0 0 256 256" fill="currentColor"><path d="M80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,120,64Z"/></svg>
              <span className="mono-ui text-xs text-primary">Morning Briefing</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 p-3 border border-forest mb-2 bg-forest/10" data-testid="nav-stream">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Z"/></svg>
              <span className="mono-ui text-xs text-forest">Primary Stream</span>
            </Link>
            <Link to="/bookmarks" className="flex items-center gap-3 p-3 border border-forest mb-2" data-testid="nav-bookmarks">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 256 256" fill="currentColor"><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"/></svg>
              <span className="mono-ui text-xs text-forest">Saved Stories</span>
            </Link>
            <Link to="/voices" className="flex items-center gap-3 p-3 border border-forest mb-2" data-testid="nav-voices">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 256 256" fill="currentColor"><path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176Z"/></svg>
              <span className="mono-ui text-xs text-forest">Voice Studio</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 p-3 border border-forest" data-testid="nav-settings">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 256 256" fill="currentColor"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Z"/></svg>
              <span className="mono-ui text-xs text-forest">Settings</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl text-white mb-1">[Live Feed]</h2>
              <span className="mono-ui text-[10px] text-text-secondary">Welcome, Oga {displayName}</span>
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
                <div key={item.id} className="border border-forest bg-surface p-6 hover:border-text-secondary cursor-pointer transition-colors" onClick={() => navigate(`/news/${item.id}`)} data-testid={`news-card-${item.id}`}>
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
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => toggleBookmark(e, item)} className={`border px-3 py-2 text-xs mono-ui transition-all ${isBookmarked(item.id) ? 'border-primary bg-primary/10 text-primary' : 'border-forest text-forest hover:border-primary hover:text-primary'}`} data-testid={`bookmark-btn-${item.id}`}>
                        {isBookmarked(item.id) ? '[SAVED]' : '[SAVE]'}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); playTrack(item); }} className="bg-primary text-background-dark font-display font-bold px-4 py-2 text-xs hover:bg-white transition-all flex items-center gap-2" disabled={audioLoading && currentTrack?.id === item.id} data-testid={`play-btn-${item.id}`}>
                        {currentTrack?.id === item.id && isPlaying ? '[PAUSE]' : '[LISTEN]'}
                      </button>
                    </div>
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

export default DashboardPage;

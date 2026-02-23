import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';
import { useBookmarks } from '../hooks/useBookmarks';
import LoadingScreen from '../components/LoadingScreen';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();

  useEffect(() => {
    fetch(`${API_URL}/api/news/${id}`).then(res => res.json()).then(setNews).catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  if (!news) return <LoadingScreen duration={2000} />;

  const toggleBookmark = () => {
    if (isBookmarked(news.id)) removeBookmark(news.id);
    else addBookmark(news);
  };

  return (
    <div className="min-h-screen bg-background-dark" data-testid="news-detail-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-forest hover:text-primary" data-testid="back-btn">&larr; [BACK]</button>
          <span className="mono-ui text-[10px] text-forest">[TRUTH TAG: <span className="text-primary">{news.truth_score}%</span>]</span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6">
        <span className="mono-ui text-[9px] text-primary border border-primary px-1 mb-4 inline-block">{news.category?.toUpperCase()}</span>
        <h1 className="font-display text-3xl text-white mb-6">{news.title}</h1>
        <div className="border border-forest bg-surface p-6 mb-8 flex items-center gap-4">
          <button onClick={() => playTrack(news)} className="bg-primary text-background-dark font-display font-bold px-6 py-3 hover:bg-white transition-all flex items-center gap-2" data-testid="play-story-btn">
            {currentTrack?.id === news.id && isPlaying ? '[PAUSE BROADCAST]' : '[OYA, PLAY]'}
          </button>
          <button onClick={toggleBookmark} className={`border px-4 py-3 mono-ui text-xs font-bold transition-all ${isBookmarked(news.id) ? 'border-primary bg-primary/10 text-primary' : 'border-forest text-forest hover:border-primary hover:text-primary'}`} data-testid="bookmark-detail-btn">
            {isBookmarked(news.id) ? '[SAVED]' : '[SAVE STORY]'}
          </button>
        </div>
        <div className="border border-forest bg-surface p-6">
          <h3 className="font-display text-lg text-white mb-4">[The Full Gist]</h3>
          <p className="text-slate-400 leading-relaxed">{news.narrative || news.summary}</p>
        </div>
        {news.key_takeaways?.length > 0 && (
          <div className="border border-forest bg-surface p-6 mt-4">
            <h3 className="font-display text-lg text-white mb-4">[Key Takeaways]</h3>
            <ul className="space-y-2">
              {news.key_takeaways.map((t, i) => (
                <li key={i} className="flex gap-3 text-slate-400 text-sm">
                  <span className="mono-ui text-[10px] text-primary shrink-0">{String(i+1).padStart(2,'0')}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetailPage;

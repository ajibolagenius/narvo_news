import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { getAllCachedIds, removeCachedAudio } from '../lib/audioCache';

const BookmarksPage = () => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { bookmarks, removeBookmark } = useBookmarks();
  const [cachedIds, setCachedIds] = useState([]);

  useEffect(() => {
    getAllCachedIds().then(setCachedIds);
  }, []);

  const handleRemove = async (storyId) => {
    removeBookmark(storyId);
    await removeCachedAudio(storyId);
    setCachedIds(prev => prev.filter(id => id !== storyId));
  };

  const handlePlay = (item) => {
    playTrack({ id: item.story_id, title: item.title, summary: item.summary, source: item.source });
  };

  const isCached = (storyId) => cachedIds.includes(storyId);

  return (
    <div className="min-h-screen bg-background-dark" data-testid="bookmarks-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-forest hover:text-primary" data-testid="back-btn">&larr; [BACK]</button>
          <span className="font-display text-lg text-white">[Saved Stories]</span>
          <span className="mono-ui text-[10px] text-forest">{bookmarks.length} ITEMS</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {bookmarks.length > 0 && (
          <div className="flex items-center justify-between mb-6 border border-forest bg-surface p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 256 256" fill="currentColor">
                <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"/>
              </svg>
              <div>
                <span className="mono-ui text-[10px] text-forest block">OFFLINE_CACHE</span>
                <span className="mono-ui text-[11px] text-primary">{cachedIds.filter(id => bookmarks.some(b => b.story_id === id)).length} / {bookmarks.length} STORIES WITH CACHED AUDIO</span>
              </div>
            </div>
            <span className="mono-ui text-[9px] text-forest">Play any story to cache its audio</span>
          </div>
        )}

        {bookmarks.length === 0 ? (
          <div className="border border-forest bg-surface p-12 text-center">
            <svg className="w-12 h-12 text-forest mx-auto mb-4" viewBox="0 0 256 256" fill="currentColor">
              <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.77-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z"/>
            </svg>
            <h3 className="font-display text-xl text-white mb-2">No Saved Stories</h3>
            <p className="text-slate-400 text-sm mb-6">Bookmark stories from your feed to access them offline.</p>
            <Link to="/dashboard" className="bg-primary text-background-dark font-display font-bold px-6 py-3 hover:bg-white transition-all inline-block" data-testid="go-to-feed-btn">
              [Go to Feed]
            </Link>
          </div>
        ) : (
          <div className="space-y-4" data-testid="bookmarks-list">
            {bookmarks.map((item) => (
              <div key={item.story_id} className="border border-forest bg-surface p-6 hover:border-text-secondary cursor-pointer transition-colors" onClick={() => navigate(`/news/${item.story_id}`)} data-testid={`bookmark-card-${item.story_id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="mono-ui text-[9px] text-primary border border-primary px-1">{item.category?.toUpperCase()}</span>
                    {isCached(item.story_id) && (
                      <span className="mono-ui text-[9px] text-forest border border-forest px-1 flex items-center gap-1" data-testid={`cached-badge-${item.story_id}`}>
                        <svg className="w-3 h-3" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>
                        CACHED
                      </span>
                    )}
                  </div>
                  <span className="mono-ui text-[10px] text-forest">{item.source}</span>
                </div>
                <h3 className="font-display text-lg text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="mono-ui text-[9px] text-forest">SAVED: {new Date(item.saved_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleRemove(item.story_id); }} className="border border-forest text-forest px-3 py-2 text-xs mono-ui hover:border-red-400 hover:text-red-400 transition-all" data-testid={`remove-bookmark-${item.story_id}`}>
                      [REMOVE]
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handlePlay(item); }} className="bg-primary text-background-dark font-display font-bold px-4 py-2 text-xs hover:bg-white transition-all flex items-center gap-2" data-testid={`play-bookmark-${item.story_id}`}>
                      {currentTrack?.id === item.story_id && isPlaying ? '[PAUSE]' : isCached(item.story_id) ? '[PLAY OFFLINE]' : '[LISTEN]'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;

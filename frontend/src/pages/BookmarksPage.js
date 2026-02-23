import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';
import { useBookmarks } from '../hooks/useBookmarks';

const BookmarksPage = () => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { bookmarks, removeBookmark } = useBookmarks();

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
            <div className="flex items-center justify-between mb-4">
              <span className="mono-ui text-[10px] text-forest">OFFLINE_CACHE: <span className="text-primary">ACTIVE</span></span>
              <span className="mono-ui text-[10px] text-forest">{bookmarks.length} STORIES CACHED</span>
            </div>
            {bookmarks.map((item) => (
              <div key={item.story_id} className="border border-forest bg-surface p-6 hover:border-text-secondary cursor-pointer transition-colors" onClick={() => navigate(`/news/${item.story_id}`)} data-testid={`bookmark-card-${item.story_id}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="mono-ui text-[9px] text-primary border border-primary px-1">{item.category?.toUpperCase()}</span>
                  <span className="mono-ui text-[10px] text-forest">{item.source}</span>
                </div>
                <h3 className="font-display text-lg text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="mono-ui text-[9px] text-forest">SAVED: {new Date(item.saved_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); removeBookmark(item.story_id); }} className="border border-forest text-forest px-3 py-2 text-xs mono-ui hover:border-red-400 hover:text-red-400 transition-all" data-testid={`remove-bookmark-${item.story_id}`}>
                      [REMOVE]
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); playTrack({ id: item.story_id, title: item.title, summary: item.summary, source: item.source }); }} className="bg-primary text-background-dark font-display font-bold px-4 py-2 text-xs hover:bg-white transition-all" data-testid={`play-bookmark-${item.story_id}`}>
                      {currentTrack?.id === item.story_id && isPlaying ? '[PAUSE]' : '[LISTEN]'}
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

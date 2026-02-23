import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { getAllCachedIds, removeCachedAudio } from '../lib/audioCache';
import { Bookmark, Play, Pause, Trash2, Check } from 'lucide-react';

const BookmarksPage = () => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { bookmarks, removeBookmark } = useBookmarks();
  const [cachedIds, setCachedIds] = useState([]);

  useEffect(() => { getAllCachedIds().then(setCachedIds); }, []);

  const handleRemove = async (storyId) => {
    removeBookmark(storyId);
    await removeCachedAudio(storyId);
    setCachedIds(prev => prev.filter(id => id !== storyId));
  };

  const isCached = (storyId) => cachedIds.includes(storyId);

  return (
    <main className="flex-1 flex flex-col bg-background-dark min-w-0" data-testid="bookmarks-page">
      <div className="h-14 flex items-center justify-between px-8 bg-surface/30 narvo-border-b shrink-0">
        <span className="mono-ui text-[10px] text-forest">MODULE: <span className="text-primary">SAVED_TRANSMISSIONS</span></span>
        <span className="mono-ui text-[10px] text-forest">{bookmarks.length} ITEMS CACHED</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-8">
        <div className="max-w-4xl mx-auto">
          {bookmarks.length > 0 && (
            <div className="narvo-border bg-surface/20 p-4 mb-8 flex items-center gap-4">
              <div className="w-2 h-2 bg-primary animate-pulse" />
              <span className="mono-ui text-[10px] text-forest">OFFLINE_CACHE: <span className="text-primary">{cachedIds.filter(id => bookmarks.some(b => b.story_id === id)).length} / {bookmarks.length} WITH AUDIO</span></span>
              <span className="mono-ui text-[9px] text-forest/50 ml-auto">Play stories to cache audio for offline</span>
            </div>
          )}

          {bookmarks.length === 0 ? (
            <div className="narvo-border bg-surface/20 p-12 text-center">
              <Bookmark className="w-12 h-12 text-forest mx-auto mb-4" />
              <h3 className="font-display text-xl text-white mb-2 uppercase">No Saved Stories</h3>
              <p className="text-forest text-sm mb-6 font-mono">Bookmark stories from your feed to access them offline.</p>
              <Link to="/dashboard" className="bg-primary text-background-dark font-display font-bold px-6 py-3 hover:bg-white transition-all inline-block" data-testid="go-to-feed-btn">
                [Go to Feed]
              </Link>
            </div>
          ) : (
            <div className="narvo-border bg-surface/20 divide-y divide-forest/10" data-testid="bookmarks-list">
              {bookmarks.map((item) => (
                <div key={item.story_id} className="p-6 group hover:bg-surface/40 transition-colors cursor-pointer" onClick={() => navigate(`/news/${item.story_id}`)} data-testid={`bookmark-card-${item.story_id}`}>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="bg-forest/20 text-primary mono-ui text-[8px] px-2 py-0.5 border border-forest/30">{item.category?.toUpperCase()}</span>
                        {isCached(item.story_id) && (
                          <span className="mono-ui text-[8px] text-forest flex items-center gap-1 border border-forest/30 px-1.5 py-0.5" data-testid={`cached-badge-${item.story_id}`}>
                            <Check className="w-3 h-3" /> AUDIO_CACHED
                          </span>
                        )}
                      </div>
                      <span className="mono-ui text-[8px] text-forest/50">{item.source}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white group-hover:text-primary transition-colors leading-tight">{item.title}</h3>
                    <p className="text-xs text-forest font-mono leading-relaxed opacity-70 line-clamp-2">{item.summary}</p>
                    <div className="flex items-center gap-6 pt-1">
                      <button onClick={(e) => { e.stopPropagation(); playTrack({ id: item.story_id, title: item.title, summary: item.summary, source: item.source }); }} className="mono-ui text-[9px] text-primary flex items-center gap-2 hover:text-white transition-colors" data-testid={`play-bookmark-${item.story_id}`}>
                        {currentTrack?.id === item.story_id && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isCached(item.story_id) ? 'PLAY_OFFLINE' : 'GENERATE_AUDIO'}</span>
                      </button>
                      <div className="flex-1 h-[1px] bg-forest/10" />
                      <span className="mono-ui text-[8px] text-forest/50">SAVED: {new Date(item.saved_at).toLocaleDateString()}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleRemove(item.story_id); }} className="text-forest hover:text-red-400 transition-colors" data-testid={`remove-bookmark-${item.story_id}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default BookmarksPage;

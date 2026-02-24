import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { getAllCachedIds, removeCachedAudio } from '../lib/audioCache';
import { Bookmark, Play, Pause, Trash, Check } from '@phosphor-icons/react';
import { ListSkeleton } from '../components/Skeleton';

const BookmarksPage = () => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { bookmarks, loading } = useBookmarks();
  const { removeBookmark } = useBookmarks();
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
      <div className="h-12 md:h-14 flex items-center justify-between px-4 md:px-8 bg-surface/30 narvo-border-b shrink-0">
        <span className="mono-ui text-[10px] md:text-xs text-forest">MODULE: <span className="text-primary">SAVED_TRANSMISSIONS</span></span>
        <span className="mono-ui text-[10px] md:text-xs text-forest">{bookmarks.length} ITEMS</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <ListSkeleton count={3} />
          ) : (
            <>
              {bookmarks.length > 0 && (
                <div className="narvo-border bg-surface/20 p-3 md:p-4 mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary animate-pulse" />
                    <span className="mono-ui text-[9px] md:text-[10px] text-forest">OFFLINE_CACHE: <span className="text-primary">{cachedIds.filter(id => bookmarks.some(b => b.story_id === id)).length} / {bookmarks.length}</span></span>
                  </div>
                  <span className="mono-ui text-[8px] md:text-[9px] text-forest/50 sm:ml-auto">Play to cache audio</span>
                </div>
              )}

              {bookmarks.length === 0 ? (
                <div className="narvo-border bg-surface/20 p-8 md:p-12 text-center">
                  <Bookmark className="w-10 h-10 md:w-12 md:h-12 text-forest mx-auto mb-3 md:mb-4" />
                  <h3 className="font-display text-lg md:text-xl text-content mb-2 uppercase">No Saved Stories</h3>
                  <p className="text-forest text-xs md:text-sm mb-4 md:mb-6 font-mono">Bookmark stories to access them offline.</p>
                  <Link to="/dashboard" className="bg-primary text-background-dark font-display font-bold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base hover:bg-white transition-all inline-block" data-testid="go-to-feed-btn">
                    [Go to Feed]
                  </Link>
                </div>
              ) : (
                <div className="narvo-border bg-surface/20 divide-y divide-forest/10" data-testid="bookmarks-list">
                  {bookmarks.map((item) => (
                    <div key={item.story_id} className="p-4 md:p-6 group hover:bg-surface/40 transition-colors cursor-pointer" onClick={() => navigate(`/news/${item.story_id}`)} data-testid={`bookmark-card-${item.story_id}`}>
                      <div className="flex flex-col gap-2 md:gap-3">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className="bg-forest/20 text-primary mono-ui text-[8px] md:text-[9px] px-1.5 md:px-2 py-0.5 border border-forest/30">{item.category?.toUpperCase()}</span>
                            {isCached(item.story_id) && (
                              <span className="mono-ui text-[7px] md:text-[8px] text-forest flex items-center gap-1 border border-forest/30 px-1 md:px-1.5 py-0.5" data-testid={`cached-badge-${item.story_id}`}>
                                <Check className="w-2.5 h-2.5 md:w-3 md:h-3" /> CACHED
                              </span>
                            )}
                          </div>
                          <span className="mono-ui text-[7px] md:text-[8px] text-forest/50">{item.source}</span>
                        </div>
                        <h3 className="font-display text-base md:text-xl font-bold uppercase tracking-tight text-content group-hover:text-primary transition-colors leading-tight">{item.title}</h3>
                        <p className="text-xs md:text-sm text-forest font-mono leading-relaxed opacity-70 line-clamp-2">{item.summary}</p>
                        <div className="flex items-center gap-3 md:gap-6 pt-1">
                          <button onClick={(e) => { e.stopPropagation(); playTrack({ id: item.story_id, title: item.title, summary: item.summary, source: item.source }); }} className="mono-ui text-[9px] md:text-[10px] text-primary flex items-center gap-2 hover:text-content transition-colors" data-testid={`play-bookmark-${item.story_id}`}>
                            {currentTrack?.id === item.story_id && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isCached(item.story_id) ? 'PLAY_OFFLINE' : 'GENERATE_AUDIO'}</span>
                            <span className="sm:hidden">PLAY</span>
                          </button>
                          <div className="flex-1 h-[1px] bg-forest/10 hidden md:block" />
                          <span className="mono-ui text-[7px] md:text-[8px] text-forest/50 hidden md:inline">SAVED: {new Date(item.saved_at).toLocaleDateString()}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleRemove(item.story_id); }} className="text-forest hover:text-red-400 transition-colors ml-auto md:ml-0" data-testid={`remove-bookmark-${item.story_id}`}>
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default BookmarksPage;

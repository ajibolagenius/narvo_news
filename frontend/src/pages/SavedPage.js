import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Bookmark, Play, Trash2, Clock, Radio, Filter,
  ListPlus, Download, ArrowRight
} from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const SavedPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const { playTrack, addToQueue, currentTrack, isPlaying } = useAudio();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      // Try to get from backend first
      const res = await fetch(`${API_URL}/api/bookmarks?user_id=guest`);
      if (res.ok) {
        const data = await res.json();
        setSavedItems(data);
      } else {
        // Fallback to localStorage
        const local = JSON.parse(localStorage.getItem('narvo_bookmarks') || '[]');
        setSavedItems(local);
      }
    } catch (e) {
      // Fallback to localStorage
      const local = JSON.parse(localStorage.getItem('narvo_bookmarks') || '[]');
      setSavedItems(local);
    }
    setLoading(false);
  };

  const removeBookmark = async (itemId) => {
    try {
      await fetch(`${API_URL}/api/bookmark`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'guest', story_id: itemId })
      });
    } catch (e) {
      console.error('Error removing bookmark:', e);
    }
    
    // Update local state and storage
    const updated = savedItems.filter(item => item.id !== itemId);
    setSavedItems(updated);
    localStorage.setItem('narvo_bookmarks', JSON.stringify(updated));
  };

  const handlePlay = (item) => {
    playTrack({
      id: item.id,
      title: item.title,
      source: item.source,
      narrative: item.narrative || item.summary,
      audio_url: item.audio_url
    });
  };

  const playAll = () => {
    if (filteredItems.length > 0) {
      filteredItems.forEach(item => addToQueue(item));
      handlePlay(filteredItems[0]);
    }
  };

  const downloadForOffline = async (item) => {
    // Store in IndexedDB for offline access
    try {
      const request = indexedDB.open('narvo_offline', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('articles')) {
          db.createObjectStore('articles', { keyPath: 'id' });
        }
      };
      request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('articles', 'readwrite');
        const store = tx.objectStore('articles');
        store.put({ ...item, savedAt: new Date().toISOString() });
      };
    } catch (e) {
      console.error('Error saving offline:', e);
    }
  };

  // Filter and sort
  const filteredItems = savedItems
    .filter(item => {
      if (filter === 'all') return true;
      return item.category?.toLowerCase() === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.savedAt || b.published) - new Date(a.savedAt || a.published);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const categories = [...new Set(savedItems.map(item => item.category?.toLowerCase()).filter(Boolean))];

  return (
    <main className="flex-1 flex flex-col bg-[#0a0a0a] min-h-0 overflow-hidden" data-testid="saved-page">
      {/* Header */}
      <header className="border-b border-[#333333] bg-[#111111] shrink-0">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4FF00]/10 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-[#D4FF00]" />
              </div>
              <div>
                <h1 className="font-display text-xl md:text-2xl font-bold text-white uppercase tracking-tight">SAVED_STORIES</h1>
                <span className="font-mono text-[10px] text-[#525252]">{savedItems.length} ITEMS_BOOKMARKED</span>
              </div>
            </div>
            
            {savedItems.length > 0 && (
              <button
                onClick={playAll}
                className="h-10 px-4 bg-[#D4FF00] text-[#0a0a0a] font-mono text-[10px] font-bold hover:bg-white transition-all flex items-center gap-2"
                data-testid="play-all-btn"
              >
                <Play className="w-4 h-4" />
                PLAY_ALL
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#525252]" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-8 px-3 bg-[#0a0a0a] border border-[#333333] font-mono text-[10px] text-[#8BAE66] focus:outline-none focus:border-[#D4FF00]"
                data-testid="filter-select"
              >
                <option value="all">ALL_CATEGORIES</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#525252]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 px-3 bg-[#0a0a0a] border border-[#333333] font-mono text-[10px] text-[#8BAE66] focus:outline-none focus:border-[#D4FF00]"
                data-testid="sort-select"
              >
                <option value="date">SORT_BY_DATE</option>
                <option value="title">SORT_BY_TITLE</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border border-[#333333] bg-[#111111] flex items-center gap-4">
                  <Skeleton className="w-12 h-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-3/4 h-4" />
                    <Skeleton variant="text" className="w-1/2 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : savedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 border border-dashed border-[#333333] flex items-center justify-center mb-6">
                <Bookmark className="w-12 h-12 text-[#333333]" />
              </div>
              <h2 className="font-display text-xl font-bold text-white uppercase mb-3">NO_SAVED_STORIES</h2>
              <p className="font-mono text-[11px] text-[#525252] text-center max-w-md mb-6">
                Bookmark stories from the feed to access them later. Your saved items will appear here.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="h-10 px-6 bg-[#D4FF00] text-[#0a0a0a] font-mono text-[10px] font-bold hover:bg-white transition-all flex items-center gap-2"
              >
                BROWSE_FEED
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const isCurrentlyPlaying = currentTrack?.id === item.id && isPlaying;
                return (
                  <div
                    key={item.id}
                    className="border border-[#333333] bg-[#111111] p-4 flex items-start gap-4 hover:border-[#628141] transition-all group"
                    data-testid={`saved-${item.id}`}
                  >
                    <button
                      onClick={() => handlePlay(item)}
                      className={`w-12 h-12 shrink-0 flex items-center justify-center transition-all ${
                        isCurrentlyPlaying ? 'bg-white text-[#0a0a0a]' : 'bg-[#D4FF00]/10 text-[#D4FF00] hover:bg-[#D4FF00] hover:text-[#0a0a0a]'
                      }`}
                      data-testid={`play-${item.id}`}
                    >
                      {isCurrentlyPlaying ? (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map(i => <div key={i} className="w-1 bg-current animate-pulse" style={{ height: `${8 + i * 4}px` }} />)}
                        </div>
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/news/${item.id}`)}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] text-[#D4FF00] uppercase">{item.category || 'GENERAL'}</span>
                        <span className="text-[#333333]">•</span>
                        <span className="font-mono text-[9px] text-[#525252]">{item.source}</span>
                        {item.savedAt && (
                          <>
                            <span className="text-[#333333]">•</span>
                            <span className="font-mono text-[9px] text-[#525252]">
                              Saved {new Date(item.savedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display text-sm font-bold text-white uppercase leading-tight line-clamp-2 group-hover:text-[#D4FF00] transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => addToQueue(item)}
                        className="p-2 text-[#525252] hover:text-[#D4FF00] transition-colors"
                        title="Add to queue"
                        data-testid={`queue-${item.id}`}
                      >
                        <ListPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadForOffline(item)}
                        className="p-2 text-[#525252] hover:text-[#628141] transition-colors"
                        title="Save offline"
                        data-testid={`offline-${item.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeBookmark(item.id)}
                        className="p-2 text-[#525252] hover:text-red-500 transition-colors"
                        title="Remove"
                        data-testid={`remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default SavedPage;

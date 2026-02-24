import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Play, Pause, Trash, WarningOctagon, ArrowCounterClockwise, Funnel, Waves, Microphone, SpeakerHigh, WifiSlash, CloudArrowDown, Article, CheckCircle } from '@phosphor-icons/react';
import { useAudio } from '../contexts/AudioContext';
import { getAllCachedAudio, getCachedAudio, removeCachedAudio, getCacheStats, clearAllCache } from '../lib/audioCache';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const OfflinePage = () => {
  const navigate = useNavigate();
  const [cachedItems, setCachedItems] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [cacheStats, setCacheStats] = useState({ totalSize: 0, formattedSize: '0 KB', offlineReady: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [offlineStats, setOfflineStats] = useState({ article_count: 0 });
  const { playTrack, currentTrack, isPlaying, pauseTrack } = useAudio();

  useEffect(() => {
    loadAllOfflineContent();
  }, []);

  const loadAllOfflineContent = async () => {
    setLoading(true);
    await Promise.all([loadCachedItems(), loadSavedArticles(), loadOfflineStats()]);
    setLoading(false);
  };
  
  const loadOfflineStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/offline/stats`);
      if (res.ok) {
        const data = await res.json();
        setOfflineStats(data);
      }
    } catch (e) {
      console.error('Error loading offline stats:', e);
    }
  };
  
  const loadSavedArticles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/offline/articles`);
      if (res.ok) {
        const articles = await res.json();
        setSavedArticles(articles.map(a => ({
          id: a.story_id,
          title: a.title || `Article_${a.story_id.slice(0, 8)}`,
          metadata: `${a.source || 'SAVED'} // ${a.category || 'GENERAL'}`,
          duration: '--:--',
          size: 0,
          type: 'article',
          timestamp: a.saved_at || Date.now(),
          status: 'complete',
          narrative: a.narrative,
          summary: a.summary,
          image_url: a.image_url
        })));
      }
    } catch (e) {
      console.error('Error loading saved articles:', e);
    }
  };

  const loadCachedItems = async () => {
    try {
      // Get all cached audio with metadata
      const items = await getAllCachedAudio();
      const stats = await getCacheStats();
      
      setCachedItems(items.map(item => ({
        id: item.id,
        title: item.title || `Audio_${item.id.slice(0, 8)}`,
        metadata: item.source || 'CACHED',
        duration: item.duration || '--:--',
        size: item.size || 0,
        type: item.type || 'audio',
        timestamp: item.cached_at,
        status: item.hasBlob ? 'complete' : 'url_only',
        hasBlob: item.hasBlob
      })));
      
      setCacheStats(stats);
            title: cached.title || `Audio_${id.slice(0, 8)}.wav`,
            metadata: cached.metadata || 'CACHED_AUDIO // LOCAL_STORAGE',
            duration: cached.duration || '--:--',
            size: itemSize,
            type: 'audio',
            timestamp: cached.timestamp || Date.now(),
            status: 'complete'
          });
        }
      }
      
      setCachedItems(items);
      setTotalSize(size);
    } catch (e) {
      console.error('Error loading cached items:', e);
    }
    setLoading(false);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRemove = async (id, type) => {
    if (type === 'article') {
      try {
        await fetch(`${API_URL}/api/offline/articles/${id}`, { method: 'DELETE' });
        await loadSavedArticles();
        await loadOfflineStats();
      } catch (e) {
        console.error('Error removing saved article:', e);
      }
    } else {
      await removeCachedAudio(id);
      await loadCachedItems();
    }
  };

  const handleClearAll = async () => {
    // Clear audio cache
    for (const item of cachedItems) {
      await removeCachedAudio(item.id);
    }
    // Clear saved articles from backend
    try {
      await fetch(`${API_URL}/api/offline/articles`, { method: 'DELETE' });
    } catch (e) {
      console.error('Error clearing articles:', e);
    }
    await loadAllOfflineContent();
  };

  const handlePlay = async (item) => {
    if (currentTrack?.id === item.id && isPlaying) {
      pauseTrack();
    } else if (item.type === 'article') {
      // For articles, play the narrative/summary as TTS
      playTrack({ 
        id: item.id, 
        title: item.title, 
        summary: item.narrative || item.summary || item.title 
      });
    } else {
      const cached = await getCachedAudio(item.id);
      if (cached?.audioBlob) {
        const audioUrl = URL.createObjectURL(cached.audioBlob);
        playTrack({ id: item.id, title: item.title, audio_url: audioUrl });
      }
    }
  };

  // Combine cached audio and saved articles
  const allItems = [...cachedItems, ...savedArticles];
  const usagePercent = (totalSize / (50 * 1024 * 1024 * 1024)) * 100; // 50GB limit
  const filteredItems = filterType === 'all' 
    ? allItems 
    : filterType === 'audio' 
      ? cachedItems 
      : filterType === 'article' 
        ? savedArticles
        : allItems.filter(i => i.type === filterType);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <main className="flex-1 overflow-y-auto custom-scroll p-4 md:p-10 space-y-8 md:space-y-12 max-w-7xl mx-auto w-full pb-20 md:pb-10 min-h-0" data-testid="offline-page">
      {/* Storage Header */}
      <section className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FolderOpen className="w-4 h-4" />
              <span className="mono-ui text-[9px] md:text-[10px] font-bold tracking-[0.2em]">LOCAL_STORAGE_INDEX</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-content leading-none">
              Cached <span className="text-primary">Archives.</span>
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end mono-ui text-[9px] md:text-[10px]">
            <span className="text-forest tracking-wider mb-1 md:mb-2 font-bold">CAPACITY_LIMIT</span>
            <div className="text-content text-base md:text-lg">
              {formatSize(totalSize)} <span className="text-forest">/ 50.0 GB</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 md:h-3 narvo-border p-[1px] bg-surface/20">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
        </div>
        <div className="flex justify-between mono-ui text-[8px] md:text-[9px] text-forest font-bold">
          <span>00.0%</span>
          <span className="text-primary">{usagePercent.toFixed(1)}% // ACTIVE_USAGE</span>
          <span>100.0%</span>
        </div>
      </section>

      {/* Command Bar */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6 py-4 md:py-6 narvo-border-b border-forest/30">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <button className="flex items-center gap-2 md:gap-3 narvo-border px-4 md:px-6 py-2 mono-ui text-[9px] md:text-[10px] font-bold text-content hover:bg-primary hover:text-background-dark transition-all group">
            <Funnel className="w-4 h-4" />
            <span>FILTER</span>
          </button>
          <div className="h-4 w-px bg-forest/30 hidden sm:block" />
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-3 md:px-4 py-1 md:py-1.5 mono-ui text-[9px] md:text-[10px] font-bold ${filterType === 'all' ? 'bg-primary text-background-dark' : 'text-forest hover:text-content transition-colors'}`}
              data-testid="filter-all"
            >
              ALL ({allItems.length})
            </button>
            <button 
              onClick={() => setFilterType('audio')}
              className={`px-3 md:px-4 py-1 md:py-1.5 mono-ui text-[9px] md:text-[10px] font-bold ${filterType === 'audio' ? 'bg-primary text-background-dark' : 'text-forest hover:text-content transition-colors'}`}
              data-testid="filter-audio"
            >
              AUDIO ({cachedItems.length})
            </button>
            <button 
              onClick={() => setFilterType('article')}
              className={`px-3 md:px-4 py-1 md:py-1.5 mono-ui text-[9px] md:text-[10px] font-bold ${filterType === 'article' ? 'bg-primary text-background-dark' : 'text-forest hover:text-content transition-colors'}`}
              data-testid="filter-article"
            >
              ARTICLES ({savedArticles.length})
            </button>
          </div>
        </div>
        <button 
          onClick={handleClearAll}
          className="flex items-center gap-2 mono-ui text-[9px] md:text-[10px] font-bold text-forest hover:text-primary transition-colors"
          data-testid="clear-cache-btn"
        >
          <Trash className="w-4 h-4" />
          <span>CLEAR_LOCAL_CACHE</span>
        </button>
      </section>

      {/* File Table */}
      <section className="narvo-border bg-surface/5">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-3 md:gap-6 px-4 md:px-6 py-3 md:py-4 narvo-border-b bg-surface/30 mono-ui text-[9px] md:text-[10px] text-forest font-bold">
          <div className="col-span-1 text-center">SIG</div>
          <div className="col-span-11 md:col-span-5">FILE_IDENTIFIER</div>
          <div className="col-span-2 hidden md:block text-right">DURATION</div>
          <div className="col-span-2 hidden md:block text-right">STORAGE_SIZE</div>
          <div className="col-span-2 text-right">ACTION</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-forest/10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 md:gap-6 px-4 md:px-6 py-4 md:py-5 items-center">
                <div className="col-span-1 flex justify-center">
                  <Skeleton className="w-5 h-5" />
                </div>
                <div className="col-span-11 md:col-span-5 flex flex-col gap-1">
                  <Skeleton variant="text" className="w-48 h-4" />
                  <Skeleton variant="text" className="w-32 h-3" />
                </div>
                <div className="col-span-2 hidden md:block text-right">
                  <Skeleton variant="text" className="w-12 h-3 ml-auto" />
                </div>
                <div className="col-span-2 hidden md:block text-right">
                  <Skeleton variant="text" className="w-16 h-3 ml-auto" />
                </div>
              </div>
            ))
          ) : paginatedItems.length === 0 ? (
            <div className="p-8 md:p-12 relative overflow-hidden min-h-[300px] flex items-center justify-center" data-testid="offline-empty-state">
              {/* Matrix Background */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#628141 1px, transparent 1px), linear-gradient(90deg, #628141 1px, transparent 1px)', backgroundSize: '40px 40px' }}
              />
              
              <div className="bg-background-dark narvo-border p-6 md:p-10 max-w-md w-full text-center shadow-xl backdrop-blur-md relative z-10">
                <div className="mb-4 md:mb-6 flex justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-surface narvo-border border-dashed flex items-center justify-center relative">
                    <WifiSlash className="w-8 h-8 md:w-10 md:h-10 text-forest" />
                  </div>
                </div>
                
                <h3 className="font-display text-xl md:text-2xl font-bold text-content mb-3 uppercase tracking-tighter">
                  NO CACHED DATA
                </h3>
                <p className="text-forest text-xs md:text-sm mono-ui leading-relaxed mb-6 lowercase">
                  No offline content is available. Play stories while online to automatically cache audio for offline listening.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="h-10 md:h-12 px-5 md:px-6 bg-primary text-background-dark font-bold mono-ui text-[9px] md:text-[10px] hover:bg-white transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowCounterClockwise className="w-4 h-4" />
                    GO ONLINE
                  </button>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="h-10 md:h-12 px-5 md:px-6 narvo-border text-primary font-bold mono-ui text-[9px] md:text-[10px] hover:bg-primary hover:text-background-dark transition-all"
                  >
                    MANAGE STORAGE
                  </button>
                </div>
                
                <div className="mt-6 pt-4 narvo-border-t flex justify-between items-center text-[7px] md:text-[8px] mono-ui font-bold text-forest">
                  <span>ERR_CODE: 0x00_CACHE_EMPTY</span>
                  <span>NARVO_SYS_V2.6</span>
                </div>
              </div>
            </div>
          ) : (
            paginatedItems.map((item, index) => {
              const isActive = currentTrack?.id === item.id && isPlaying;
              const isCorrupted = item.status === 'corrupted';
              
              return (
                <div 
                  key={item.id}
                  className={`grid grid-cols-12 gap-3 md:gap-6 px-4 md:px-6 py-4 md:py-5 items-center transition-colors group cursor-pointer relative overflow-hidden
                    ${isActive ? 'bg-primary/5' : isCorrupted ? 'opacity-40 hover:opacity-100 cursor-not-allowed' : 'hover:bg-surface/20'}
                  `}
                  data-testid={`cached-item-${item.id}`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />}
                  
                  <div className={`col-span-1 flex justify-center ${isActive ? 'text-primary animate-pulse' : isCorrupted ? 'text-primary/50' : 'text-primary'}`}>
                    {isCorrupted ? (
                      <WarningOctagon className="w-4 h-4 md:w-5 md:h-5" />
                    ) : isActive ? (
                      <SpeakerHigh className="w-4 h-4 md:w-5 md:h-5" />
                    ) : item.type === 'article' ? (
                      <Article className="w-4 h-4 md:w-5 md:h-5" />
                    ) : item.type === 'audio' ? (
                      <Waves className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <Microphone className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </div>
                  
                  <div className="col-span-11 md:col-span-5 flex flex-col gap-1 min-w-0">
                    <span className={`mono-ui text-[10px] md:text-[11px] font-bold truncate ${isActive ? 'text-primary' : isCorrupted ? 'italic' : 'text-content'} group-hover:text-primary transition-colors`}>
                      {item.title}
                    </span>
                    <span className={`mono-ui text-[8px] md:text-[9px] truncate tracking-widest ${isActive ? 'text-primary/70' : 'text-forest'}`}>
                      {item.metadata}
                    </span>
                  </div>
                  
                  <div className={`col-span-2 hidden md:block text-right mono-ui text-[9px] md:text-[10px] ${isActive ? 'text-primary' : 'text-forest'}`}>
                    {formatDuration(item.duration)}
                  </div>
                  
                  <div className={`col-span-2 hidden md:block text-right mono-ui text-[9px] md:text-[10px] ${isActive ? 'text-primary' : 'text-forest'}`}>
                    {formatSize(item.size)}
                  </div>
                  
                  <div className={`col-span-2 flex items-center justify-end gap-2 md:gap-3 ${isActive ? '' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    {isCorrupted ? (
                      <button className="text-content hover:text-primary">
                        <ArrowCounterClockwise className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePlay(item)}
                        className={`${isActive ? 'text-primary' : 'text-content'} hover:text-primary`}
                        data-testid={`play-cached-${item.id}`}
                      >
                        {isActive ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />}
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemove(item.id, item.type)}
                      className={`${isActive ? 'text-primary/50' : 'text-content'} hover:text-primary`}
                      data-testid={`remove-cached-${item.id}`}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Pagination */}
      {!loading && filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 mono-ui text-[9px] md:text-[10px] text-forest font-bold">
          <span>SHOWING: {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredItems.length)} {'// '}TOTAL: {filteredItems.length}_ITEMS</span>
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-content transition-colors'}
            >
              PREV_SIGNAL
            </button>
            <div className="flex gap-3 md:gap-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 3).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? 'text-primary underline underline-offset-4 decoration-2' : 'hover:text-content transition-colors'}
                >
                  {String(page).padStart(2, '0')}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'text-content hover:text-primary transition-colors'}
            >
              NEXT_SIGNAL
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default OfflinePage;

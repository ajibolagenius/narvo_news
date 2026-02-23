import React, { useState, useEffect } from 'react';
import { FolderOpen, Play, Pause, Trash2, AlertOctagon, RotateCcw, Filter, Waves, Mic, Speaker } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { getAllCachedIds, getCachedAudio, removeCachedAudio } from '../lib/audioCache';
import Skeleton from '../components/Skeleton';

const OfflinePage = () => {
  const [cachedItems, setCachedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [totalSize, setTotalSize] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { playTrack, currentTrack, isPlaying, pauseTrack } = useAudio();

  useEffect(() => {
    loadCachedItems();
  }, []);

  const loadCachedItems = async () => {
    setLoading(true);
    try {
      const ids = await getAllCachedIds();
      const items = [];
      let size = 0;
      
      for (const id of ids) {
        const cached = await getCachedAudio(id);
        if (cached) {
          const itemSize = cached.audioBlob?.size || 0;
          size += itemSize;
          items.push({
            id,
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

  const handleRemove = async (id) => {
    await removeCachedAudio(id);
    await loadCachedItems();
  };

  const handleClearAll = async () => {
    for (const item of cachedItems) {
      await removeCachedAudio(item.id);
    }
    await loadCachedItems();
  };

  const handlePlay = async (item) => {
    if (currentTrack?.id === item.id && isPlaying) {
      pauseTrack();
    } else {
      const cached = await getCachedAudio(item.id);
      if (cached?.audioBlob) {
        const audioUrl = URL.createObjectURL(cached.audioBlob);
        playTrack({ id: item.id, title: item.title, audio_url: audioUrl });
      }
    }
  };

  const usagePercent = (totalSize / (50 * 1024 * 1024 * 1024)) * 100; // 50GB limit
  const filteredItems = filterType === 'all' ? cachedItems : cachedItems.filter(i => i.type === filterType);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <main className="flex-1 overflow-y-auto custom-scroll p-4 md:p-10 space-y-8 md:space-y-12 max-w-7xl mx-auto w-full pb-20 md:pb-10" data-testid="offline-page">
      {/* Storage Header */}
      <section className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FolderOpen className="w-4 h-4" />
              <span className="mono-ui text-[9px] md:text-[10px] font-bold tracking-[0.2em]">LOCAL_STORAGE_INDEX</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-white leading-none">
              Cached <span className="text-primary">Archives.</span>
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end mono-ui text-[9px] md:text-[10px]">
            <span className="text-forest tracking-wider mb-1 md:mb-2 font-bold">CAPACITY_LIMIT</span>
            <div className="text-white text-base md:text-lg">
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
          <button className="flex items-center gap-2 md:gap-3 narvo-border px-4 md:px-6 py-2 mono-ui text-[9px] md:text-[10px] font-bold text-white hover:bg-primary hover:text-background-dark transition-all group">
            <Filter className="w-4 h-4" />
            <span>FILTER</span>
          </button>
          <div className="h-4 w-px bg-forest/30 hidden sm:block" />
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-3 md:px-4 py-1 md:py-1.5 mono-ui text-[9px] md:text-[10px] font-bold ${filterType === 'all' ? 'bg-primary text-background-dark' : 'text-forest hover:text-white transition-colors'}`}
              data-testid="filter-all"
            >
              ALL
            </button>
            <button 
              onClick={() => setFilterType('audio')}
              className={`px-3 md:px-4 py-1 md:py-1.5 mono-ui text-[9px] md:text-[10px] font-bold ${filterType === 'audio' ? 'bg-primary text-background-dark' : 'text-forest hover:text-white transition-colors'}`}
              data-testid="filter-audio"
            >
              AUDIO
            </button>
            <button 
              onClick={() => setFilterType('text')}
              className={`px-3 md:px-4 py-1 md:py-1.5 mono-ui text-[9px] md:text-[10px] font-bold ${filterType === 'text' ? 'bg-primary text-background-dark' : 'text-forest hover:text-white transition-colors'}`}
              data-testid="filter-text"
            >
              TEXT
            </button>
          </div>
        </div>
        <button 
          onClick={handleClearAll}
          className="flex items-center gap-2 mono-ui text-[9px] md:text-[10px] font-bold text-forest hover:text-primary transition-colors"
          data-testid="clear-cache-btn"
        >
          <Trash2 className="w-4 h-4" />
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
            <div className="p-8 md:p-12 text-center">
              <FolderOpen className="w-10 h-10 md:w-12 md:h-12 text-forest mx-auto mb-3 md:mb-4" />
              <p className="mono-ui text-[10px] md:text-xs text-forest">NO_CACHED_FILES_DETECTED</p>
              <p className="mono-ui text-[9px] md:text-[10px] text-forest/50 mt-2">Play stories to cache audio for offline</p>
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
                      <AlertOctagon className="w-4 h-4 md:w-5 md:h-5" />
                    ) : isActive ? (
                      <Speaker className="w-4 h-4 md:w-5 md:h-5" />
                    ) : item.type === 'audio' ? (
                      <Waves className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <Mic className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </div>
                  
                  <div className="col-span-11 md:col-span-5 flex flex-col gap-1 min-w-0">
                    <span className={`mono-ui text-[10px] md:text-[11px] font-bold truncate ${isActive ? 'text-primary' : isCorrupted ? 'italic' : 'text-white'} group-hover:text-primary transition-colors`}>
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
                      <button className="text-white hover:text-primary">
                        <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePlay(item)}
                        className={`${isActive ? 'text-primary' : 'text-white'} hover:text-primary`}
                        data-testid={`play-cached-${item.id}`}
                      >
                        {isActive ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />}
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className={`${isActive ? 'text-primary/50' : 'text-white'} hover:text-primary`}
                      data-testid={`remove-cached-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
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
              className={currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-white transition-colors'}
            >
              PREV_SIGNAL
            </button>
            <div className="flex gap-3 md:gap-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 3).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? 'text-primary underline underline-offset-4 decoration-2' : 'hover:text-white transition-colors'}
                >
                  {String(page).padStart(2, '0')}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'text-white hover:text-primary transition-colors'}
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

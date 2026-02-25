import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Archive, Trash, ArrowUpRight, Bookmark, Planet, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useBookmarks } from '../hooks/useBookmarks';
import Skeleton from '../components/Skeleton';

const SavedPage = () => {
  const navigate = useNavigate();
  const { bookmarks, loading, removeBookmark } = useBookmarks();
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === bookmarks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bookmarks.map(b => b.story_id));
    }
  };

  const deleteSelected = () => {
    selectedIds.forEach(id => removeBookmark(id));
    setSelectedIds([]);
  };

  const getCategoryColor = (category) => {
    const colors = {
      finance: 'bg-primary',
      tech: 'bg-red-400',
      politics: 'bg-primary',
      culture: 'bg-forest',
      design: 'bg-forest',
    };
    return colors[category?.toLowerCase()] || 'bg-forest';
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'SAVED_RECENTLY';
    const now = new Date();
    const saved = new Date(date);
    const diffHours = Math.floor((now - saved) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'SAVED_NOW';
    if (diffHours < 24) return `SAVED_${diffHours}H_AGO`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}_DAYS_AGO`;
  };

  return (
    <main className="flex-1 overflow-y-auto custom-scroll p-4 md:p-10 max-w-7xl mx-auto w-full pb-32 md:pb-10 min-h-0" data-testid="saved-page">
      {/* Dashboard Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 mb-8 md:mb-12 border-b border-forest/30 pb-6 md:pb-10">
        <div className="space-y-2 md:space-y-4">
          <h2 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tighter text-content leading-none">
            Saved <span className="text-primary">Stories.</span>
          </h2>
          <p className="mono-ui text-[11px] md:text-[12px] text-forest font-bold tracking-[0.3em]">
            LIBRARY_ROOT // ARCHIVE_SEGMENT // SYNCED_NODES
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <button 
            onClick={selectAll}
            className="flex items-center gap-2 md:gap-3 bg-primary text-background-dark px-4 md:px-6 py-2 md:py-3 mono-ui text-[12px] md:text-[13px] font-bold hover:bg-white transition-colors"
            data-testid="select-all-btn"
          >
            <CheckSquare className="w-4 h-4" />
            <span>SELECT_ALL</span>
          </button>
          <button className="flex items-center gap-2 md:gap-3 narvo-border px-4 md:px-6 py-2 md:py-3 mono-ui text-[12px] md:text-[13px] font-bold text-content hover:bg-forest transition-colors">
            <Archive className="w-4 h-4" />
            <span>ARCHIVE_X</span>
          </button>
          <button 
            onClick={deleteSelected}
            disabled={selectedIds.length === 0}
            className={`flex items-center gap-2 md:gap-3 narvo-border px-4 md:px-6 py-2 md:py-3 mono-ui text-[12px] md:text-[13px] font-bold transition-colors ${
              selectedIds.length > 0 
                ? 'text-red-400 hover:bg-red-400 hover:text-content' 
                : 'text-forest/50 cursor-not-allowed'
            }`}
            data-testid="delete-selected-btn"
          >
            <Trash className="w-4 h-4" />
            <span>DELETE_SIG</span>
          </button>
        </div>
      </section>

      {/* Grid Matrix */}
      {loading ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface/5 narvo-border p-6 md:p-8 h-full flex flex-col gap-4 md:gap-6">
              <Skeleton variant="text" className="w-32 h-4" />
              <Skeleton variant="text" className="w-full h-8" />
              <Skeleton variant="text" className="w-3/4 h-8" />
              <div className="mt-auto pt-4 md:pt-6">
                <Skeleton variant="text" className="w-24 h-3" />
              </div>
            </div>
          ))}
        </section>
      ) : bookmarks.length === 0 ? (
        <section className="narvo-border bg-surface/5 relative overflow-hidden min-h-[400px] flex items-center justify-center" data-testid="saved-empty-state">
          {/* Matrix Background */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(#628141 1px, transparent 1px), linear-gradient(90deg, #628141 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
          
          <div className="bg-background-dark narvo-border p-8 md:p-12 max-w-lg w-full mx-4 text-center shadow-2xl backdrop-blur-md relative z-10">
            {/* Icon */}
            <div className="mb-6 md:mb-8 flex justify-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-surface narvo-border border-dashed flex items-center justify-center relative">
                <div className="absolute inset-0 border border-primary/20 animate-ping" />
                <Planet className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
            </div>

            {/* Title & Message */}
            <h3 className="font-display text-2xl md:text-3xl font-bold text-content mb-4 uppercase tracking-tighter">
              ARCHIVE EMPTY
            </h3>
            <p className="text-forest text-sm mono-ui leading-relaxed mb-8 md:mb-10 lowercase">
              You have not saved any stories yet. Bookmark articles from the feed to access them offline and build your personal archive.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/dashboard')}
                className="h-12 md:h-14 px-6 md:px-8 bg-primary text-background-dark font-bold mono-ui text-[12px] md:text-[13px] hover:bg-white transition-all flex items-center justify-center gap-3"
                data-testid="go-to-feed-btn"
              >
                <ArrowCounterClockwise className="w-4 h-4 md:w-5 md:h-5" />
                GO TO FEED
              </button>
              <button 
                onClick={() => navigate('/discover')}
                className="h-12 md:h-14 px-6 md:px-8 narvo-border text-primary font-bold mono-ui text-[12px] md:text-[13px] hover:bg-primary hover:text-background-dark transition-all"
              >
                BROWSE TRENDING
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 md:mt-10 pt-6 narvo-border-t flex justify-between items-center text-[10px] md:text-[11px] mono-ui font-bold text-forest">
              <span>ERR_CODE: 0x00_NO_SAVES</span>
              <span>NARVO_SYS_V2.6</span>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" data-testid="saved-stories-grid">
          {bookmarks.map((item, index) => (
            <article 
              key={item.story_id}
              onClick={() => navigate(`/news/${item.story_id}`)}
              className="bg-surface/5 narvo-border p-6 md:p-8 h-full flex flex-col justify-between group hover:bg-surface/20 transition-all cursor-pointer relative"
              data-testid={`saved-card-${item.story_id}`}
            >
              {/* Checkbox on hover */}
              <div 
                className={`absolute top-4 md:top-6 right-4 md:right-6 transition-opacity ${
                  selectedIds.includes(item.story_id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(item.story_id)}
                  onChange={(e) => toggleSelect(item.story_id, e)}
                  className="w-5 h-5 md:w-6 md:h-6 bg-transparent narvo-border border-forest/50 text-primary focus:ring-0 cursor-pointer"
                  data-testid={`checkbox-${item.story_id}`}
                />
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <span className={`w-2 h-2 ${getCategoryColor(item.category)}`} />
                  <span className="mono-ui text-[10px] md:text-[11px] text-forest font-bold tracking-widest uppercase">
                    {item.source || item.category || 'NEWS_DESK'}
                  </span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold leading-tight text-content group-hover:text-primary transition-colors uppercase line-clamp-3">
                  {item.title}
                </h3>
              </div>
              
              <div className="mt-6 md:mt-8 pt-4 md:pt-6 narvo-border-t flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <span className="mono-ui text-[10px] md:text-[11px] text-primary font-bold">
                    {formatTimeAgo(item.saved_at)}
                  </span>
                  <span className="mono-ui text-[11px] md:text-[12px] text-forest font-bold opacity-70">
                    {item.tags?.slice(0, 2).map(t => `#${t.toUpperCase()}`).join(' ') || `#${item.category?.toUpperCase() || 'NEWS'}`}
                  </span>
                </div>
                <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-forest group-hover:text-primary transition-colors" />
              </div>
            </article>
          ))}
          
          {/* Empty Shell for Add */}
          <div className="narvo-border bg-surface/5 flex flex-col items-center justify-center p-6 md:p-8 grayscale opacity-20 border-dashed min-h-[200px]">
            <Bookmark className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4" />
            <span className="mono-ui text-[11px] md:text-[12px] font-bold tracking-widest text-center">ADD_NEW_STREAM_DOCK</span>
          </div>
        </section>
      )}

      {/* Load More */}
      {bookmarks.length > 6 && (
        <div className="mt-12 md:mt-16 flex justify-center">
          <button className="mono-ui text-[12px] md:text-[13px] font-bold text-forest hover:text-content transition-all border-b border-dashed border-forest/40 hover:border-white pb-2 tracking-[0.3em]">
            FETCH_ADDITIONAL_TRANSMISSIONS
          </button>
        </div>
      )}
    </main>
  );
};

export default SavedPage;

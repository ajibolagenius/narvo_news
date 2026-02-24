import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MagnifyingGlass, Microphone, Bookmark, Clock, Calendar, Funnel, Stack } from '@phosphor-icons/react';
import { useBookmarks } from '../hooks/useBookmarks';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Category label colors mapping
const CATEGORY_COLORS = {
  finance: { text: 'text-label-finance', border: 'border-label-finance/30', bg: 'bg-label-finance/10' },
  environ: { text: 'text-label-environ', border: 'border-label-environ/30', bg: 'bg-label-environ/10' },
  tech: { text: 'text-label-tech', border: 'border-label-tech/30', bg: 'bg-label-tech/10' },
  urgent: { text: 'text-label-urgent', border: 'border-label-urgent/30', bg: 'bg-label-urgent/10' },
  politics: { text: 'text-label-politics', border: 'border-label-politics/30', bg: 'bg-label-politics/10' },
  science: { text: 'text-label-science', border: 'border-label-science/30', bg: 'bg-label-science/10' },
  culture: { text: 'text-label-culture', border: 'border-label-culture/30', bg: 'bg-label-culture/10' },
  sports: { text: 'text-label-sports', border: 'border-label-sports/30', bg: 'bg-label-sports/10' },
  health: { text: 'text-label-health', border: 'border-label-health/30', bg: 'bg-label-health/10' },
  security: { text: 'text-label-security', border: 'border-label-security/30', bg: 'bg-label-security/10' },
  opinion: { text: 'text-label-opinion', border: 'border-label-opinion/30', bg: 'bg-label-opinion/10' },
  legal: { text: 'text-label-legal', border: 'border-label-legal/30', bg: 'bg-label-legal/10' },
  general: { text: 'text-primary', border: 'border-primary/30', bg: 'bg-primary/10' },
};

const getCategoryStyle = (category) => {
  const cat = category?.toLowerCase() || 'general';
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.general;
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=50`).then(res => res.json()).then(data => {
      setAllNews(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filterResults = useCallback((q) => {
    if (!q.trim()) { setResults([]); return; }
    const queryLower = q.toLowerCase();
    let filtered = allNews.filter(n => 
      n.title?.toLowerCase().includes(queryLower) || 
      n.summary?.toLowerCase().includes(queryLower) ||
      n.category?.toLowerCase().includes(queryLower) ||
      n.source?.toLowerCase().includes(queryLower)
    );
    
    if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
    }
    setResults(filtered);
  }, [allNews, sortBy]);

  useEffect(() => {
    filterResults(query);
  }, [query, filterResults]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const toggleBookmark = (item, e) => {
    e.stopPropagation();
    if (isBookmarked(item.id)) removeBookmark(item.id);
    else addBookmark(item);
  };

  const popularTags = ['#CURRENCY_SHIFT', '#LAGOS_TRANSIT', '#RENEWABLE_GRID'];

  return (
    <main className="flex-1 flex flex-col bg-background-dark overflow-y-auto custom-scroll h-full" data-testid="search-page">
      {/* Hero Search Section */}
      <section className="py-12 md:py-20 px-4 md:px-10 narvo-border-b bg-surface/10 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#628141 1px, transparent 1px), linear-gradient(90deg, #628141 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 relative z-10">
          <div className="space-y-2">
            <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-white leading-none">
              Global Archive <span className="text-primary">Search.</span>
            </h2>
            <p className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-[0.2em]">
              INDEXING_4.2M_BROADCAST_SEGMENTS // NIGERIA_WEST_AFRICA_NODES
            </p>
          </div>

          {/* Search Input Console */}
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-primary w-5 h-5 md:w-6 md:h-6 group-focus-within:scale-110 transition-transform" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-background-dark/80 narvo-border pl-12 md:pl-16 pr-20 md:pr-24 py-4 md:py-6 text-base md:text-xl mono-ui text-white placeholder-forest focus:outline-none focus:border-primary focus:bg-background-dark transition-all"
              placeholder="QUERY_KEYWORD_REGION_OR_SEGMENT_ID..."
              data-testid="search-input"
              autoFocus
            />
            <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 mono-ui text-[10px] text-forest border border-forest/30 px-2 py-1 pointer-events-none">
              <span className="text-primary">CMD</span>+<span>K</span>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
            <button className="flex items-center gap-2 md:gap-3 bg-primary text-background-dark px-4 md:px-6 py-2 md:py-3 mono-ui text-[10px] md:text-[11px] font-bold hover:bg-white transition-colors" data-testid="voice-input-btn">
              <Microphone className="w-4 h-4" />
              <span>[ VOICE_INPUT_PROTOCOL ]</span>
            </button>
            <div className="hidden sm:block h-10 w-px bg-forest/30" />
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-forest mono-ui text-[9px] md:text-[10px]">
              <span>POPULAR:</span>
              {popularTags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setQuery(tag.replace('#', ''))} 
                  className="text-primary hover:underline decoration-1 underline-offset-4"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Control Bar */}
      <div className="h-12 md:h-14 flex items-center justify-between px-4 md:px-10 bg-surface/30 narvo-border-b shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="mono-ui text-[9px] md:text-[10px] text-forest">SCHEMA: <span className="text-primary">SEMANTIC_RESULTS</span></span>
          <Layers className="w-4 h-4 text-forest hidden sm:block" />
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-1 md:gap-2 border border-forest/30 p-1">
            <button 
              onClick={() => setSortBy('latest')}
              className={`px-2 md:px-3 py-1 mono-ui text-[8px] md:text-[9px] font-bold ${sortBy === 'latest' ? 'bg-primary text-background-dark' : 'text-forest hover:text-white'}`}
              data-testid="sort-latest"
            >
              LATEST
            </button>
            <button 
              onClick={() => setSortBy('relevance')}
              className={`px-2 md:px-3 py-1 mono-ui text-[8px] md:text-[9px] ${sortBy === 'relevance' ? 'bg-primary text-background-dark font-bold' : 'text-forest hover:text-white'}`}
              data-testid="sort-relevance"
            >
              RELEVANCE
            </button>
          </div>
          <button className="text-forest hover:text-primary transition-colors flex items-center gap-1 md:gap-2 mono-ui text-[9px] md:text-[10px]">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">FILTERS</span>
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="p-4 md:p-10 flex-1 pb-20 md:pb-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[1px] md:bg-forest/20 md:narvo-border overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-background-dark p-4 md:p-6 flex flex-col gap-4 md:gap-6 narvo-border md:border-0">
                <Skeleton variant="text" className="w-20 h-4" />
                <Skeleton variant="text" className="w-full h-6" />
                <Skeleton variant="text" className="w-full h-4" />
                <Skeleton variant="text" className="w-3/4 h-4" />
              </div>
            ))}
          </div>
        ) : query && results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[1px] md:bg-forest/20 md:narvo-border overflow-hidden" data-testid="search-results">
            {results.map((item) => {
              const catStyle = getCategoryStyle(item.category);
              const isUrgent = item.category?.toLowerCase() === 'urgent';
              
              return (
                <article 
                  key={item.id}
                  onClick={() => navigate(`/news/${item.id}`)}
                  className="bg-background-dark p-4 md:p-6 flex flex-col gap-4 md:gap-6 hover:bg-surface/40 transition-colors group cursor-pointer border border-transparent hover:border-forest/50 narvo-border md:border-0"
                  data-testid={`search-result-${item.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`mono-ui text-[8px] md:text-[9px] ${catStyle.text} border ${catStyle.border} px-1.5 md:px-2 py-0.5 ${catStyle.bg} font-bold uppercase`}>
                        {item.category || 'GENERAL'}
                      </span>
                      {isUrgent && <div className="w-2 h-2 bg-label-urgent animate-pulse" />}
                    </div>
                    <button 
                      onClick={(e) => toggleBookmark(item, e)}
                      className={`${isBookmarked(item.id) ? 'text-primary' : 'text-forest'} group-hover:text-primary transition-colors`}
                      data-testid={`bookmark-${item.id}`}
                    >
                      <Bookmark className="w-4 h-4" fill={isBookmarked(item.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <h4 className="font-display text-base md:text-xl font-bold uppercase tracking-tight text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[11px] md:text-xs text-forest font-mono leading-relaxed opacity-70 line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="mt-auto pt-3 md:pt-4 border-t border-forest/10 flex items-center justify-between mono-ui text-[8px] md:text-[9px] text-forest">
                    <div className="flex items-center gap-1 md:gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{item.published || 'TODAY'}</span>
                    </div>
                    <span className="opacity-50">NODE_ID: {item.id?.slice(0, 6)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : query ? (
          <div className="narvo-border bg-surface/20 p-8 md:p-12 text-center relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(#628141 1px, transparent 1px), linear-gradient(90deg, #628141 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 mx-auto narvo-border border-dashed flex items-center justify-center">
                <Search className="w-8 h-8 text-forest" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-white uppercase">NO_RESULTS_FOUND</h3>
                <p className="mono-ui text-[10px] text-forest">QUERY: "{query.toUpperCase()}" RETURNED_ZERO_MATCHES</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setQuery('')}
                  className="px-6 py-3 bg-primary mono-ui text-[10px] font-bold text-background-dark hover:bg-white transition-all"
                >
                  CLEAR_QUERY
                </button>
                <button 
                  onClick={() => navigate('/discover')}
                  className="px-6 py-3 narvo-border mono-ui text-[10px] font-bold text-primary hover:bg-primary hover:text-background-dark transition-all"
                >
                  BROWSE_DISCOVER
                </button>
              </div>
              <p className="mono-ui text-[8px] text-forest/50">ERR_CODE: 0x00_EMPTY_SET // NARVO_SYS_V2.6</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[1px] md:bg-forest/20 md:narvo-border overflow-hidden">
            {allNews.slice(0, 8).map((item) => {
              const catStyle = getCategoryStyle(item.category);
              return (
                <article 
                  key={item.id}
                  onClick={() => navigate(`/news/${item.id}`)}
                  className="bg-background-dark p-4 md:p-6 flex flex-col gap-4 md:gap-6 hover:bg-surface/40 transition-colors group cursor-pointer border border-transparent hover:border-forest/50 narvo-border md:border-0"
                >
                  <div className="flex justify-between items-start">
                    <span className={`mono-ui text-[8px] md:text-[9px] ${catStyle.text} border ${catStyle.border} px-1.5 md:px-2 py-0.5 ${catStyle.bg} font-bold uppercase`}>
                      {item.category || 'GENERAL'}
                    </span>
                    <Bookmark className="w-4 h-4 text-forest group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="font-display text-base md:text-xl font-bold uppercase tracking-tight text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[11px] md:text-xs text-forest font-mono leading-relaxed opacity-70 line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="mt-auto pt-3 md:pt-4 border-t border-forest/10 flex items-center justify-between mono-ui text-[8px] md:text-[9px] text-forest">
                    <div className="flex items-center gap-1 md:gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{item.published || 'TODAY'}</span>
                    </div>
                    <span className="opacity-50">NODE_ID: {item.id?.slice(0, 6)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default SearchPage;

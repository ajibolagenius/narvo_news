import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MagnifyingGlass, Microphone, Bookmark, Clock, Calendar, Funnel, Stack, X } from '@phosphor-icons/react';
import { useBookmarks } from '../hooks/useBookmarks';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

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

/** Format a published date string to user's local time */
const formatPublished = (dateStr) => {
  if (!dateStr) return 'TODAY';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

const SOURCE_FILTERS = ['ALL', 'RSS', 'AGGREGATOR', 'PODCAST'];

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [totalResults, setTotalResults] = useState(0);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const searchTimer = useRef(null);

  // Initial load: fetch default news for browse
  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=50`).then(res => res.json()).then(data => {
      setAllNews(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Debounced search using /api/search (includes aggregators + podcasts)
  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }
    setSearching(true);
    try {
      const params = new URLSearchParams({ q, limit: '50' });
      if (sourceFilter !== 'ALL') params.set('source_type', sourceFilter.toLowerCase());
      const res = await fetch(`${API_URL}/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        let items = data.results || [];
        if (sortBy === 'latest') {
          items.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
        }
        setResults(items);
        setTotalResults(data.total || items.length);
      }
    } catch (e) {
      console.error('Search error:', e);
    }
    setSearching(false);
  }, [sortBy, sourceFilter]);

  // Trigger search on query/sort/filter change with debounce
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(searchTimer.current);
  }, [query, doSearch]);

  const handleSearch = (e) => { e.preventDefault(); doSearch(query); };

  const toggleBookmark = (item, e) => {
    e.stopPropagation();
    if (isBookmarked(item.id)) removeBookmark(item.id);
    else addBookmark(item);
  };

  const popularTags = ['#CURRENCY_SHIFT', '#LAGOS_TRANSIT', '#RENEWABLE_GRID'];

  const displayResults = query.trim() ? results : allNews.slice(0, 8);
  const isSearchActive = query.trim().length > 0;

  return (
    <main className="flex-1 flex flex-col bg-background-dark overflow-y-auto custom-scroll min-h-0" data-testid="search-page">
      {/* Hero Search Section */}
      <section className="py-8 md:py-20 px-4 md:px-10 narvo-border-b bg-surface/10 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#628141 1px, transparent 1px), linear-gradient(90deg, #628141 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-10 relative z-10">
          <div className="space-y-2">
            <h2 className="font-display text-2xl md:text-5xl font-bold uppercase tracking-tight text-content leading-none">
              Global Archive <span className="text-primary">Search.</span>
            </h2>
            <p className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-[0.2em]">
              RSS_FEEDS + AGGREGATORS + PODCASTS // UNIFIED_QUERY
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <MagnifyingGlass className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-primary w-5 h-5 md:w-6 md:h-6 group-focus-within:scale-110 transition-transform" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-background-dark/80 narvo-border pl-12 md:pl-16 pr-12 md:pr-24 py-3 md:py-6 text-sm md:text-xl mono-ui text-content placeholder-forest focus:outline-none focus:border-primary focus:bg-background-dark transition-all"
              placeholder="QUERY_KEYWORD_REGION..."
              data-testid="search-input"
              autoFocus
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 text-forest hover:text-content">
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 mono-ui text-[10px] text-forest border border-forest/30 px-2 py-1 pointer-events-none">
              <span className="text-primary">CMD</span>+<span>K</span>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-6">
            <button className="flex items-center gap-2 md:gap-3 bg-primary text-background-dark px-4 md:px-6 py-2 md:py-3 mono-ui text-[10px] md:text-[11px] font-bold hover:bg-white transition-colors" data-testid="voice-input-btn">
              <Microphone className="w-4 h-4" />
              <span>[ VOICE_INPUT ]</span>
            </button>
            <div className="hidden sm:block h-10 w-px bg-forest/30" />
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-forest mono-ui text-[9px] md:text-[10px]">
              <span>POPULAR:</span>
              {popularTags.map(tag => (
                <button key={tag} onClick={() => setQuery(tag.replace('#', ''))} className="text-primary hover:underline decoration-1 underline-offset-4">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Control Bar */}
      <div className="h-10 md:h-14 flex items-center justify-between px-4 md:px-10 bg-surface/30 narvo-border-b shrink-0">
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto">
          <span className="mono-ui text-[8px] md:text-[10px] text-forest shrink-0">
            {isSearchActive ? <>{searching ? 'SEARCHING...' : <>{totalResults} <span className="text-primary">RESULTS</span></>}</> : 'BROWSE'}
          </span>
          <Stack className="w-3 h-3 md:w-4 md:h-4 text-forest hidden sm:block shrink-0" />
          {/* Source type filter */}
          <div className="flex items-center gap-0.5 border border-forest/30 p-0.5 ml-2">
            {SOURCE_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setSourceFilter(f)}
                className={`px-1.5 md:px-2.5 py-0.5 mono-ui text-[7px] md:text-[9px] font-bold shrink-0 ${sourceFilter === f ? 'bg-primary text-background-dark' : 'text-forest hover:text-content'}`}
                data-testid={`source-filter-${f.toLowerCase()}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          <div className="flex items-center gap-0.5 md:gap-1 border border-forest/30 p-0.5 md:p-1">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-1.5 md:px-3 py-0.5 md:py-1 mono-ui text-[7px] md:text-[9px] font-bold ${sortBy === 'latest' ? 'bg-primary text-background-dark' : 'text-forest hover:text-content'}`}
              data-testid="sort-latest"
            >
              LATEST
            </button>
            <button
              onClick={() => setSortBy('relevance')}
              className={`px-1.5 md:px-3 py-0.5 md:py-1 mono-ui text-[7px] md:text-[9px] ${sortBy === 'relevance' ? 'bg-primary text-background-dark font-bold' : 'text-forest hover:text-content'}`}
              data-testid="sort-relevance"
            >
              RELEVANCE
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="p-4 md:p-10 flex-1 pb-32 md:pb-10">
        {(loading || searching) ? (
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
        ) : displayResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[1px] md:bg-forest/20 md:narvo-border overflow-hidden" data-testid="search-results">
            {displayResults.map((item) => {
              const catStyle = getCategoryStyle(item.category);
              const isUrgent = item.category?.toLowerCase() === 'urgent';
              const isAggregator = item.source_type === 'aggregator' || item.aggregator;
              return (
                <article
                  key={item.id}
                  onClick={() => navigate(`/news/${item.id}`)}
                  className="bg-background-dark p-4 md:p-6 flex flex-col gap-3 md:gap-6 hover:bg-surface/40 transition-colors group cursor-pointer border border-transparent hover:border-forest/50 narvo-border md:border-0"
                  data-testid={`search-result-${item.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`mono-ui text-[7px] md:text-[9px] ${catStyle.text} border ${catStyle.border} px-1.5 md:px-2 py-0.5 ${catStyle.bg} font-bold uppercase`}>
                        {item.category || 'GENERAL'}
                      </span>
                      {isAggregator && (
                        <span className="mono-ui text-[7px] md:text-[8px] text-primary border border-primary/30 px-1 py-0.5 bg-primary/10 font-bold">AGG</span>
                      )}
                      {isUrgent && <div className="w-2 h-2 bg-label-urgent animate-pulse" />}
                    </div>
                    <button
                      onClick={(e) => toggleBookmark(item, e)}
                      className={`${isBookmarked(item.id) ? 'text-primary' : 'text-forest'} group-hover:text-primary transition-colors shrink-0`}
                      data-testid={`bookmark-${item.id}`}
                    >
                      <Bookmark className="w-4 h-4" fill={isBookmarked(item.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <h4 className="font-display text-sm md:text-xl font-bold uppercase tracking-tight text-content leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[10px] md:text-xs text-forest font-mono leading-relaxed opacity-70 line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="mt-auto pt-3 md:pt-4 border-t border-forest/10 flex items-center justify-between mono-ui text-[7px] md:text-[9px] text-forest">
                    <div className="flex items-center gap-1 md:gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{formatPublished(item.published)}</span>
                    </div>
                    <span className="opacity-50 truncate ml-2">{item.source || 'NARVO'}</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : isSearchActive ? (
          <div className="narvo-border bg-surface/20 p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#628141 1px, transparent 1px), linear-gradient(90deg, #628141 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 mx-auto narvo-border border-dashed flex items-center justify-center">
                <MagnifyingGlass className="w-8 h-8 text-forest" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl md:text-2xl font-bold text-content uppercase">NO_RESULTS_FOUND</h3>
                <p className="mono-ui text-[10px] text-forest">QUERY: "{query.toUpperCase()}" RETURNED_ZERO_MATCHES</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setQuery('')} className="px-6 py-3 bg-primary mono-ui text-[10px] font-bold text-background-dark hover:bg-white transition-all">
                  CLEAR_QUERY
                </button>
                <button onClick={() => navigate('/discover')} className="px-6 py-3 narvo-border mono-ui text-[10px] font-bold text-primary hover:bg-primary hover:text-background-dark transition-all">
                  BROWSE_DISCOVER
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default SearchPage;

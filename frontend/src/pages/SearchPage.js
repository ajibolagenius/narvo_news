import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, Filter, TrendingUp, Clock, Radio, X, 
  Play, ListPlus, ArrowRight, Loader2
} from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const SearchPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState({ tags: [], topics: [] });
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [recentSearches, setRecentSearches] = useState([]);
  const [total, setTotal] = useState(0);
  const { playTrack, addToQueue, currentTrack, isPlaying } = useAudio();

  // Load trending and categories
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/trending`).then(r => r.json()).catch(() => ({ tags: [], topics: [] })),
      fetch(`${API_URL}/api/categories`).then(r => r.json()).catch(() => [])
    ]).then(([trendingData, categoriesData]) => {
      setTrending(trendingData);
      setCategories(categoriesData);
      setTrendingLoading(false);
    });

    // Load recent searches from localStorage
    const saved = localStorage.getItem('narvo_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
  }, []);

  // Search when query changes
  const performSearch = useCallback(async (searchQuery, category = '') => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ q: searchQuery, limit: '30' });
      if (category) params.append('category', category);
      
      const res = await fetch(`${API_URL}/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setTotal(data.total || 0);
        
        // Save to recent searches
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('narvo_recent_searches', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Search error:', e);
    }
    setLoading(false);
  }, [recentSearches]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query, ...(selectedCategory && { category: selectedCategory }) });
      performSearch(query, selectedCategory);
    }
  };

  // Handle tag/topic click
  const handleTagClick = (tag) => {
    const cleanTag = tag.replace('#', '');
    setQuery(cleanTag);
    setSearchParams({ q: cleanTag });
    performSearch(cleanTag, selectedCategory);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('narvo_recent_searches');
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

  return (
    <main className="flex-1 flex flex-col bg-[#0a0a0a] min-h-0 overflow-hidden" data-testid="search-page">
      {/* Search Header */}
      <header className="border-b border-[#333333] bg-[#111111] p-4 md:p-6 shrink-0">
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#525252]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH_NEWS..."
                className="w-full h-12 pl-12 pr-4 bg-[#0a0a0a] border border-[#333333] font-mono text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#D4FF00]"
                data-testid="search-input"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-12 px-4 bg-[#0a0a0a] border border-[#333333] font-mono text-[10px] text-[#8BAE66] focus:outline-none focus:border-[#D4FF00]"
              data-testid="category-filter"
            >
              <option value="">ALL_CATEGORIES</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 bg-[#D4FF00] text-[#0a0a0a] font-mono text-xs font-bold hover:bg-white transition-all disabled:opacity-50"
              data-testid="search-btn"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SEARCH'}
            </button>
          </div>
        </form>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          {/* Results or Discovery */}
          {results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#8BAE66]">
                  {total} RESULTS_FOUND FOR "{query.toUpperCase()}"
                </span>
                <button
                  onClick={() => { setQuery(''); setResults([]); setTotal(0); setSearchParams({}); }}
                  className="font-mono text-[10px] text-[#525252] hover:text-[#D4FF00] flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> CLEAR
                </button>
              </div>
              
              <div className="grid gap-2">
                {results.map((item) => {
                  const isCurrentlyPlaying = currentTrack?.id === item.id && isPlaying;
                  return (
                    <div
                      key={item.id}
                      className="border border-[#333333] bg-[#111111] p-4 flex items-start gap-4 hover:border-[#628141] transition-all group"
                      data-testid={`result-${item.id}`}
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
                        </div>
                        <h3 className="font-display text-sm font-bold text-white uppercase leading-tight line-clamp-2 group-hover:text-[#D4FF00] transition-colors">
                          {item.title}
                        </h3>
                        {item.summary && (
                          <p className="font-mono text-[10px] text-[#525252] mt-1 line-clamp-1">{item.summary}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => addToQueue(item)}
                        className="p-2 text-[#525252] hover:text-[#D4FF00] transition-colors"
                        data-testid={`queue-${item.id}`}
                        title="Add to queue"
                      >
                        <ListPlus className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Trending */}
              <div className="border border-[#333333] bg-[#111111]">
                <div className="h-12 flex items-center gap-2 px-4 border-b border-[#333333] bg-[#0a0a0a]">
                  <TrendingUp className="w-4 h-4 text-[#D4FF00]" />
                  <span className="font-mono text-[10px] text-[#8BAE66] font-bold tracking-widest">TRENDING_NOW</span>
                </div>
                <div className="p-4 space-y-4">
                  {trendingLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} variant="text" className="w-full h-8" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {trending.tags?.map((tag, i) => (
                          <button
                            key={i}
                            onClick={() => handleTagClick(tag)}
                            className="px-3 py-1.5 border border-[#333333] font-mono text-[10px] text-[#8BAE66] hover:border-[#D4FF00] hover:text-[#D4FF00] transition-all"
                            data-testid={`tag-${i}`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2 pt-2 border-t border-[#333333]">
                        {trending.topics?.map((topic, i) => (
                          <button
                            key={i}
                            onClick={() => handleTagClick(topic.name)}
                            className="w-full flex items-center justify-between p-3 border border-[#333333] hover:border-[#628141] hover:bg-[#1A1A1A] transition-all"
                            data-testid={`topic-${i}`}
                          >
                            <span className="font-display text-xs font-bold text-white uppercase">{topic.name}</span>
                            <span className="font-mono text-[9px] text-[#525252]">{topic.count}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Recent Searches */}
              <div className="border border-[#333333] bg-[#111111]">
                <div className="h-12 flex items-center justify-between px-4 border-b border-[#333333] bg-[#0a0a0a]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#628141]" />
                    <span className="font-mono text-[10px] text-[#8BAE66] font-bold tracking-widest">RECENT_SEARCHES</span>
                  </div>
                  {recentSearches.length > 0 && (
                    <button
                      onClick={clearRecentSearches}
                      className="font-mono text-[9px] text-[#525252] hover:text-[#D4FF00]"
                    >
                      CLEAR_ALL
                    </button>
                  )}
                </div>
                <div className="p-4">
                  {recentSearches.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-8 h-8 text-[#333333] mx-auto mb-3" />
                      <p className="font-mono text-[10px] text-[#525252]">NO_RECENT_SEARCHES</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentSearches.map((search, i) => (
                        <button
                          key={i}
                          onClick={() => { setQuery(search); performSearch(search, selectedCategory); }}
                          className="w-full flex items-center justify-between p-3 border border-[#333333] hover:border-[#628141] hover:bg-[#1A1A1A] transition-all group"
                          data-testid={`recent-${i}`}
                        >
                          <span className="font-mono text-xs text-[#8BAE66] group-hover:text-white transition-colors">{search}</span>
                          <ArrowRight className="w-4 h-4 text-[#333333] group-hover:text-[#D4FF00] transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="md:col-span-2 border border-[#333333] bg-[#111111] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Radio className="w-4 h-4 text-[#D4FF00]" />
                  <span className="font-mono text-[10px] text-[#8BAE66] font-bold tracking-widest">SEARCH_TIPS</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Use keywords', 'Filter by category', 'Click tags to explore', 'Add to queue for later'].map((tip, i) => (
                    <div key={i} className="p-3 bg-[#0a0a0a] border border-[#333333]">
                      <span className="font-mono text-[9px] text-[#525252]">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default SearchPage;

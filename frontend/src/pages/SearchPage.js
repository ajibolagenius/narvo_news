import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ListSkeleton } from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=30`).then(res => res.json()).then(data => {
      setAllNews(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(allNews.filter(n => n.title.toLowerCase().includes(q) || n.summary?.toLowerCase().includes(q)));
  }, [query, allNews]);

  return (
    <main className="flex-1 flex flex-col bg-background-dark min-w-0" data-testid="search-page">
      <div className="h-12 md:h-14 flex items-center justify-between px-4 md:px-8 bg-surface/30 narvo-border-b shrink-0">
        <span className="mono-ui text-[10px] md:text-xs text-forest">MODULE: <span className="text-primary">SEARCH_CENTER</span></span>
        {query && <span className="mono-ui text-[10px] md:text-xs text-forest">{results.length} RESULTS</span>}
      </div>
      <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-6 md:mb-8">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-primary w-4 h-4 md:w-5 md:h-5" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="SEARCH_TRANSMISSIONS..." className="w-full bg-surface/30 narvo-border pl-10 md:pl-14 pr-4 py-3 md:py-4 text-sm md:text-base text-white mono-ui focus:outline-none focus:border-primary transition-all" data-testid="search-input" autoFocus />
          </div>
          
          {loading ? (
            <ListSkeleton count={4} />
          ) : (
            <>
              {results.length > 0 && (
                <div className="narvo-border bg-surface/20 divide-y divide-forest/10" data-testid="search-results">
                  {results.map(item => (
                    <div key={item.id} className="p-4 md:p-6 cursor-pointer hover:bg-surface/40 transition-colors group" onClick={() => navigate(`/news/${item.id}`)}>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                        <span className="bg-forest/20 text-primary mono-ui text-[8px] md:text-[9px] px-1.5 md:px-2 py-0.5 border border-forest/30">{item.category?.toUpperCase()}</span>
                        <span className="mono-ui text-[8px] md:text-[9px] text-forest/50">{item.source}</span>
                      </div>
                      <h3 className="font-display text-base md:text-xl font-bold uppercase tracking-tight text-white group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-xs md:text-sm text-forest font-mono mt-1 md:mt-2 opacity-70 line-clamp-2">{item.summary}</p>
                    </div>
                  ))}
                </div>
              )}
              {query && results.length === 0 && (
                <div className="narvo-border bg-surface/20 p-8 md:p-12 text-center">
                  <span className="mono-ui text-[10px] md:text-xs text-forest">NO RESULTS FOR "{query.toUpperCase()}"</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default SearchPage;

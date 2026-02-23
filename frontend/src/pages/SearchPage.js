import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [allNews, setAllNews] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=30`).then(res => res.json()).then(setAllNews).catch(console.error);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(allNews.filter(n => n.title.toLowerCase().includes(q) || n.summary?.toLowerCase().includes(q)));
  }, [query, allNews]);

  return (
    <main className="flex-1 flex flex-col bg-background-dark min-w-0" data-testid="search-page">
      <div className="h-14 flex items-center justify-between px-8 bg-surface/30 narvo-border-b shrink-0">
        <span className="mono-ui text-[10px] text-forest">MODULE: <span className="text-primary">SEARCH_CENTER</span></span>
        {query && <span className="mono-ui text-[10px] text-forest">{results.length} RESULTS</span>}
      </div>
      <div className="flex-1 overflow-y-auto custom-scroll p-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="SEARCH_TRANSMISSIONS..." className="w-full bg-surface/30 narvo-border pl-14 pr-4 py-4 text-white mono-ui focus:outline-none focus:border-primary transition-all" data-testid="search-input" autoFocus />
          </div>
          {results.length > 0 && (
            <div className="narvo-border bg-surface/20 divide-y divide-forest/10" data-testid="search-results">
              {results.map(item => (
                <div key={item.id} className="p-6 cursor-pointer hover:bg-surface/40 transition-colors group" onClick={() => navigate(`/news/${item.id}`)}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-forest/20 text-primary mono-ui text-[8px] px-2 py-0.5 border border-forest/30">{item.category?.toUpperCase()}</span>
                    <span className="mono-ui text-[8px] text-forest/50">{item.source}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-xs text-forest font-mono mt-2 opacity-70 line-clamp-2">{item.summary}</p>
                </div>
              ))}
            </div>
          )}
          {query && results.length === 0 && (
            <div className="narvo-border bg-surface/20 p-12 text-center">
              <span className="mono-ui text-xs text-forest">NO RESULTS FOR "{query.toUpperCase()}"</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default SearchPage;

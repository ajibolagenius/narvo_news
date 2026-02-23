import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
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
    <div className="min-h-screen bg-background-dark" data-testid="search-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-forest hover:text-primary">&larr; [BACK]</button>
          <span className="font-display text-lg text-white">[Search Center]</span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search news..." className="w-full bg-surface border border-forest text-white p-4 mono-ui mb-6" data-testid="search-input" />
        {results.length > 0 && (
          <div className="space-y-3" data-testid="search-results">
            <span className="mono-ui text-[10px] text-forest">{results.length} RESULTS</span>
            {results.map(item => (
              <div key={item.id} className="border border-forest bg-surface p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => navigate(`/news/${item.id}`)}>
                <span className="mono-ui text-[9px] text-primary">{item.category?.toUpperCase()}</span>
                <h3 className="font-display text-white mt-1">{item.title}</h3>
                <span className="mono-ui text-[9px] text-forest">{item.source}</span>
              </div>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <div className="text-center py-12"><span className="mono-ui text-xs text-forest">NO RESULTS FOR "{query.toUpperCase()}"</span></div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

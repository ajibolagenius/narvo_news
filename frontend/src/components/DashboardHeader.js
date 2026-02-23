import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 narvo-border-b bg-background-dark z-20 shrink-0" data-testid="dashboard-header">
      <div className="flex items-center gap-12 flex-1">
        <div className="flex items-center gap-4 shrink-0 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <svg className="w-6 h-6 text-primary" viewBox="0 0 256 256" fill="currentColor">
            <path d="M128,16a112,112,0,1,0,112,112A112.13,112.13,0,0,0,128,16Zm0,208a96,96,0,1,1,96-96A96.11,96.11,0,0,1,128,224ZM168,128a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V88a8,8,0,0,1,16,0v32h24A8,8,0,0,1,168,128Z"/>
          </svg>
          <h1 className="font-display text-xl tracking-tight font-bold text-white uppercase">
            NARVO <span className="text-forest font-light mx-2">{'//'}</span> DASHBOARD
          </h1>
        </div>

        <form onSubmit={handleSearch} className="relative w-full max-w-xl hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface/30 narvo-border pl-12 pr-4 py-2.5 text-[11px] mono-ui text-white placeholder-forest focus:outline-none focus:border-primary focus:bg-surface/50 transition-all"
            placeholder="SEARCH_STREAM_NODES_AND_TRANSMISSIONS..."
            data-testid="header-search-input"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 mono-ui text-[9px] text-forest border border-forest/30 px-1.5 py-0.5 pointer-events-none">
            <span className="text-primary">CMD</span>+<span>K</span>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="hidden md:flex flex-col items-end mono-ui text-[9px] text-forest">
          <span>SIGNAL_STABILITY: <span className="text-primary font-bold">100%</span></span>
          <span>LATENCY: <span className="text-primary font-bold">12ms</span></span>
        </div>
        <div
          className="h-10 w-10 narvo-border bg-surface flex items-center justify-center cursor-pointer hover:bg-forest transition-colors"
          onClick={() => navigate('/settings')}
          data-testid="header-user-btn"
        >
          {user ? (
            <span className="font-display text-primary text-sm font-bold">{user.email?.[0]?.toUpperCase()}</span>
          ) : (
            <User className="text-primary w-5 h-5" />
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

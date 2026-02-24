import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass, User, Broadcast } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const DashboardHeader = ({ onToggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="h-14 md:h-16 flex items-center gap-4 px-4 md:px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)] z-20 shrink-0" data-testid="dashboard-header">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <Broadcast weight="fill" className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-primary)]" />
        <h1 className="font-display text-base md:text-lg tracking-tight font-bold text-[var(--color-text-primary)] uppercase hidden sm:block">
          NARVO
        </h1>
      </div>

      {/* Centered Search - Full Width */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto hidden md:block">
        <div className="relative">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)] w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-surface)]/30 border border-[var(--color-border)] pl-12 pr-20 py-2.5 text-xs font-mono uppercase text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
            placeholder={t('header.search_placeholder')}
            data-testid="header-search-input"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 font-mono text-[9px] text-[var(--color-text-secondary)] border border-[var(--color-border)]/30 px-1.5 py-0.5">
            <span className="text-[var(--color-primary)]">⌘</span>K
          </div>
        </div>
      </form>

      {/* Mobile search */}
      <button onClick={() => navigate('/search')} className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] ml-auto">
        <MagnifyingGlass weight="bold" className="w-5 h-5" />
      </button>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex flex-col items-end font-mono text-[9px] text-[var(--color-text-secondary)]">
          <span>{t('header.signal')}: <span className="text-[var(--color-primary)] font-bold">100%</span></span>
          <span>{t('header.latency')}: <span className="text-[var(--color-primary)] font-bold">12ms</span></span>
        </div>
        
        <ThemeToggle className="hidden md:flex" />
        
        <div
          className="h-9 w-9 border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-border)] transition-colors"
          onClick={() => navigate('/settings')}
          data-testid="header-user-btn"
        >
          {user ? (
            <span className="font-display text-[var(--color-primary)] text-sm font-bold">{user.email?.[0]?.toUpperCase()}</span>
          ) : (
            <User weight="fill" className="text-[var(--color-primary)] w-5 h-5" />
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

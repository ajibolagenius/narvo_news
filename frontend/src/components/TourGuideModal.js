import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, ArrowLeft, Broadcast, MagnifyingGlass, GearSix, Headphones, Waveform } from '@phosphor-icons/react';

const TOUR_STEPS = [
  {
    target: '[data-testid="nav-dashboard"]',
    title: 'LIVE_FEED',
    body: 'Your personalized news stream. RSS feeds and aggregator articles from 39+ sources, sorted by recency.',
    icon: Broadcast,
  },
  {
    target: '[data-testid="source-filter-toggle"]',
    title: 'SOURCE_FILTER',
    body: 'Toggle between ALL sources, RSS-only, or aggregator-only articles to control your feed.',
    icon: Waveform,
  },
  {
    target: '[data-testid="nav-discover"]',
    title: 'DISCOVER',
    body: 'Explore podcasts, live radio stations, and aggregator wire news from Mediastack & NewsData.io.',
    icon: Headphones,
  },
  {
    target: '[data-testid="nav-search"]',
    title: 'SEARCH',
    body: 'Search across all sources: RSS feeds, aggregators, and podcasts in one unified query.',
    icon: MagnifyingGlass,
  },
  {
    target: '[data-testid="nav-system"]',
    title: 'SYSTEM_SETTINGS',
    body: 'Configure broadcast language, voice gender, aggregator preferences, and notification engine.',
    icon: GearSix,
  },
];

const STORAGE_KEY = 'narvo_tour_completed';

export const TourGuideModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const next = () => {
    if (step < TOUR_STEPS.length - 1) setStep(s => s + 1);
    else close();
  };

  const prev = () => { if (step > 0) setStep(s => s - 1); };

  if (!isOpen) return null;

  const current = TOUR_STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" data-testid="tour-guide-modal">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={close} />

      {/* Modal */}
      <div className="relative w-[90vw] max-w-sm narvo-border bg-background-dark overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Progress bar */}
        <div className="h-0.5 bg-forest/20">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-forest/20">
          <div className="flex items-center gap-2">
            <Broadcast weight="fill" className="w-4 h-4 text-primary" />
            <span className="mono-ui text-[9px] text-forest font-bold tracking-widest">NARVO_TOUR</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="mono-ui text-[9px] text-forest/50">{step + 1}/{TOUR_STEPS.length}</span>
            <button onClick={close} className="text-forest hover:text-content transition-colors" data-testid="tour-close">
              <X weight="bold" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="w-12 h-12 narvo-border bg-primary/10 flex items-center justify-center">
            <Icon weight="bold" className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-content uppercase tracking-tight">{current.title}</h3>
            <p className="mt-2 mono-ui text-[10px] text-forest leading-relaxed">{current.body}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-forest/20">
          <button
            onClick={close}
            className="mono-ui text-[9px] text-forest/50 hover:text-forest transition-colors"
            data-testid="tour-skip"
          >
            SKIP_TOUR
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="w-8 h-8 narvo-border flex items-center justify-center text-forest hover:text-content hover:border-forest transition-all"
                data-testid="tour-prev"
              >
                <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={next}
              className="px-4 h-8 bg-primary text-background-dark mono-ui text-[9px] font-bold flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
              data-testid="tour-next"
            >
              {step === TOUR_STEPS.length - 1 ? 'START_LISTENING' : 'NEXT'}
              {step < TOUR_STEPS.length - 1 && <ArrowRight weight="bold" className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ArrowRight, ArrowLeft, Broadcast, GearSix, Headphones, Waveform, PlayCircle, BookmarkSimple, ClockCounterClockwise, Lightning } from '@phosphor-icons/react';

const TOUR_STEPS = [
  {
    target: '[data-testid="nav-dashboard"]',
    title: 'LIVE_FEED',
    body: 'Your personalized news stream powered by 39+ RSS feeds and aggregator sources. Stories are sorted by recency and boosted by your interests.',
    tip: 'Tap any story card to read the full article and generate an audio broadcast.',
    icon: Broadcast,
  },
  {
    target: '[data-testid="source-filter-toggle"]',
    title: 'SOURCE_FILTERS',
    body: 'Control your feed by toggling between ALL sources, RSS-only feeds, or aggregator articles from Mediastack and NewsData.io.',
    tip: 'Use the NEW/OLD sort button to flip between latest and oldest stories.',
    icon: Waveform,
  },
  {
    target: '[data-testid="featured-play-btn"]',
    title: 'AUDIO_PLAYBACK',
    body: 'Every story can be converted into an audio broadcast using AI voices. Hit the play button to listen while multitasking.',
    tip: 'Use the speed control (1x, 1.25x, 1.5x, 2x) on the audio player bar to adjust playback.',
    icon: PlayCircle,
  },
  {
    target: '[data-testid="nav-discover"]',
    title: 'DISCOVER',
    body: 'Explore curated podcasts from top shows, live African radio stations, and wire news from multiple aggregators.',
    tip: 'Search across all content types in one unified query from the search page.',
    icon: Headphones,
  },
  {
    target: '[data-testid="recommendations-section"]',
    title: 'FOR_YOU',
    body: 'Narvo learns from your listening history to recommend relevant stories. The more you listen, the smarter recommendations get.',
    tip: 'Your top categories and topics are analyzed with AI to surface stories you might have missed.',
    icon: Lightning,
  },
  {
    target: '[data-testid="featured-bookmark-btn"]',
    title: 'SAVE_&_BOOKMARK',
    body: 'Bookmark stories for later reading or save articles for offline access when you have no connectivity.',
    tip: 'View all saved content from the Saved and Offline pages in the sidebar.',
    icon: BookmarkSimple,
  },
  {
    target: '[data-testid="mobile-nav-history"]',
    title: 'LISTENING_HISTORY',
    body: 'Every broadcast you play is tracked in your history timeline, grouped by date for easy replay.',
    tip: 'Your history also powers the recommendation engine — more listens means better suggestions.',
    icon: ClockCounterClockwise,
  },
  {
    target: '[data-testid="nav-system"]',
    title: 'SETTINGS_HUB',
    body: 'Configure your voice model, broadcast language, sound theme, news interests, and notification preferences.',
    tip: 'Set your Interest Matrix in System Settings to prioritize specific news categories on your feed.',
    icon: GearSix,
  },
];

const STORAGE_KEY = 'narvo_tour_completed';
const STORAGE_SKIPPED_KEY = 'narvo_tour_skipped';
export const TOUR_EVENT = 'narvo-open-tour';

/** Dispatch this from anywhere to re-open the tour. */
export function openTourGuide() {
  window.dispatchEvent(new Event(TOUR_EVENT));
}

/** Reset tour state so it shows again on next visit. */
export function resetTourGuide() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_SKIPPED_KEY);
}

export const TourGuideModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const location = useLocation();

  const isDashboardArea = ['/dashboard', '/discover', '/search', '/briefing', '/saved', '/offline', '/settings', '/system'].some(p => location.pathname.startsWith(p));

  // First-visit auto-show (only in dashboard area, only if not completed or skipped)
  useEffect(() => {
    if (!isDashboardArea) return;
    const completed = localStorage.getItem(STORAGE_KEY);
    const skipped = localStorage.getItem(STORAGE_SKIPPED_KEY);
    if (!completed && !skipped) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isDashboardArea]);

  // Listen for external open events (settings button, re-trigger)
  useEffect(() => {
    const handler = () => { setStep(0); setIsOpen(true); };
    window.addEventListener(TOUR_EVENT, handler);
    return () => window.removeEventListener(TOUR_EVENT, handler);
  }, []);

  const complete = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.removeItem(STORAGE_SKIPPED_KEY);
  }, []);

  const skip = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_SKIPPED_KEY, 'true');
  }, []);

  const next = () => {
    if (step < TOUR_STEPS.length - 1) setStep(s => s + 1);
    else complete();
  };

  const prev = () => { if (step > 0) setStep(s => s - 1); };

  if (!isOpen) return null;

  const current = TOUR_STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" data-testid="tour-guide-modal">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={skip} />

      {/* Modal */}
      <div className="relative w-full max-w-sm narvo-border bg-background-dark overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Progress bar */}
        <div className="h-1 bg-forest/20">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-forest/20">
          <div className="flex items-center gap-2">
            <Broadcast weight="fill" className="w-4 h-4 text-primary" />
            <span className="mono-ui text-[11px] text-forest font-bold tracking-widest">NARVO_TOUR</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="mono-ui text-[11px] text-forest/50">{step + 1}/{TOUR_STEPS.length}</span>
            <button onClick={skip} className="text-forest hover:text-content transition-colors" data-testid="tour-close">
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
            <p className="mt-2 mono-ui text-[12px] text-forest leading-relaxed">{current.body}</p>
            {current.tip && (
              <div className="mt-3 p-2.5 bg-primary/5 border border-primary/20">
                <p className="mono-ui text-[11px] text-primary leading-relaxed">TIP: {current.tip}</p>
              </div>
            )}
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {TOUR_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-1.5 h-1.5 transition-all ${i === step ? 'bg-primary w-4' : i < step ? 'bg-primary/40' : 'bg-forest/30'}`}
              data-testid={`tour-dot-${i}`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-forest/20">
          <button
            onClick={skip}
            className="mono-ui text-[11px] text-forest/50 hover:text-forest transition-colors"
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
              className="px-4 h-8 bg-primary text-background-dark mono-ui text-[11px] font-bold flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
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

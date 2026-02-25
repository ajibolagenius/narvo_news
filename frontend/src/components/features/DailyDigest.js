import React, { useState, useEffect } from 'react';
import { Bell, BellSlash, Broadcast, CaretRight } from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DailyDigest = () => {
  const [digest, setDigest] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/notifications/digest`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setDigest(data); })
      .catch(() => {});
    // Check if already subscribed (localStorage flag)
    setSubscribed(localStorage.getItem('narvo_push_subscribed') === 'true');
  }, []);

  const toggleSubscription = async () => {
    setLoading(true);
    try {
      if (subscribed) {
        await fetch(`${API_URL}/api/notifications/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: 'browser-push-placeholder' }),
        });
        localStorage.setItem('narvo_push_subscribed', 'false');
        setSubscribed(false);
      } else {
        await fetch(`${API_URL}/api/notifications/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: 'browser-push-placeholder', type: 'daily_digest' }),
        });
        localStorage.setItem('narvo_push_subscribed', 'true');
        setSubscribed(true);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="narvo-border bg-surface/5 overflow-hidden" data-testid="daily-digest">
      <div className="p-4 md:p-5 narvo-border-b bg-surface/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 narvo-border bg-background-dark flex items-center justify-center">
            <Broadcast weight="bold" className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="mono-ui text-[12px] md:text-[13px] text-forest font-bold tracking-[0.15em]">DAILY_DIGEST</span>
            <p className="mono-ui text-[9px] md:text-[10px] text-forest/50">TOP STORIES DELIVERED DAILY</p>
          </div>
        </div>
        <button
          onClick={toggleSubscription}
          disabled={loading}
          className={`flex items-center gap-2 narvo-border px-3 py-1.5 mono-ui text-[11px] font-bold transition-all ${
            subscribed
              ? 'bg-primary text-background-dark border-primary'
              : 'bg-surface/10 text-forest hover:bg-primary hover:text-background-dark hover:border-primary'
          }`}
          data-testid="digest-subscribe-btn"
        >
          {subscribed ? <BellSlash weight="bold" className="w-3.5 h-3.5" /> : <Bell weight="bold" className="w-3.5 h-3.5" />}
          {loading ? 'SYNCING...' : subscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
        </button>
      </div>
      {digest?.top_stories?.length > 0 && (
        <div className="divide-y divide-forest/10">
          {digest.top_stories.slice(0, 3).map((story, i) => (
            <div key={story.id || i} className="p-3 md:p-4 flex items-center gap-3">
              <span className="mono-ui text-[14px] font-bold text-primary/40 w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1 min-w-0">
                <p className="mono-ui text-[11px] md:text-[12px] text-content font-bold truncate">{story.title}</p>
                <span className="mono-ui text-[9px] text-forest/50">{story.category} — {story.source}</span>
              </div>
              <CaretRight className="w-3 h-3 text-forest/30 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyDigest;

import React, { useState, useEffect } from 'react';
import { ChartBar, Lightning, Clock, Fire, Broadcast, TrendUp } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const CATEGORY_COLORS = {
  general: '#6B8A7A', politics: '#D4A574', technology: '#7B9BAA', business: '#A8B87A',
  sports: '#D49B7A', health: '#8AB89B', entertainment: '#B88A9B', science: '#9B8AB8',
};

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id || 'guest';
    fetch(`${API_URL}/api/analytics/${userId}`)
      .then(r => r.json())
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll bg-background-dark p-4 md:p-8 pb-32 md:pb-8" data-testid="analytics-page">
        <div className="max-w-4xl mx-auto space-y-6">
          {[1,2,3].map(i => <div key={i} className="h-40 narvo-border bg-surface/20 animate-pulse" />)}
        </div>
      </main>
    );
  }

  const maxDaily = Math.max(...(analytics?.daily_activity?.map(d => d.count) || [1]));

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll bg-background-dark p-4 md:p-8 pb-32 md:pb-8" data-testid="analytics-page">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-primary/30 pb-3">
          <ChartBar weight="fill" className="w-5 h-5 text-primary" />
          <h1 className="font-display text-xl md:text-2xl font-bold text-content uppercase tracking-tight">
            ANALYTICS
          </h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Broadcast} label="LISTENS" value={analytics?.total_listens || 0} />
          <StatCard icon={Clock} label="MINUTES" value={analytics?.total_duration_minutes || 0} />
          <StatCard icon={Fire} label="STREAK" value={`${analytics?.streak || 0}d`} />
          <StatCard icon={TrendUp} label="TOP" value={analytics?.top_categories?.[0]?.toUpperCase() || '--'} small />
        </div>

        {/* Daily Activity */}
        {analytics?.daily_activity?.length > 0 && (
          <section className="narvo-border bg-surface/10 p-4 md:p-6">
            <h2 className="mono-ui text-[11px] text-primary font-bold tracking-[0.15em] mb-4">{'//'} DAILY_ACTIVITY</h2>
            <div className="flex items-end gap-1 h-24">
              {analytics.daily_activity.map(d => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.count} listens`}>
                  <div
                    className="w-full bg-primary/80 hover:bg-primary transition-colors"
                    style={{ height: `${Math.max(4, (d.count / maxDaily) * 80)}px` }}
                  />
                  <span className="mono-ui text-[8px] text-forest/50 -rotate-45 origin-top-left">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Category Breakdown */}
        {Object.keys(analytics?.categories || {}).length > 0 && (
          <section className="narvo-border bg-surface/10 p-4 md:p-6">
            <h2 className="mono-ui text-[11px] text-primary font-bold tracking-[0.15em] mb-4">{'//'} CATEGORIES</h2>
            <div className="space-y-2">
              {Object.entries(analytics.categories).map(([cat, count]) => {
                const total = analytics.total_listens || 1;
                const pct = Math.round((count / total) * 100);
                const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.general;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="mono-ui text-[10px] text-forest w-20 uppercase truncate">{cat}</span>
                    <div className="flex-1 h-5 bg-surface/30 overflow-hidden">
                      <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <span className="mono-ui text-[10px] text-content font-bold w-10 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Source Breakdown */}
        {Object.keys(analytics?.sources || {}).length > 0 && (
          <section className="narvo-border bg-surface/10 p-4 md:p-6">
            <h2 className="mono-ui text-[11px] text-primary font-bold tracking-[0.15em] mb-4">{'//'} TOP_SOURCES</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(analytics.sources).slice(0, 6).map(([src, count]) => (
                <div key={src} className="narvo-border bg-surface/20 p-3 flex items-center justify-between">
                  <span className="mono-ui text-[10px] text-forest truncate">{src}</span>
                  <span className="mono-ui text-[10px] text-primary font-bold ml-2">{count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!analytics || analytics.total_listens === 0) && (
          <div className="narvo-border bg-surface/10 p-8 text-center">
            <Lightning weight="fill" className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-content uppercase mb-2">NO DATA YET</h3>
            <p className="mono-ui text-[11px] text-forest">Start listening to news broadcasts to see your analytics here.</p>
          </div>
        )}
      </div>
    </main>
  );
};

const StatCard = ({ icon: Icon, label, value, small }) => (
  <div className="narvo-border bg-surface/10 p-3 md:p-4" data-testid={`stat-${label.toLowerCase()}`}>
    <div className="flex items-center gap-1.5 mb-2">
      <Icon weight="bold" className="w-3.5 h-3.5 text-primary" />
      <span className="mono-ui text-[9px] text-forest/60 tracking-[0.1em]">{label}</span>
    </div>
    <span className={`font-display ${small ? 'text-sm' : 'text-xl md:text-2xl'} font-bold text-content`}>
      {value}
    </span>
  </div>
);

export default AnalyticsPage;

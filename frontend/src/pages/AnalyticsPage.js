import React, { useState, useEffect } from 'react';
import { ChartBar, Lightning, Clock, Fire, Broadcast, TrendUp, TrendDown, ArrowRight, SunHorizon, Sun, Moon } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../lib/api';

const CATEGORY_COLORS = {
  general: '#6B8A7A', politics: '#D4A574', technology: '#7B9BAA', business: '#A8B87A',
  sports: '#D49B7A', health: '#8AB89B', entertainment: '#B88A9B', science: '#9B8AB8',
  tech: '#7B9BAA', economy: '#A8B87A',
};

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id || 'guest';
    api.get(`api/analytics/${userId}`)
      .then(r => r.json())
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll bg-background-dark p-4 md:p-8 pb-32 md:pb-8" data-testid="analytics-page">
        <div className="max-w-4xl mx-auto space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 narvo-border bg-surface/20 animate-pulse" />)}
        </div>
      </main>
    );
  }

  const maxDaily = Math.max(...(analytics?.daily_activity?.map(d => d.count) || [1]));
  const maxWeekly = Math.max(...(analytics?.weekly_trend?.map(w => w.count) || [1]));
  const maxHourly = Math.max(...Object.values(analytics?.hourly_distribution || {'0': 1}));
  const comparison = analytics?.period_comparison;

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll bg-background-dark p-4 md:p-8 pb-32 md:pb-8" data-testid="analytics-page">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-primary/30 pb-3">
          <ChartBar weight="fill" className="w-5 h-5 text-primary" />
          <h1 className="font-display text-xl md:text-2xl font-bold text-content uppercase tracking-tight">ANALYTICS</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <StatCard icon={Broadcast} label="LISTENS" value={analytics?.total_listens || 0} />
          <StatCard icon={Clock} label="MINUTES" value={analytics?.total_duration_minutes || 0} />
          <StatCard icon={Fire} label="STREAK" value={`${analytics?.streak || 0}d`} />
          <StatCard icon={TrendUp} label="TOP" value={analytics?.top_categories?.[0]?.toUpperCase() || '--'} small />
        </div>

        {/* Period Comparison */}
        {comparison && (
          <section className="narvo-border bg-surface/10 p-4 md:p-5" data-testid="period-comparison">
            <h2 className="mono-ui text-[11px] text-primary font-bold tracking-[0.15em] mb-3">{'//'} WEEKLY_COMPARISON</h2>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex-1">
                <div className="flex items-end gap-3">
                  <div className="text-center flex-1">
                    <span className="font-display text-2xl md:text-3xl font-bold text-content">{comparison.this_week}</span>
                    <p className="mono-ui text-[9px] text-forest/50 mt-0.5">THIS WEEK</p>
                  </div>
                  <div className="text-center pb-2">
                    <ArrowRight weight="bold" className="w-4 h-4 text-forest/30" />
                  </div>
                  <div className="text-center flex-1">
                    <span className="font-display text-2xl md:text-3xl font-bold text-forest/60">{comparison.last_week}</span>
                    <p className="mono-ui text-[9px] text-forest/50 mt-0.5">LAST WEEK</p>
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1.5 ${
                comparison.trend === 'up' ? 'bg-green-500/10 text-green-400' :
                comparison.trend === 'down' ? 'bg-red-500/10 text-red-400' : 'bg-forest/10 text-forest'
              }`}>
                {comparison.trend === 'up' ? <TrendUp weight="bold" className="w-3.5 h-3.5" /> :
                 comparison.trend === 'down' ? <TrendDown weight="bold" className="w-3.5 h-3.5" /> : null}
                <span className="mono-ui text-[11px] font-bold">
                  {comparison.change_pct > 0 ? '+' : ''}{comparison.change_pct}%
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Weekly Trend */}
        {analytics?.weekly_trend?.length > 0 && (
          <section className="narvo-border bg-surface/10 p-4 md:p-5" data-testid="weekly-trend">
            <h2 className="mono-ui text-[11px] text-primary font-bold tracking-[0.15em] mb-3">{'//'} WEEKLY_TREND</h2>
            <div className="flex items-end gap-2 h-20">
              {analytics.weekly_trend.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="mono-ui text-[9px] text-forest/60 font-bold">{w.count}</span>
                  <div
                    className={`w-full transition-all duration-500 ${i === analytics.weekly_trend.length - 1 ? 'bg-primary' : 'bg-primary/40'}`}
                    style={{ height: `${Math.max(4, (w.count / (maxWeekly || 1)) * 56)}px` }}
                  />
                  <span className="mono-ui text-[8px] text-forest/40">{w.week}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Daily Activity */}
        {analytics?.daily_activity?.length > 0 && (
          <section className="narvo-border bg-surface/10 p-4 md:p-5" data-testid="daily-activity">
            <h2 className="mono-ui text-[11px] text-primary font-bold tracking-[0.15em] mb-3">{'//'} DAILY_ACTIVITY</h2>
            <div className="flex items-end gap-1 h-20">
              {analytics.daily_activity.map(d => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.count} listens`}>
                  <div
                    className="w-full bg-primary/70 hover:bg-primary transition-colors"
                    style={{ height: `${Math.max(4, (d.count / maxDaily) * 60)}px` }}
                  />
                  <span className="mono-ui text-[7px] text-forest/40 -rotate-45 origin-top-left whitespace-nowrap">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hourly Distribution */}
        {Object.keys(analytics?.hourly_distribution || {}).length > 0 && maxHourly > 0 && (
          <section className="narvo-border bg-surface/10 p-4 md:p-5" data-testid="hourly-distribution">
            <h2 className="mono-ui text-[11px] text-primary font-bold tracking-[0.15em] mb-3">{'//'} PEAK_HOURS</h2>
            <div className="flex items-end gap-px h-16">
              {Object.entries(analytics.hourly_distribution).map(([hour, count]) => {
                const h = parseInt(hour);
                const isMorning = h >= 6 && h < 12;
                const isAfternoon = h >= 12 && h < 18;
                const isEvening = h >= 18 && h < 22;
                const color = isMorning ? 'bg-yellow-500/60' : isAfternoon ? 'bg-primary/60' : isEvening ? 'bg-orange-500/60' : 'bg-forest/30';
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center" title={`${hour}:00 - ${count} listens`}>
                    <div
                      className={`w-full ${color} hover:opacity-100 transition-opacity ${count > 0 ? 'opacity-80' : 'opacity-20'}`}
                      style={{ height: `${Math.max(2, (count / (maxHourly || 1)) * 48)}px` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1.5">
              <div className="flex items-center gap-1">
                <Moon weight="bold" className="w-2.5 h-2.5 text-forest/40" />
                <span className="mono-ui text-[8px] text-forest/40">00</span>
              </div>
              <div className="flex items-center gap-1">
                <SunHorizon weight="bold" className="w-2.5 h-2.5 text-yellow-500/60" />
                <span className="mono-ui text-[8px] text-forest/40">06</span>
              </div>
              <div className="flex items-center gap-1">
                <Sun weight="bold" className="w-2.5 h-2.5 text-primary/60" />
                <span className="mono-ui text-[8px] text-forest/40">12</span>
              </div>
              <div className="flex items-center gap-1">
                <Moon weight="bold" className="w-2.5 h-2.5 text-orange-500/60" />
                <span className="mono-ui text-[8px] text-forest/40">18</span>
              </div>
              <span className="mono-ui text-[8px] text-forest/40">24</span>
            </div>
          </section>
        )}

        {/* Category Breakdown */}
        {Object.keys(analytics?.categories || {}).length > 0 && (
          <section className="narvo-border bg-surface/10 p-4 md:p-5" data-testid="category-breakdown">
            <h2 className="mono-ui text-[11px] text-primary font-bold tracking-[0.15em] mb-3">{'//'} CATEGORIES</h2>
            <div className="space-y-2">
              {Object.entries(analytics.categories).map(([cat, count]) => {
                const total = analytics.total_listens || 1;
                const pct = Math.round((count / total) * 100);
                const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.general;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="mono-ui text-[10px] text-forest w-20 uppercase truncate">{cat}</span>
                    <div className="flex-1 h-4 bg-surface/30 overflow-hidden">
                      <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <span className="mono-ui text-[10px] text-content font-bold w-12 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Source Breakdown */}
        {Object.keys(analytics?.sources || {}).length > 0 && (
          <section className="narvo-border bg-surface/10 p-4 md:p-5" data-testid="source-breakdown">
            <h2 className="mono-ui text-[11px] text-primary font-bold tracking-[0.15em] mb-3">{'//'} TOP_SOURCES</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(analytics.sources).slice(0, 6).map(([src, count]) => (
                <div key={src} className="narvo-border bg-surface/20 p-2.5 flex items-center justify-between">
                  <span className="mono-ui text-[9px] text-forest truncate flex-1 min-w-0">{src}</span>
                  <span className="mono-ui text-[10px] text-primary font-bold ml-2 shrink-0">{count}</span>
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
  <div className="narvo-border bg-surface/10 p-3" data-testid={`stat-${label.toLowerCase()}`}>
    <div className="flex items-center gap-1.5 mb-1.5">
      <Icon weight="bold" className="w-3.5 h-3.5 text-primary" />
      <span className="mono-ui text-[8px] md:text-[9px] text-forest/60 tracking-[0.1em]">{label}</span>
    </div>
    <span className={`font-display ${small ? 'text-sm' : 'text-lg md:text-2xl'} font-bold text-content`}>
      {value}
    </span>
  </div>
);

export default AnalyticsPage;

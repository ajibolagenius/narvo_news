import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Languages, Bookmark, BookmarkCheck, ArrowDown, Activity, CloudSun } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useBookmarks } from '../hooks/useBookmarks';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/news?limit=15`).then(r => r.json()),
      fetch(`${API_URL}/api/metrics`).then(r => r.json()).catch(() => null),
    ]).then(([newsData, metricsData]) => {
      setNews(newsData);
      setMetrics(metricsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const featured = news[0];
  const stream = news.slice(1);

  const toggleBookmark = (e, item) => {
    e.stopPropagation();
    if (isBookmarked(item.id)) removeBookmark(item.id);
    else addBookmark(item);
  };

  const timeAgo = (idx) => {
    const times = ['1HR_AGO', '2HR_AGO', '3HR_AGO', '4HR_AGO', '6HR_AGO', '8HR_AGO', '12HR_AGO'];
    return times[idx % times.length];
  };

  return (
    <>
      {/* Primary Feed Container */}
      <main className="flex-1 flex flex-col bg-background-dark min-w-0">
        {/* Feed Sub-Header */}
        <div className="h-14 flex items-center justify-between px-8 bg-surface/30 narvo-border-b shrink-0">
          <div className="flex items-center gap-3">
            <span className="mono-ui text-[10px] text-forest">CHANNEL: <span className="text-primary">NIGERIA_LGS_01</span></span>
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="mono-ui text-[10px] text-forest">LIVE_TRANSMISSION</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="mono-ui text-[10px] text-forest border border-forest px-3 py-1 hover:bg-forest hover:text-white transition-colors" data-testid="filter-btn">FILTERS</button>
            <button className="mono-ui text-[10px] text-primary border border-primary px-3 py-1 hover:bg-primary hover:text-background-dark transition-colors" data-testid="sort-btn">SORT_PRIORITY</button>
          </div>
        </div>

        {/* Feed Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-8" data-testid="news-feed">
          <div className="max-w-4xl mx-auto flex flex-col gap-12">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-end gap-1 h-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-1 bg-forest animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Featured Transmission */}
                {featured && (
                  <section>
                    <span className="mono-ui text-[9px] text-primary block mb-4 font-bold tracking-[0.2em]">{'//'} PRIORITY_TRANSMISSION</span>
                    <article
                      className="narvo-border bg-surface/50 group relative overflow-hidden flex flex-col md:flex-row min-h-[320px] cursor-pointer"
                      onClick={() => navigate(`/news/${featured.id}`)}
                      data-testid="featured-card"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="md:w-1/2 relative bg-background-dark overflow-hidden min-h-[200px]">
                        <img
                          alt={featured.title}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale hover:grayscale-0 absolute inset-0"
                          src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="bg-primary text-background-dark font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-tighter">Feature</span>
                          <span className="bg-black/50 text-white font-mono text-[9px] px-2 py-0.5 uppercase border border-white/20 backdrop-blur-md">{new Date().toISOString().split('T')[1].split('.')[0].slice(0,5)} UTC</span>
                        </div>
                      </div>
                      <div className="flex-1 p-8 flex flex-col justify-between">
                        <div>
                          <span className="mono-ui text-[10px] text-forest block mb-2 font-bold tracking-widest">NARRATIVE_NODE {'//'} {featured.category?.toUpperCase()}</span>
                          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-white mb-4 leading-none group-hover:text-primary transition-colors">
                            {featured.title}
                          </h2>
                          <p className="text-sm text-forest font-mono leading-relaxed mb-6 opacity-80 line-clamp-3">
                            {featured.summary}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); playTrack(featured); }}
                            className="flex-1 h-12 bg-primary text-background-dark font-display font-bold text-sm uppercase flex items-center justify-center gap-3 hover:bg-white transition-all"
                            data-testid="featured-play-btn"
                          >
                            <PlayCircle className="w-6 h-6" />
                            <span>Play Briefing</span>
                          </button>
                          <button className="w-12 h-12 narvo-border flex items-center justify-center text-primary group-hover:border-primary transition-colors" title="Translate" onClick={(e) => e.stopPropagation()}>
                            <Languages className="w-5 h-5" />
                          </button>
                          <button
                            className={`w-12 h-12 narvo-border flex items-center justify-center transition-colors ${isBookmarked(featured.id) ? 'text-primary border-primary' : 'text-forest hover:text-primary'}`}
                            onClick={(e) => toggleBookmark(e, featured)}
                            data-testid="featured-bookmark-btn"
                          >
                            {isBookmarked(featured.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </article>
                  </section>
                )}

                {/* Synthesized Streams */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-forest/30 pb-2">
                    <span className="mono-ui text-[9px] text-forest font-bold tracking-[0.2em]">{'//'} SYNTHESIZED_STREAMS</span>
                    <span className="mono-ui text-[8px] text-forest/50 uppercase">Active_Nodes: {String(stream.length).padStart(2, '0')}</span>
                  </div>

                  <div className="narvo-border bg-surface/20 divide-y divide-forest/10">
                    {stream.map((item, idx) => (
                      <article
                        key={item.id}
                        className="p-6 group hover:bg-surface/40 transition-colors cursor-pointer"
                        onClick={() => navigate(`/news/${item.id}`)}
                        data-testid={`stream-card-${item.id}`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <span className="bg-forest/20 text-primary mono-ui text-[8px] px-2 py-0.5 border border-forest/30">SOURCE:{item.source?.toUpperCase().replace(/\s/g, '_')}</span>
                              <span className="mono-ui text-[8px] text-forest/50">{timeAgo(idx)}</span>
                            </div>
                            <div className="flex gap-2">
                              {item.tags?.slice(0, 2).map((tag, i) => (
                                <span key={i} className="mono-ui text-[8px] text-forest border border-forest/20 px-1.5 font-bold">#{tag.toUpperCase()}</span>
                              ))}
                              {!item.tags?.length && <span className="mono-ui text-[8px] text-forest border border-forest/20 px-1.5 font-bold">#{item.category?.toUpperCase()}</span>}
                            </div>
                          </div>
                          <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white group-hover:text-primary transition-colors leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-xs text-forest font-mono leading-relaxed opacity-70 line-clamp-2">
                            {item.summary}
                          </p>
                          <div className="flex items-center gap-6 pt-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); playTrack(item); }}
                              className="mono-ui text-[9px] text-primary flex items-center gap-2 hover:text-white transition-colors"
                              data-testid={`play-btn-${item.id}`}
                            >
                              <svg className="w-4 h-4 text-forest" viewBox="0 0 256 256" fill="currentColor">
                                <path d="M56,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM88,24a8,8,0,0,0-8,8V224a8,8,0,0,0,16,0V32A8,8,0,0,0,88,24Zm40,32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V64A8,8,0,0,0,128,56Z"/>
                              </svg>
                              <span>GENERATE_AUDIO_BRIEF</span>
                            </button>
                            <div className="flex-1 h-[1px] bg-forest/10" />
                            <button
                              onClick={(e) => toggleBookmark(e, item)}
                              className={`transition-colors ${isBookmarked(item.id) ? 'text-primary' : 'text-forest hover:text-primary'}`}
                              data-testid={`bookmark-btn-${item.id}`}
                            >
                              {isBookmarked(item.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <button className="w-full h-12 narvo-border bg-surface/10 mono-ui text-[10px] text-forest hover:bg-surface hover:text-primary transition-all flex items-center justify-center gap-3" data-testid="load-more-btn">
                    <ArrowDown className="w-4 h-4" />
                    <span>LOAD_ADDITIONAL_TRANSMISSIONS</span>
                  </button>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar: Telemetry */}
      <aside className="w-80 hidden xl:flex flex-col narvo-border-l bg-background-dark shrink-0" data-testid="telemetry-sidebar">
        <div className="h-20 flex items-center px-6 narvo-border-b bg-surface/10">
          <span className="mono-ui text-xs font-bold text-forest tracking-widest uppercase flex items-center gap-3">
            <Activity className="text-primary w-4 h-4" /> Telemetry_Center
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scroll">
          {/* Weather */}
          <div className="narvo-border bg-surface/20 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20"><CloudSun className="w-10 h-10" /></div>
            <span className="mono-ui text-[9px] text-forest block mb-3 font-bold tracking-widest">REGIONAL_ENV_METRICS</span>
            <div className="flex items-end justify-between">
              <div>
                <span className="font-display text-3xl font-bold text-white tracking-tighter">28°C</span>
                <span className="mono-ui text-[9px] text-forest block mt-1">LAGOS, NIGERIA</span>
              </div>
              <div className="text-right">
                <span className="mono-ui text-[9px] text-primary font-bold">HUMIDITY: 62%</span>
                <span className="mono-ui text-[9px] text-forest block">WIND: 12km/h</span>
              </div>
            </div>
          </div>

          {/* Trending Tags */}
          <div>
            <span className="mono-ui text-[9px] text-forest block mb-4 font-bold tracking-widest">PULSE_TAGS_TRENDING</span>
            <div className="flex flex-wrap gap-2">
              {['#ECONOMY_VOL', '#SOLAR_GRID', '#AI_SYNTH', '#ENERGY_DENSITY', '#NIGERIAN_TECH'].map(tag => (
                <span key={tag} className="narvo-border px-2 py-1 mono-ui text-[8px] text-white hover:bg-forest hover:text-background-dark cursor-pointer transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Regional Matrix Health */}
          <div>
            <span className="mono-ui text-[9px] text-forest block mb-4 font-bold tracking-widest">REGIONAL_MATRIX_HEALTH</span>
            <div className="space-y-4">
              {[
                { name: 'LAGOS_NODE', pct: 98, color: 'bg-primary', textColor: 'text-primary' },
                { name: 'NAIROBI_NODE', pct: 84, color: 'bg-forest', textColor: 'text-forest' },
                { name: 'ACCRA_NODE', pct: 91, color: 'bg-primary', textColor: 'text-primary' },
                { name: 'JHB_NODE', pct: 76, color: 'bg-forest', textColor: 'text-forest' },
              ].map(node => (
                <div key={node.name} className="space-y-1">
                  <div className="flex justify-between mono-ui text-[9px]">
                    <span className="text-white">{node.name}</span>
                    <span className={`${node.textColor} font-bold`}>{node.pct}%</span>
                  </div>
                  <div className="h-1 w-full bg-forest/20"><div className={`h-full ${node.color}`} style={{ width: `${node.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-[1px] narvo-border bg-forest">
            <div className="bg-background-dark p-4 flex flex-col justify-between h-24">
              <span className="mono-ui text-[8px] text-forest">LISTENERS</span>
              <span className="font-display text-2xl font-bold text-white tracking-tighter">{metrics?.total_listeners || '14.2K'}</span>
            </div>
            <div className="bg-background-dark p-4 flex flex-col justify-between h-24">
              <span className="mono-ui text-[8px] text-forest">SOURCES</span>
              <span className="font-display text-2xl font-bold text-primary tracking-tighter">{metrics?.total_sources || '7'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardPage;

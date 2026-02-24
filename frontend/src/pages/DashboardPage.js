import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Languages, Bookmark, BookmarkCheck, ArrowDown, Activity, CloudSun, Share2 } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { FeaturedSkeleton, StreamCardSkeleton } from '../components/Skeleton';
import TruthTag from '../components/TruthTag';
import { useHapticAlert } from '../components/HapticAlerts';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const { playTrack } = useAudio();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { showAlert } = useHapticAlert();

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
    if (isBookmarked(item.id)) {
      removeBookmark(item.id);
      showAlert('BOOKMARK_REMOVED');
    } else {
      addBookmark(item);
      showAlert('BOOKMARK_ADDED');
    }
  };

  const shareStory = async (e, item) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/news/${item.id}`;
    const shareText = `${item.title} - Listen on NARVO`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: shareText,
          url: shareUrl,
        });
        showAlert({
          type: 'success',
          title: 'SHARED_SUCCESS',
          message: 'Story shared successfully.',
          code: 'SHARE_OK',
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(shareUrl);
          showAlert({
            type: 'sync',
            title: 'LINK_COPIED',
            message: 'Story link copied to clipboard.',
            code: 'CLIP_OK',
          });
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      await navigator.clipboard.writeText(shareUrl);
      showAlert({
        type: 'sync',
        title: 'LINK_COPIED',
        message: 'Story link copied to clipboard.',
        code: 'CLIP_OK',
      });
    }
  };

  const timeAgo = (idx) => {
    const times = ['1HR_AGO', '2HR_AGO', '3HR_AGO', '4HR_AGO', '6HR_AGO', '8HR_AGO', '12HR_AGO'];
    return times[idx % times.length];
  };

  return (
    <>
      {/* Primary Feed */}
      <main className="flex-1 flex flex-col bg-background-dark min-w-0">
        {/* Sub-Header */}
        <div className="h-12 md:h-14 flex items-center justify-between px-4 md:px-8 bg-surface/30 narvo-border-b shrink-0">
          <div className="flex items-center gap-3">
            <span className="mono-ui text-[10px] md:text-xs text-forest">CHANNEL: <span className="text-primary">NIGERIA_LGS_01</span></span>
            <div className="w-2.5 h-2.5 bg-primary animate-pulse" />
            <span className="mono-ui text-[10px] md:text-xs text-forest hidden sm:inline">LIVE_TRANSMISSION</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="mono-ui text-[10px] md:text-xs text-forest border border-forest px-2 md:px-3 py-1 hover:bg-forest hover:text-white transition-colors" data-testid="filter-btn">FILTERS</button>
            <button className="mono-ui text-[10px] md:text-xs text-primary border border-primary px-2 md:px-3 py-1 hover:bg-primary hover:text-background-dark transition-colors" data-testid="sort-btn">SORT</button>
          </div>
        </div>

        {/* Feed Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 pb-20 md:pb-8" data-testid="news-feed">
          <div className="max-w-4xl mx-auto flex flex-col gap-8 md:gap-12">
            {loading ? (
              <>
                <div>
                  <div className="h-3 w-32 bg-forest/10 animate-pulse mb-4" />
                  <FeaturedSkeleton />
                </div>
                <div>
                  <div className="h-3 w-40 bg-forest/10 animate-pulse mb-4" />
                  <div className="narvo-border bg-surface/20 divide-y divide-forest/10">
                    {Array.from({ length: 5 }).map((_, i) => <StreamCardSkeleton key={i} />)}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Featured Transmission */}
                {featured && (
                  <section>
                    <span className="mono-ui text-[10px] md:text-xs text-primary block mb-4 font-bold tracking-[0.2em]">{'//'} PRIORITY_TRANSMISSION</span>
                    <article
                      className="narvo-border bg-surface/50 group relative overflow-hidden flex flex-col md:flex-row min-h-[280px] md:min-h-[320px] cursor-pointer"
                      onClick={() => navigate(`/news/${featured.id}`)}
                      data-testid="featured-card"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="md:w-1/2 relative bg-background-dark overflow-hidden min-h-[180px] md:min-h-[200px]">
                        <img
                          alt={featured.title}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale hover:grayscale-0 absolute inset-0"
                          src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="bg-primary text-background-dark font-mono text-[9px] md:text-[10px] font-bold px-2 py-0.5 uppercase">Feature</span>
                          <TruthTag storyId={featured.id} compact />
                        </div>
                      </div>
                      <div className="flex-1 p-5 md:p-8 flex flex-col justify-between">
                        <div>
                          <span className="mono-ui text-[10px] md:text-xs text-forest block mb-2 font-bold tracking-widest">NARRATIVE_NODE {'//'} {featured.category?.toUpperCase()}</span>
                          <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-3 md:mb-4 leading-none group-hover:text-primary transition-colors">
                            {featured.title}
                          </h2>
                          <p className="text-sm md:text-base text-forest font-mono leading-relaxed mb-4 md:mb-6 opacity-80 line-clamp-3">
                            {featured.summary}
                          </p>
                        </div>
                        <div className="flex gap-3 md:gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); playTrack(featured); }}
                            className="flex-1 h-11 md:h-12 bg-primary text-background-dark font-display font-bold text-sm md:text-base uppercase flex items-center justify-center gap-2 md:gap-3 hover:bg-white transition-all"
                            data-testid="featured-play-btn"
                          >
                            <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
                            <span>Play Briefing</span>
                          </button>
                          <button className="w-11 h-11 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary" title="Translate" onClick={(e) => e.stopPropagation()}>
                            <Languages className="w-5 h-5" />
                          </button>
                          <button
                            className="w-11 h-11 md:w-12 md:h-12 narvo-border flex items-center justify-center text-forest hover:text-primary transition-colors"
                            onClick={(e) => shareStory(e, featured)}
                            title="Share"
                            data-testid="featured-share-btn"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                          <button
                            className={`w-11 h-11 md:w-12 md:h-12 narvo-border flex items-center justify-center transition-colors ${isBookmarked(featured.id) ? 'text-primary border-primary' : 'text-forest hover:text-primary'}`}
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
                <section className="space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between border-b border-forest/30 pb-2">
                    <span className="mono-ui text-[10px] md:text-xs text-forest font-bold tracking-[0.2em]">{'//'} SYNTHESIZED_STREAMS</span>
                    <span className="mono-ui text-[9px] md:text-[10px] text-forest/50 uppercase">Nodes: {String(stream.length).padStart(2, '0')}</span>
                  </div>

                  <div className="narvo-border bg-surface/20 divide-y divide-forest/10">
                    {stream.map((item, idx) => (
                      <article
                        key={item.id}
                        className="p-4 md:p-6 group hover:bg-surface/40 transition-colors cursor-pointer"
                        onClick={() => navigate(`/news/${item.id}`)}
                        data-testid={`stream-card-${item.id}`}
                      >
                        <div className="flex flex-col gap-2 md:gap-3">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                            <div className="flex items-center gap-2 md:gap-3">
                              <span className="bg-forest/20 text-primary mono-ui text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 border border-forest/30">SOURCE:{item.source?.toUpperCase().replace(/\s/g, '_').slice(0, 15)}</span>
                              <span className="mono-ui text-[9px] md:text-[10px] text-forest/50">{timeAgo(idx)}</span>
                              <TruthTag storyId={item.id} compact />
                            </div>
                            <div className="flex gap-1.5 md:gap-2">
                              {!item.tags?.length && <span className="mono-ui text-[8px] md:text-[9px] text-forest border border-forest/20 px-1 md:px-1.5 font-bold">#{item.category?.toUpperCase()}</span>}
                              {item.tags?.slice(0, 2).map((tag, i) => (
                                <span key={i} className="mono-ui text-[8px] md:text-[9px] text-forest border border-forest/20 px-1 md:px-1.5 font-bold">#{tag.toUpperCase()}</span>
                              ))}
                            </div>
                          </div>
                          <h3 className="font-display text-lg md:text-xl font-bold uppercase tracking-tight text-white group-hover:text-primary transition-colors leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-sm md:text-base text-forest font-mono leading-relaxed opacity-70 line-clamp-2">
                            {item.summary}
                          </p>
                          <div className="flex items-center gap-4 md:gap-6 pt-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); playTrack(item); }}
                              className="mono-ui text-[10px] md:text-xs text-primary flex items-center gap-2 hover:text-white transition-colors"
                              data-testid={`play-btn-${item.id}`}
                            >
                              <svg className="w-4 h-4 text-forest" viewBox="0 0 256 256" fill="currentColor">
                                <path d="M56,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM88,24a8,8,0,0,0-8,8V224a8,8,0,0,0,16,0V32A8,8,0,0,0,88,24Zm40,32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V64A8,8,0,0,0,128,56Z"/>
                              </svg>
                              <span>GENERATE_AUDIO</span>
                            </button>
                            <div className="flex-1 h-[1px] bg-forest/10" />
                            <button
                              onClick={(e) => shareStory(e, item)}
                              className="text-forest hover:text-primary transition-colors"
                              title="Share"
                              data-testid={`share-btn-${item.id}`}
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => toggleBookmark(e, item)}}
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

                  <button className="w-full h-11 md:h-12 narvo-border bg-surface/10 mono-ui text-[10px] md:text-xs text-forest hover:bg-surface hover:text-primary transition-all flex items-center justify-center gap-3" data-testid="load-more-btn">
                    <ArrowDown className="w-4 h-4" />
                    <span>LOAD_MORE</span>
                  </button>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar: Telemetry - hidden on mobile/tablet */}
      <aside className="w-72 xl:w-80 hidden xl:flex flex-col narvo-border-l bg-background-dark shrink-0" data-testid="telemetry-sidebar">
        <div className="h-16 flex items-center px-5 narvo-border-b bg-surface/10">
          <span className="mono-ui text-xs font-bold text-forest tracking-widest uppercase flex items-center gap-3">
            <Activity className="text-primary w-4 h-4" /> Telemetry_Center
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scroll">
          {/* Weather */}
          <div className="narvo-border bg-surface/20 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20"><CloudSun className="w-8 h-8" /></div>
            <span className="mono-ui text-[10px] text-forest block mb-3 font-bold tracking-widest">REGIONAL_ENV</span>
            <div className="flex items-end justify-between">
              <div>
                <span className="font-display text-3xl font-bold text-white tracking-tighter">28°C</span>
                <span className="mono-ui text-[10px] text-forest block mt-1">LAGOS, NIGERIA</span>
              </div>
              <div className="text-right">
                <span className="mono-ui text-[10px] text-primary font-bold">HUM: 62%</span>
                <span className="mono-ui text-[10px] text-forest block">WIND: 12km/h</span>
              </div>
            </div>
          </div>

          {/* Trending Tags */}
          <div>
            <span className="mono-ui text-[10px] text-forest block mb-3 font-bold tracking-widest">TRENDING</span>
            <div className="flex flex-wrap gap-1.5">
              {['#ECONOMY', '#SOLAR_GRID', '#AI_SYNTH', '#ENERGY', '#TECH'].map(tag => (
                <span key={tag} className="narvo-border px-2 py-1 mono-ui text-[9px] text-white hover:bg-forest hover:text-background-dark cursor-pointer transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Regional Health */}
          <div>
            <span className="mono-ui text-[10px] text-forest block mb-3 font-bold tracking-widest">NODE_HEALTH</span>
            <div className="space-y-3">
              {[
                { name: 'LAGOS', pct: 98, color: 'bg-primary' },
                { name: 'NAIROBI', pct: 84, color: 'bg-forest' },
                { name: 'ACCRA', pct: 91, color: 'bg-primary' },
                { name: 'JHB', pct: 76, color: 'bg-forest' },
              ].map(node => (
                <div key={node.name} className="space-y-1">
                  <div className="flex justify-between mono-ui text-[10px]">
                    <span className="text-white">{node.name}_NODE</span>
                    <span className={`${node.color === 'bg-primary' ? 'text-primary' : 'text-forest'} font-bold`}>{node.pct}%</span>
                  </div>
                  <div className="h-1 w-full bg-forest/20"><div className={`h-full ${node.color}`} style={{ width: `${node.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-[1px] narvo-border bg-forest">
            <div className="bg-background-dark p-3 flex flex-col justify-between h-20">
              <span className="mono-ui text-[9px] text-forest">LISTENERS</span>
              <span className="font-display text-2xl font-bold text-white tracking-tighter">{metrics?.total_listeners || '14.2K'}</span>
            </div>
            <div className="bg-background-dark p-3 flex flex-col justify-between h-20">
              <span className="mono-ui text-[9px] text-forest">SOURCES</span>
              <span className="font-display text-2xl font-bold text-primary tracking-tighter">{metrics?.total_sources || '7'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardPage;

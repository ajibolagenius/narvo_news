import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PlayCircle, Translate, BookmarkSimple, ArrowDown, Pulse, CloudSun, ShareNetwork, Queue, CloudArrowDown, Broadcast } from '@phosphor-icons/react';
import { useAudio } from '../contexts/AudioContext';
import { useContentSources } from '../contexts/ContentSourcesContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { FeaturedSkeleton, StreamCardSkeleton } from '../components/Skeleton';
import TruthTag from '../components/TruthTag';
import { useHapticAlert } from '../components/HapticAlerts';
import { getCategoryImage, getCategoryColor } from '../lib/categoryImages';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Save article for offline
const saveForOffline = async (item) => {
  try {
    await fetch(`${API_URL}/api/offline/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        story_id: item.id,
        title: item.title,
        summary: item.summary || '',
        narrative: item.narrative || '',
        source: item.source || '',
        category: item.category || 'General',
        image_url: item.image_url || null
      })
    });
    return true;
  } catch (e) {
    console.error('Error saving for offline:', e);
    return false;
  }
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const { playTrack, addToQueue } = useAudio();
  const { getTotalSources, getLocalSources, getInternationalSources, getContinentalSources, getSourcesByRegion, getHealthForSource, getHealthSummary, refreshHealth } = useContentSources();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { showAlert } = useHapticAlert();

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/news?limit=50`).then(r => r.json()),
      fetch(`${API_URL}/api/metrics`).then(r => r.json()).catch(() => null),
    ]).then(([newsData, metricsData]) => {
      setNews(newsData);
      setMetrics(metricsData);
      setLoading(false);
      if (newsData.length <= 10) setAllLoaded(true);
    }).catch(() => setLoading(false));
  }, []);

  const featured = news[0];
  const stream = news.slice(1, visibleCount + 1);

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      const next = visibleCount + 10;
      setVisibleCount(next);
      if (next + 1 >= news.length) setAllLoaded(true);
      setLoadingMore(false);
    }, 400);
  };

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

  const handleSaveOffline = async (e, item) => {
    e.stopPropagation();
    const success = await saveForOffline(item);
    if (success) {
      showAlert({
        type: 'success',
        title: 'SAVED_OFFLINE',
        message: `"${item.title?.slice(0, 30)}..." saved for offline reading.`,
        code: 'OFFLINE_OK',
      });
    } else {
      showAlert({
        type: 'warning',
        title: 'SAVE_FAILED',
        message: 'Could not save article for offline.',
        code: 'OFFLINE_ERR',
      });
    }
  };

  const timeAgo = (idx) => {
    const times = ['1HR_AGO', '2HR_AGO', '3HR_AGO', '4HR_AGO', '6HR_AGO', '8HR_AGO', '12HR_AGO'];
    return times[idx % times.length];
  };

  return (
    <div className="flex-1 flex min-h-0">
      {/* Primary Feed */}
      <main className="flex-1 flex flex-col bg-background-dark min-w-0 min-h-0">
        {/* Sub-Header */}
        <div className="h-12 md:h-14 flex items-center justify-between px-4 md:px-8 bg-surface/30 narvo-border-b shrink-0">
          <div className="flex items-center gap-3">
            <span className="mono-ui text-[10px] md:text-xs text-forest">CHANNEL: <span className="text-primary">NIGERIA_LGS_01</span></span>
            <div className="w-2.5 h-2.5 bg-primary animate-pulse" />
            <span className="mono-ui text-[10px] md:text-xs text-forest hidden sm:inline">LIVE_TRANSMISSION</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="mono-ui text-[10px] md:text-xs text-forest border border-forest px-2 md:px-3 py-1 hover:bg-forest hover:text-content transition-colors" data-testid="filter-btn">FILTERS</button>
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
                  <motion.section
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <span className="mono-ui text-[10px] md:text-xs text-primary block mb-4 font-bold tracking-[0.2em]">{'//'} {t('dashboard.featured_transmission')}</span>
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
                          src={featured.image_url || getCategoryImage(featured.category || featured.tags?.[0], featured.id)}
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
                          <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-content mb-3 md:mb-4 leading-none group-hover:text-primary transition-colors">
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
                            <PlayCircle weight="fill" className="w-5 h-5 md:w-6 md:h-6" />
                            <span>{t('dashboard.listen_now')}</span>
                          </button>
                          <button className="w-11 h-11 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary" title="Translate" onClick={(e) => e.stopPropagation()}>
                            <Translate weight="bold" className="w-5 h-5" />
                          </button>
                          <button
                            className="w-11 h-11 md:w-12 md:h-12 narvo-border flex items-center justify-center text-forest hover:text-primary transition-colors"
                            onClick={(e) => handleSaveOffline(e, featured)}
                            title="Save for Offline"
                            data-testid="featured-offline-btn"
                          >
                            <CloudArrowDown weight="bold" className="w-5 h-5" />
                          </button>
                          <button
                            className="w-11 h-11 md:w-12 md:h-12 narvo-border flex items-center justify-center text-forest hover:text-primary transition-colors"
                            onClick={(e) => shareStory(e, featured)}
                            title="Share"
                            data-testid="featured-share-btn"
                          >
                            <ShareNetwork weight="bold" className="w-5 h-5" />
                          </button>
                          <button
                            className={`w-11 h-11 md:w-12 md:h-12 narvo-border flex items-center justify-center transition-colors ${isBookmarked(featured.id) ? 'text-primary border-primary' : 'text-forest hover:text-primary'}`}
                            onClick={(e) => toggleBookmark(e, featured)}
                            data-testid="featured-bookmark-btn"
                          >
                            <BookmarkSimple weight={isBookmarked(featured.id) ? 'fill' : 'regular'} className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  </motion.section>
                )}

                {/* Synthesized Streams */}
                <motion.section
                  className="space-y-4 md:space-y-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <div className="flex items-center justify-between border-b border-forest/30 pb-2">
                    <span className="mono-ui text-[10px] md:text-xs text-forest font-bold tracking-[0.2em]">{'//'} {t('dashboard.synthesized_streams')}</span>
                    <span className="mono-ui text-[9px] md:text-[10px] text-forest/50 uppercase">Nodes: {String(stream.length).padStart(2, '0')}</span>
                  </div>

                  <motion.div variants={cardVariants} className="narvo-border bg-surface/20 divide-y divide-forest/10">
                    {stream.map((item, idx) => (
                      <motion.article
                        key={item.id}
                        variants={cardVariants}
                        className="p-4 md:p-6 group hover:bg-surface/40 transition-colors cursor-pointer flex gap-4"
                        onClick={() => navigate(`/news/${item.id}`)}
                        data-testid={`stream-card-${item.id}`}
                      >
                        {/* Category thumbnail */}
                        <div className="hidden sm:block w-20 h-20 md:w-24 md:h-24 shrink-0 narvo-border overflow-hidden relative">
                          <img
                            src={item.image_url || getCategoryImage(item.category || item.tags?.[0], item.id)}
                            alt={item.category}
                            className="w-full h-full object-cover opacity-50 group-hover:opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${getCategoryColor(item.category || item.tags?.[0])} mix-blend-multiply`} />
                        </div>
                        <div className="flex-1 flex flex-col gap-2 md:gap-3 min-w-0">
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
                          <h3 className="font-display text-lg md:text-xl font-bold uppercase tracking-tight text-content group-hover:text-primary transition-colors leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-sm md:text-base text-forest font-mono leading-relaxed opacity-70 line-clamp-2">
                            {item.summary}
                          </p>
                          <div className="flex items-center gap-4 md:gap-6 pt-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); playTrack(item); }}
                              className="mono-ui text-[10px] md:text-xs text-primary flex items-center gap-2 hover:text-content transition-colors"
                              data-testid={`play-btn-${item.id}`}
                            >
                              <Pulse weight="bold" className="w-4 h-4 text-forest" />
                              <span>GENERATE_AUDIO</span>
                            </button>
                            <div className="flex-1 h-[1px] bg-forest/10" />
                            <button
                              onClick={(e) => { e.stopPropagation(); addToQueue(item); showAlert({ type: 'sync', title: 'QUEUE_UPDATED', message: `Added to queue: ${item.title?.slice(0, 40)}...`, code: 'Q_ADD', duration: 2000 }); }}
                              className="text-forest hover:text-primary transition-colors"
                              title="Add to Queue"
                              data-testid={`queue-btn-${item.id}`}
                            >
                              <Queue weight="bold" className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleSaveOffline(e, item)}
                              className="text-forest hover:text-primary transition-colors"
                              title="Save for Offline"
                              data-testid={`offline-btn-${item.id}`}
                            >
                              <CloudArrowDown weight="bold" className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => shareStory(e, item)}
                              className="text-forest hover:text-primary transition-colors"
                              title="Share"
                              data-testid={`share-btn-${item.id}`}
                            >
                              <ShareNetwork weight="bold" className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => toggleBookmark(e, item)}
                              className={`transition-colors ${isBookmarked(item.id) ? 'text-primary' : 'text-forest hover:text-primary'}`}
                              data-testid={`bookmark-btn-${item.id}`}
                            >
                              <BookmarkSimple weight={isBookmarked(item.id) ? 'fill' : 'regular'} className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </motion.div>

                  {!allLoaded && (
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full h-11 md:h-12 narvo-border bg-surface/10 mono-ui text-[10px] md:text-xs text-forest hover:bg-surface hover:text-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    data-testid="load-more-btn"
                  >
                    {loadingMore ? (
                      <div className="w-4 h-4 border-2 border-forest border-t-transparent animate-spin" />
                    ) : (
                      <ArrowDown weight="bold" className="w-4 h-4" />
                    )}
                    <span>{loadingMore ? 'LOADING...' : `LOAD_MORE // ${Math.max(0, news.length - 1 - visibleCount)} REMAINING`}</span>
                  </button>
                  )}
                  </motion.section>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar: Telemetry - hidden on mobile/tablet */}
      <aside className="w-72 xl:w-80 hidden xl:flex flex-col narvo-border-l bg-background-dark shrink-0" data-testid="telemetry-sidebar">
        <div className="h-16 flex items-center px-5 narvo-border-b bg-surface/10">
          <span className="mono-ui text-xs font-bold text-forest tracking-widest uppercase flex items-center gap-3">
            <Pulse weight="bold" className="text-primary w-4 h-4" /> {t('dashboard.telemetry')}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scroll">
          {/* Weather */}
          <div className="narvo-border bg-surface/20 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20"><CloudSun weight="fill" className="w-8 h-8" /></div>
            <span className="mono-ui text-[10px] text-forest block mb-3 font-bold tracking-widest">REGIONAL_ENV</span>
            <div className="flex items-end justify-between">
              <div>
                <span className="font-display text-3xl font-bold text-content tracking-tighter">28°C</span>
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
            <span className="mono-ui text-[10px] text-forest block mb-3 font-bold tracking-widest">{t('dashboard.trending')}</span>
            <div className="flex flex-wrap gap-1.5">
              {['#ECONOMY', '#SOLAR_GRID', '#AI_SYNTH', '#ENERGY', '#TECH'].map(tag => (
                <span key={tag} className="narvo-border px-2 py-1 mono-ui text-[9px] text-content hover:bg-forest hover:text-background-dark cursor-pointer transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Source Breakdown Widget */}
          <div className="narvo-border bg-surface/20 p-4 relative overflow-hidden" data-testid="source-breakdown-widget">
            <div className="absolute top-0 right-0 p-2 opacity-20"><Broadcast weight="fill" className="w-8 h-8" /></div>
            <div className="flex items-center justify-between mb-3">
              <span className="mono-ui text-[10px] text-forest font-bold tracking-widest">SOURCE_MATRIX</span>
              <span className="mono-ui text-[9px] text-primary font-bold">{getTotalSources()} FEEDS</span>
            </div>

            {/* Proportion bar */}
            <div className="flex h-1.5 w-full mb-4 gap-px">
              <div className="bg-primary transition-all" style={{ width: `${(getLocalSources() / (getTotalSources() || 1)) * 100}%` }} />
              <div className="bg-amber-500 transition-all" style={{ width: `${(getContinentalSources() / (getTotalSources() || 1)) * 100}%` }} />
              <div className="bg-forest transition-all" style={{ width: `${(getInternationalSources() / (getTotalSources() || 1)) * 100}%` }} />
            </div>

            {/* Region groups */}
            {[
              { key: 'local', label: 'LOCAL_NG', count: getLocalSources(), color: 'primary', dot: 'bg-primary' },
              { key: 'continental', label: 'CONTINENTAL_AF', count: getContinentalSources(), color: 'amber-500', dot: 'bg-amber-500' },
              { key: 'international', label: 'INTERNATIONAL', count: getInternationalSources(), color: 'forest', dot: 'bg-forest' },
            ].map(region => {
              const regionSources = getSourcesByRegion(region.key);
              return (
                <details key={region.key} className="group mb-2" data-testid={`source-region-${region.key}`}>
                  <summary className="flex items-center justify-between cursor-pointer py-1.5 list-none">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 ${region.dot} animate-pulse`} />
                      <span className="mono-ui text-[10px] text-content font-bold">{region.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`mono-ui text-[10px] font-bold text-${region.color}`}>{region.count}</span>
                      <span className="mono-ui text-[8px] text-forest group-open:rotate-90 transition-transform">&#9654;</span>
                    </div>
                  </summary>
                  <div className="pl-4 pt-1 pb-1 flex flex-wrap gap-x-1 gap-y-0.5">
                    {regionSources.map((src, i) => (
                      <span key={i} className="mono-ui text-[8px] text-forest/80 after:content-['\00b7'] after:mx-1 after:text-forest/30 last:after:content-['']">
                        {src.name}
                      </span>
                    ))}
                  </div>
                </details>
              );
            })}

            <div className="mt-2 pt-2 border-t border-forest/20 flex items-center justify-between">
              <span className="mono-ui text-[8px] text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary animate-pulse" />
                LIVE_AGGREGATION
              </span>
              <span className="mono-ui text-[7px] text-forest/50">UPDATED_LIVE</span>
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
                    <span className="text-content">{node.name}_NODE</span>
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
              <span className="font-display text-2xl font-bold text-content tracking-tighter">{metrics?.total_listeners || '14.2K'}</span>
            </div>
            <div className="bg-background-dark p-3 flex flex-col justify-between h-20">
              <span className="mono-ui text-[9px] text-forest">SOURCES</span>
              <span className="font-display text-2xl font-bold text-primary tracking-tighter">{metrics?.total_sources || '7'}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default DashboardPage;

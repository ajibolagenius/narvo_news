import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Play, Pause, BookmarkSimple, Translate, ArrowSquareOut, ArrowLeft, Lightbulb, ShareNetwork, Clock, Eye, Broadcast, Queue, CaretDown, CaretUp } from '@phosphor-icons/react';
import { useAudio } from '../contexts/AudioContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { useHapticAlert } from '../components/HapticAlerts';
import { ArticleSkeleton } from '../components/Skeleton';
import TruthTag from '../components/TruthTag';
import { TagPill } from '../components/HashtagText';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const MobileMetadata = ({ news, readTime, relatedNews, isBookmarked, toggleBookmark, addToQueue, shareStory, navigate, showAlert, t, formatPublishedDate }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="lg:hidden mt-8 narvo-border" data-testid="mobile-article-metadata">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full p-4 flex items-center justify-between bg-surface/10 hover:bg-surface/20 transition-colors"
        data-testid="mobile-metadata-toggle"
      >
        <span className="mono-ui text-[12px] text-forest font-bold tracking-widest uppercase">{t('news_detail.article_metadata')}</span>
        {open ? <CaretUp weight="bold" className="w-4 h-4 text-forest" /> : <CaretDown weight="bold" className="w-4 h-4 text-forest" />}
      </button>
      {open && (
        <div className="p-4 space-y-5 narvo-border-t">
          {/* Verification */}
          <div className="narvo-border bg-primary/5 p-3 border-primary/30">
            <span className="mono-ui text-[11px] text-forest block mb-2 font-bold tracking-widest">{t('news_detail.verification_status')}</span>
            <TruthTag storyId={news.id} />
          </div>
          {/* Signal Metadata */}
          <div className="narvo-border bg-surface/20 p-3">
            <span className="mono-ui text-[11px] text-forest block mb-2 font-bold tracking-widest">{t('news_detail.signal_metadata')}</span>
            <div className="space-y-2">
              {[
                [t('news_detail.category'), news.category?.toUpperCase() || 'GENERAL', true],
                [t('news_detail.source'), news.source?.toUpperCase() || 'UNKNOWN', false],
                [t('news_detail.region'), news.region?.toUpperCase() || 'AFRICA', false],
                [t('news_detail.read_time'), `${readTime} MIN`, true],
                [t('news_detail.ai_synthesis'), news.narrative ? t('news_detail.complete') : t('news_detail.pending'), true],
              ].map(([label, value, isPrimary], i) => (
                <div key={i} className="flex justify-between mono-ui text-[11px]">
                  <span className="text-forest">{label}</span>
                  <span className={isPrimary ? 'text-primary font-bold' : 'text-content'}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { addToQueue(news); showAlert({ type: 'sync', title: 'QUEUE_UPDATED', message: 'Added to playlist queue', code: 'Q_ADD', duration: 2000 }); }}
              className="flex-1 narvo-border py-2 mono-ui text-[11px] text-forest hover:text-primary hover:border-primary flex items-center justify-center gap-2 transition-colors"
              data-testid="mobile-queue-btn"
            >
              <Queue weight="bold" className="w-3 h-3" />
              QUEUE
            </button>
            <button
              onClick={shareStory}
              className="flex-1 narvo-border py-2 mono-ui text-[11px] text-forest hover:text-primary hover:border-primary flex items-center justify-center gap-2 transition-colors"
              data-testid="mobile-share-btn"
            >
              <ShareNetwork weight="bold" className="w-3 h-3" />
              SHARE
            </button>
            <button
              onClick={toggleBookmark}
              className={`flex-1 narvo-border py-2 mono-ui text-[11px] flex items-center justify-center gap-2 transition-colors ${isBookmarked(news.id) ? 'text-primary border-primary' : 'text-forest hover:text-primary hover:border-primary'}`}
              data-testid="mobile-bookmark-btn"
            >
              <BookmarkSimple weight={isBookmarked(news.id) ? 'fill' : 'regular'} className="w-3 h-3" />
              {isBookmarked(news.id) ? t('dashboard.saved') : t('dashboard.save')}
            </button>
          </div>
          {/* Tags */}
          {news.tags?.length > 0 && (
            <div>
              <span className="mono-ui text-[11px] text-forest block mb-3 font-bold tracking-widest">{t('news_detail.signal_tags')}</span>
              <div className="flex flex-wrap gap-1.5">
                {news.tags.map((tag, i) => (
                  <TagPill key={i} tag={tag} />
                ))}
              </div>
            </div>
          )}
          {/* Related Stories */}
          {relatedNews.length > 0 && (
            <div>
              <span className="mono-ui text-[11px] text-forest block mb-3 font-bold tracking-widest">{t('news_detail.related_transmissions')}</span>
              <div className="space-y-2">
                {relatedNews.map((item) => (
                  <div
                    key={item.id}
                    className="narvo-border p-3 cursor-pointer hover:bg-surface/40 transition-colors group"
                    onClick={() => navigate(`/news/${item.id}`)}
                    data-testid={`mobile-related-${item.id}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="mono-ui text-[10px] text-primary">{item.source}</span>
                      <TruthTag storyId={item.id} compact />
                    </div>
                    <h4 className="text-xs text-content font-display font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);
  const [readTime, setReadTime] = useState(0);
  const { playTrack, forcePlayTrack, addToQueue, currentTrack, isPlaying, voiceModel, broadcastLanguage, settingsLoaded } = useAudio();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { showAlert } = useHapticAlert();
  const { t } = useTranslation();
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    setLoading(true);
    hasAutoPlayed.current = false;
    
    Promise.all([
      fetch(`${API_URL}/api/news/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`${API_URL}/api/news?limit=6`).then(r => r.json()).catch(() => []),
    ]).then(([newsData, related]) => {
      if (!newsData) { 
        navigate('/dashboard'); 
        return; 
      }
      setNews(newsData);
      
      // Filter related news by same category, excluding current article
      const sameCategory = related.filter(r => r.id !== id && r.category === newsData.category);
      const otherNews = related.filter(r => r.id !== id && r.category !== newsData.category);
      setRelatedNews([...sameCategory, ...otherNews].slice(0, 3));
      
      // Calculate read time (average 200 words per minute)
      const text = (newsData.narrative || newsData.summary || '');
      const wordCount = text.split(/\s+/).length;
      setReadTime(Math.max(1, Math.ceil(wordCount / 200)));
      
      setLoading(false);
    }).catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  const [autoplayReady, setAutoplayReady] = useState(false);
  const pregenAudioUrl = useRef(null);

  // Pre-generate TTS audio as soon as news loads AND settings are ready
  useEffect(() => {
    if (!news || loading || !settingsLoaded) return;
    const text = news.narrative || news.summary || news.title || '';
    if (!text) return;
    
    const vid = voiceModel || 'emma';
    const lang = broadcastLanguage || 'en';
    
    fetch(`${API_URL}/api/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 4000), voice_id: vid, language: lang }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.audio_url) pregenAudioUrl.current = data.audio_url;
        setAutoplayReady(true);
      })
      .catch(() => setAutoplayReady(true));
  }, [news, loading, settingsLoaded, voiceModel, broadcastLanguage]);

  // Auto-play once TTS is pre-cached — pass audio_url directly to skip double-fetch
  useEffect(() => {
    if (autoplayReady && news && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      const trackWithAudio = pregenAudioUrl.current
        ? { ...news, url: pregenAudioUrl.current }
        : news;
      forcePlayTrack(trackWithAudio);
    }
  }, [autoplayReady, news, forcePlayTrack]);

  const toggleBookmark = () => {
    if (isBookmarked(news.id)) {
      removeBookmark(news.id);
      showAlert('BOOKMARK_REMOVED');
    } else {
      addBookmark(news);
      showAlert('BOOKMARK_ADDED');
    }
  };

  const shareStory = async () => {
    // Use the /api/share/ URL which has proper OG meta tags for social media
    const shareUrl = `${API_URL}/api/share/${news.id}`;
    const shareText = `${news.title} - Listen on NARVO`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
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
      await navigator.clipboard.writeText(shareUrl);
      showAlert({
        type: 'sync',
        title: 'LINK_COPIED',
        message: 'Story link copied to clipboard.',
        code: 'CLIP_OK',
      });
    }
  };

  const formatPublishedDate = (dateStr) => {
    if (!dateStr) return 'Today';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffHours < 48) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading || !news) {
    return (
      <div className="flex-1 flex min-h-0">
        <section className="flex-1 overflow-y-auto bg-background-dark custom-scroll" data-testid="news-detail-loading">
          <div className="max-w-3xl mx-auto py-8 md:py-12 px-4 md:px-8">
            <ArticleSkeleton />
          </div>
        </section>
        <aside className="w-80 hidden xl:flex flex-col narvo-border-l bg-background-dark shrink-0">
          <div className="h-20 narvo-border-b bg-surface/10" />
          <div className="p-6 space-y-6">
            <div className="narvo-border bg-surface/20 p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-forest/10 animate-pulse" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  const narrativeParagraphs = (news.narrative || news.summary || '').split('\n').filter(p => p.trim());
  const isCurrentlyPlaying = currentTrack?.id === news.id && isPlaying;

  return (
    <div className="flex-1 flex min-h-0">
      <Helmet>
        <title>{news.title} — NARVO</title>
        <meta property="og:title" content={news.title} />
        <meta property="og:description" content={news.narrative?.slice(0, 160) || `Listen on Narvo — Audio-first news for Africa`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/news/${id}`} />
        <meta property="og:image" content={`${API_URL}/api/og/${id}`} />
        <meta property="og:site_name" content="NARVO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={news.title} />
        <meta name="twitter:description" content={news.narrative?.slice(0, 160) || 'Audio-first news for Africa'} />
        <meta name="twitter:image" content={`${API_URL}/api/og/${id}`} />
      </Helmet>
      {/* Main Article Content */}
      <section className="flex-1 overflow-y-auto relative bg-background-dark custom-scroll" data-testid="news-detail-page">
        <div className="max-w-3xl mx-auto py-8 md:py-12 px-4 md:px-8 pb-32 md:pb-40">
          {/* Back + Truth Tag Header */}
          <div className="mb-4 md:mb-6 flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="mono-ui text-[12px] md:text-xs text-forest hover:text-primary flex items-center gap-2 transition-colors" 
              data-testid="back-btn"
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
              <span>{t('news_detail.back_to_feed')}</span>
            </button>
            <div className="flex items-center gap-3">
              <TruthTag storyId={news.id} />
            </div>
          </div>

          {/* Category Pills + Meta */}
          <div className="mb-6 md:mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
              <div className="flex gap-0 narvo-border w-fit">
                <span className="px-2 md:px-3 py-1 narvo-border-r text-[11px] md:text-[12px] font-bold uppercase tracking-wider text-primary bg-background-dark font-mono">
                  {news.category || 'General'}
                </span>
                {news.tags?.slice(0, 1).map((tag, i) => (
                  <TagPill key={i} tag={tag} className="border-0 bg-background-dark text-primary text-[11px] md:text-[12px] px-2 md:px-3 py-1 tracking-wider" />
                ))}
              </div>
              <div className="flex items-center gap-4 mono-ui text-[11px] md:text-[12px] text-forest">
                <span className="flex items-center gap-1.5">
                  <Clock weight="bold" className="w-3 h-3" />
                  {readTime} MIN READ
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye weight="bold" className="w-3 h-3" />
                  {formatPublishedDate(news.published)}
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-content leading-[1.1] tracking-tight mb-4 md:mb-6 font-display uppercase" data-testid="news-title">
              {news.title}
            </h1>

            {/* Lead */}
            <p className="text-base md:text-lg lg:text-xl text-slate-300 font-light leading-relaxed font-display border-l-2 border-forest pl-4 md:pl-6">
              {news.summary}
            </p>
          </div>

          {/* Hero Image */}
          <figure className="mb-8 md:mb-12 narvo-border relative group">
            <img
              alt={news.title}
              className="w-full h-[200px] sm:h-[300px] md:h-[400px] object-cover opacity-90 grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
              src={news.image_url || "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200"}
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-background-dark narvo-border-t w-fit ml-auto">
              <figcaption className="text-[11px] md:text-[12px] text-primary font-mono uppercase tracking-wider">
                FIG 1.0 — {news.source || 'Source'} / {news.category}
              </figcaption>
            </div>
            {/* Now Playing Indicator */}
            {isCurrentlyPlaying && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary px-3 py-1.5">
                <Broadcast weight="fill" className="w-4 h-4 text-background-dark animate-pulse" />
                <span className="mono-ui text-[11px] text-background-dark font-bold">NOW_PLAYING</span>
              </div>
            )}
          </figure>

          {/* Audio Controls Bar */}
          <div className="narvo-border bg-surface/30 p-3 md:p-5 mb-8 md:mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
            <button
              onClick={() => playTrack(news)}
              className={`${isCurrentlyPlaying ? 'bg-white' : 'bg-primary hover:bg-white'} text-background-dark w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all shrink-0`}
              data-testid="play-story-btn"
            >
              {isCurrentlyPlaying ? <Pause weight="fill" className="w-5 h-5" /> : <Play weight="fill" className="w-5 h-5 ml-0.5" />}
            </button>
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <span className="text-[11px] md:text-[12px] text-forest font-mono uppercase tracking-widest mb-1">
                {isCurrentlyPlaying ? t('news_detail.now_playing') : t('news_detail.narrative_audio')}
              </span>
              <span className="text-xs md:text-sm text-content font-medium font-display uppercase tracking-wide truncate">
                {news.title?.slice(0, 50)}...
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto sm:ml-auto">
              <button className="hidden md:flex narvo-border px-3 py-1.5 items-center gap-2 hover:bg-forest hover:text-content transition-colors">
                <Translate weight="bold" className="w-4 h-4 text-primary" />
                <span className="text-[12px] text-primary font-mono font-bold uppercase tracking-wider">West African English</span>
              </button>
              <button className="md:hidden narvo-border p-2 text-primary">
                <Translate weight="bold" className="w-4 h-4" />
              </button>
              <button
                onClick={shareStory}
                className="narvo-border w-10 h-10 flex items-center justify-center text-forest hover:text-primary transition-colors"
                title="Share Story"
                data-testid="share-story-btn"
              >
                <ShareNetwork weight="bold" className="w-5 h-5" />
              </button>
              <button
                onClick={toggleBookmark}
                className={`narvo-border w-10 h-10 flex items-center justify-center transition-colors ${isBookmarked(news.id) ? 'text-primary border-primary' : 'text-forest hover:text-primary'}`}
                data-testid="bookmark-detail-btn"
              >
                {<BookmarkSimple weight={isBookmarked(news.id) ? "fill" : "regular"} className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Key Takeaways */}
          {news.key_takeaways?.length > 0 && (
            <div className="narvo-border bg-transparent p-4 md:p-6 mb-8 md:mb-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-forest" />
              <h3 className="text-base md:text-lg font-bold text-content mb-3 md:mb-4 flex items-center gap-2 font-display uppercase tracking-tight">
                <Lightbulb weight="fill" className="text-primary w-4 h-4 md:w-5 md:h-5" />
                {t('news_detail.key_takeaways')}
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {news.key_takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2 md:gap-3 text-slate-300 text-sm md:text-base leading-relaxed">
                    <span className="mt-1.5 md:mt-2 w-1.5 h-1.5 bg-primary shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Body */}
          <article className="prose prose-invert prose-sm md:prose-lg max-w-none">
            {narrativeParagraphs.length > 0 ? narrativeParagraphs.map((para, i) => (
              <React.Fragment key={i}>
                <p className="text-slate-300 font-light leading-relaxed mb-4 md:mb-6 text-sm md:text-base">{para}</p>
                {/* Insert a quote block after 2nd paragraph */}
                {i === 1 && narrativeParagraphs.length > 2 && (
                  <div className="my-6 md:my-8 p-4 md:p-6 narvo-border bg-transparent relative">
                    <span className="absolute top-0 left-0 bg-background-dark px-2 -mt-3 text-primary text-2xl md:text-4xl leading-none font-display">"</span>
                    <p className="italic text-primary font-display text-base md:text-xl leading-relaxed mb-2">
                      The narrative isn't just information; it's context. Pull one thread, and the whole story changes.
                    </p>
                    <cite className="text-[12px] md:text-xs font-mono text-slate-500 not-italic uppercase tracking-widest">— Narvo AI Synthesis</cite>
                  </div>
                )}
              </React.Fragment>
            )) : (
              <p className="text-slate-300 font-light leading-relaxed text-sm md:text-base">{news.summary}</p>
            )}
          </article>

          {/* Source Attribution */}
          <div className="mt-8 md:mt-12 narvo-border bg-surface/20 p-4 md:p-6">
            <span className="mono-ui text-[11px] md:text-[12px] text-forest block mb-2 md:mb-3 font-bold tracking-widest">{t('news_detail.source_attribution')}</span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-content font-display font-bold text-sm md:text-base">{news.source}</span>
                <span className="mono-ui text-[11px] md:text-[12px] text-forest block mt-1">{formatPublishedDate(news.published)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={shareStory}
                  className="narvo-border px-3 md:px-4 py-2 mono-ui text-[11px] md:text-[12px] text-forest hover:text-primary flex items-center gap-2 transition-colors"
                  data-testid="share-source-btn"
                >
                  <ShareNetwork weight="bold" className="w-3 h-3" />
                  <span>{t('dashboard.share')}</span>
                </button>
                {news.source_url && (
                  <a 
                    href={news.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="narvo-border px-3 md:px-4 py-2 mono-ui text-[11px] md:text-[12px] text-forest hover:text-primary flex items-center gap-2 transition-colors"
                  >
                    <ArrowSquareOut weight="bold" className="w-3 h-3" />
                    <span>{t('news_detail.original_source')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Article Metadata - visible only on smaller screens */}
          <MobileMetadata
            news={news}
            readTime={readTime}
            relatedNews={relatedNews}
            isBookmarked={isBookmarked}
            toggleBookmark={toggleBookmark}
            addToQueue={addToQueue}
            shareStory={shareStory}
            navigate={navigate}
            showAlert={showAlert}
            t={t}
            formatPublishedDate={formatPublishedDate}
          />
        </div>
      </section>

      {/* Right Sidebar: Related & Metadata - hidden on mobile/tablet */}
      <aside className="w-72 xl:w-80 hidden lg:flex flex-col narvo-border-l bg-background-dark shrink-0" data-testid="detail-sidebar">
        <div className="h-16 xl:h-20 flex items-center px-4 xl:px-6 narvo-border-b bg-surface/10">
          <span className="mono-ui text-[12px] xl:text-xs font-bold text-forest tracking-widest uppercase">{t('news_detail.article_metadata')}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 xl:p-6 space-y-6 xl:space-y-8 custom-scroll">
          {/* Truth Tag Display */}
          <div className="narvo-border bg-primary/5 p-3 xl:p-4 border-primary/30">
            <span className="mono-ui text-[11px] xl:text-[12px] text-forest block mb-2 xl:mb-3 font-bold tracking-widest">{t('news_detail.verification_status')}</span>
            <TruthTag storyId={news.id} />
          </div>

          {/* Article Info */}
          <div className="narvo-border bg-surface/20 p-3 xl:p-4">
            <span className="mono-ui text-[11px] xl:text-[12px] text-forest block mb-2 xl:mb-3 font-bold tracking-widest">{t('news_detail.signal_metadata')}</span>
            <div className="space-y-2 xl:space-y-3">
              <div className="flex justify-between mono-ui text-[11px] xl:text-[12px]">
                <span className="text-forest">{t('news_detail.category')}</span>
                <span className="text-primary font-bold">{news.category?.toUpperCase() || 'GENERAL'}</span>
              </div>
              <div className="flex justify-between mono-ui text-[11px] xl:text-[12px]">
                <span className="text-forest">{t('news_detail.source')}</span>
                <span className="text-content">{news.source?.toUpperCase() || 'UNKNOWN'}</span>
              </div>
              <div className="flex justify-between mono-ui text-[11px] xl:text-[12px]">
                <span className="text-forest">{t('news_detail.region')}</span>
                <span className="text-content">{news.region?.toUpperCase() || 'AFRICA'}</span>
              </div>
              <div className="flex justify-between mono-ui text-[11px] xl:text-[12px]">
                <span className="text-forest">{t('news_detail.read_time')}</span>
                <span className="text-primary font-bold">{readTime} MIN</span>
              </div>
              <div className="flex justify-between mono-ui text-[11px] xl:text-[12px]">
                <span className="text-forest">{t('news_detail.ai_synthesis')}</span>
                <span className="text-primary font-bold">{news.narrative ? t('news_detail.complete') : t('news_detail.pending')}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { addToQueue(news); showAlert({ type: 'sync', title: 'QUEUE_UPDATED', message: 'Added to playlist queue', code: 'Q_ADD', duration: 2000 }); }}
              className="flex-1 narvo-border py-2 mono-ui text-[11px] xl:text-[12px] text-forest hover:text-primary hover:border-primary flex items-center justify-center gap-2 transition-colors"
              data-testid="sidebar-queue-btn"
            >
              <Queue weight="bold" className="w-3 h-3" />
              QUEUE
            </button>
            <button
              onClick={shareStory}
              className="flex-1 narvo-border py-2 mono-ui text-[11px] xl:text-[12px] text-forest hover:text-primary hover:border-primary flex items-center justify-center gap-2 transition-colors"
              data-testid="sidebar-share-btn"
            >
              <ShareNetwork weight="bold" className="w-3 h-3" />
              SHARE
            </button>
            <button
              onClick={toggleBookmark}
              className={`flex-1 narvo-border py-2 mono-ui text-[11px] xl:text-[12px] flex items-center justify-center gap-2 transition-colors ${isBookmarked(news.id) ? 'text-primary border-primary' : 'text-forest hover:text-primary hover:border-primary'}`}
              data-testid="sidebar-bookmark-btn"
            >
              {<BookmarkSimple weight={isBookmarked(news.id) ? "fill" : "regular"} className="w-3 h-3" />}
              {isBookmarked(news.id) ? t('dashboard.saved') : t('dashboard.save')}
            </button>
          </div>

          {/* Tags */}
          {news.tags?.length > 0 && (
            <div>
              <span className="mono-ui text-[11px] xl:text-[12px] text-forest block mb-3 xl:mb-4 font-bold tracking-widest">{t('news_detail.signal_tags')}</span>
              <div className="flex flex-wrap gap-1.5 xl:gap-2">
                {news.tags.map((tag, i) => (
                  <TagPill key={i} tag={tag} className="xl:px-2 xl:text-[11px]" />
                ))}
              </div>
            </div>
          )}

          {/* Related Stories */}
          {relatedNews.length > 0 && (
            <div>
              <span className="mono-ui text-[11px] xl:text-[12px] text-forest block mb-3 xl:mb-4 font-bold tracking-widest">{t('news_detail.related_transmissions')}</span>
              <div className="space-y-2 xl:space-y-3">
                {relatedNews.map((item) => (
                  <div
                    key={item.id}
                    className="narvo-border p-3 xl:p-4 cursor-pointer hover:bg-surface/40 transition-colors group"
                    onClick={() => navigate(`/news/${item.id}`)}
                    data-testid={`related-${item.id}`}
                  >
                    <div className="flex items-center gap-2 mb-1 xl:mb-2">
                      <span className="mono-ui text-[10px] xl:text-[11px] text-primary">{item.source}</span>
                      <TruthTag storyId={item.id} compact />
                    </div>
                    <h4 className="text-xs xl:text-sm text-content font-display font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default NewsDetailPage;

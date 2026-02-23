import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Bookmark, BookmarkCheck, Languages, ExternalLink, ArrowLeft, Lightbulb } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { ArticleSkeleton } from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/news/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`${API_URL}/api/news?limit=5`).then(r => r.json()).catch(() => []),
    ]).then(([newsData, related]) => {
      if (!newsData) { navigate('/dashboard'); return; }
      setNews(newsData);
      setRelatedNews(related.filter(r => r.id !== id).slice(0, 3));
      setLoading(false);
    }).catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  const toggleBookmark = () => {
    if (isBookmarked(news.id)) removeBookmark(news.id);
    else addBookmark(news);
  };

  if (loading || !news) {
    return (
      <>
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
      </>
    );
  }

  const narrativeParagraphs = (news.narrative || news.summary || '').split('\n').filter(p => p.trim());

  return (
    <>
      {/* Main Article Content */}
      <section className="flex-1 overflow-y-auto relative bg-background-dark custom-scroll" data-testid="news-detail-page">
        <div className="max-w-3xl mx-auto py-8 md:py-12 px-4 md:px-8 pb-32 md:pb-40">
          {/* Back + Category Tags */}
          <div className="mb-4 md:mb-6 flex items-center justify-between">
            <button onClick={() => navigate('/dashboard')} className="mono-ui text-[10px] md:text-xs text-forest hover:text-primary flex items-center gap-2 transition-colors" data-testid="back-btn">
              <ArrowLeft className="w-4 h-4" />
              <span>BACK_TO_FEED</span>
            </button>
            <span className="mono-ui text-[9px] md:text-[10px] text-forest">TRUTH_TAG: <span className="text-primary font-bold">{news.truth_score || 100}%</span></span>
          </div>

          {/* Category Pills */}
          <div className="mb-6 md:mb-10">
            <div className="flex gap-0 mb-4 md:mb-6 narvo-border w-fit">
              <span className="px-2 md:px-3 py-1 narvo-border-r text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary bg-background-dark font-mono">
                {news.category || 'General'}
              </span>
              {news.tags?.slice(0, 1).map((tag, i) => (
                <span key={i} className="px-2 md:px-3 py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary bg-background-dark font-mono">
                  {tag}
                </span>
              ))}
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-4 md:mb-6 font-display uppercase" data-testid="news-title">
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
              src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-background-dark narvo-border-t w-fit ml-auto">
              <figcaption className="text-[9px] md:text-[10px] text-primary font-mono uppercase tracking-wider">
                FIG 1.0 — {news.source || 'Source'} / {news.category}
              </figcaption>
            </div>
          </figure>

          {/* Audio Controls Bar */}
          <div className="narvo-border bg-surface/30 p-3 md:p-5 mb-8 md:mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
            <button
              onClick={() => playTrack(news)}
              className="bg-primary hover:bg-white text-background-dark w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all shrink-0"
              data-testid="play-story-btn"
            >
              {currentTrack?.id === news.id && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <span className="text-[9px] md:text-[10px] text-forest font-mono uppercase tracking-widest mb-1">Narrative Audio</span>
              <span className="text-xs md:text-sm text-white font-medium font-display uppercase tracking-wide truncate">{news.title?.slice(0, 50)}...</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto sm:ml-auto">
              <button className="hidden md:flex narvo-border px-3 py-1.5 items-center gap-2 hover:bg-forest hover:text-white transition-colors">
                <Languages className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-primary font-mono font-bold uppercase tracking-wider">West African English</span>
              </button>
              <button className="md:hidden narvo-border p-2 text-primary">
                <Languages className="w-4 h-4" />
              </button>
              <button
                onClick={toggleBookmark}
                className={`narvo-border w-10 h-10 flex items-center justify-center transition-colors ${isBookmarked(news.id) ? 'text-primary border-primary' : 'text-forest hover:text-primary'}`}
                data-testid="bookmark-detail-btn"
              >
                {isBookmarked(news.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Key Takeaways */}
          {news.key_takeaways?.length > 0 && (
            <div className="narvo-border bg-transparent p-4 md:p-6 mb-8 md:mb-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-forest" />
              <h3 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4 flex items-center gap-2 font-display uppercase tracking-tight">
                <Lightbulb className="text-primary w-4 h-4 md:w-5 md:h-5" />
                Key Takeaways
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
                {i === 1 && (
                  <div className="my-6 md:my-8 p-4 md:p-6 narvo-border bg-transparent relative">
                    <span className="absolute top-0 left-0 bg-background-dark px-2 -mt-3 text-primary text-2xl md:text-4xl leading-none font-display">"</span>
                    <p className="italic text-primary font-display text-base md:text-xl leading-relaxed mb-2">
                      The narrative isn't just information; it's context. Pull one thread, and the whole story changes.
                    </p>
                    <cite className="text-[10px] md:text-xs font-mono text-slate-500 not-italic uppercase tracking-widest">— Narvo AI Synthesis</cite>
                  </div>
                )}
              </React.Fragment>
            )) : (
              <p className="text-slate-300 font-light leading-relaxed text-sm md:text-base">{news.summary}</p>
            )}
          </article>

          {/* Source Attribution */}
          <div className="mt-8 md:mt-12 narvo-border bg-surface/20 p-4 md:p-6">
            <span className="mono-ui text-[9px] md:text-[10px] text-forest block mb-2 md:mb-3 font-bold tracking-widest">SOURCE_ATTRIBUTION</span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-white font-display font-bold text-sm md:text-base">{news.source}</span>
                <span className="mono-ui text-[9px] md:text-[10px] text-forest block mt-1">{news.published || 'Today'}</span>
              </div>
              {news.source_url && (
                <a href={news.source_url} target="_blank" rel="noopener noreferrer" className="narvo-border px-3 md:px-4 py-2 mono-ui text-[9px] md:text-[10px] text-forest hover:text-primary flex items-center gap-2 transition-colors w-fit">
                  <ExternalLink className="w-3 h-3" />
                  <span>ORIGINAL_SOURCE</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Right Sidebar: Related & Metadata - hidden on mobile/tablet */}
      <aside className="w-72 xl:w-80 hidden lg:flex flex-col narvo-border-l bg-background-dark shrink-0" data-testid="detail-sidebar">
        <div className="h-16 xl:h-20 flex items-center px-4 xl:px-6 narvo-border-b bg-surface/10">
          <span className="mono-ui text-[10px] xl:text-xs font-bold text-forest tracking-widest uppercase">Article_Metadata</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 xl:p-6 space-y-6 xl:space-y-8 custom-scroll">
          {/* Article Info */}
          <div className="narvo-border bg-surface/20 p-3 xl:p-4">
            <span className="mono-ui text-[9px] xl:text-[10px] text-forest block mb-2 xl:mb-3 font-bold tracking-widest">SIGNAL_METADATA</span>
            <div className="space-y-2 xl:space-y-3">
              <div className="flex justify-between mono-ui text-[9px] xl:text-[10px]">
                <span className="text-forest">CATEGORY</span>
                <span className="text-primary font-bold">{news.category?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between mono-ui text-[9px] xl:text-[10px]">
                <span className="text-forest">SOURCE</span>
                <span className="text-white">{news.source?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between mono-ui text-[9px] xl:text-[10px]">
                <span className="text-forest">TRUTH_SCORE</span>
                <span className="text-primary font-bold">{news.truth_score || 100}%</span>
              </div>
              <div className="flex justify-between mono-ui text-[9px] xl:text-[10px]">
                <span className="text-forest">AI_SYNTHESIS</span>
                <span className="text-primary font-bold">{news.narrative ? 'COMPLETE' : 'PENDING'}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {news.tags?.length > 0 && (
            <div>
              <span className="mono-ui text-[9px] xl:text-[10px] text-forest block mb-3 xl:mb-4 font-bold tracking-widest">SIGNAL_TAGS</span>
              <div className="flex flex-wrap gap-1.5 xl:gap-2">
                {news.tags.map((tag, i) => (
                  <span key={i} className="narvo-border px-1.5 xl:px-2 py-1 mono-ui text-[8px] xl:text-[9px] text-white hover:bg-forest hover:text-background-dark cursor-pointer transition-colors">#{tag.toUpperCase()}</span>
                ))}
              </div>
            </div>
          )}

          {/* Related Stories */}
          {relatedNews.length > 0 && (
            <div>
              <span className="mono-ui text-[9px] xl:text-[10px] text-forest block mb-3 xl:mb-4 font-bold tracking-widest">RELATED_TRANSMISSIONS</span>
              <div className="space-y-2 xl:space-y-3">
                {relatedNews.map((item) => (
                  <div
                    key={item.id}
                    className="narvo-border p-3 xl:p-4 cursor-pointer hover:bg-surface/40 transition-colors group"
                    onClick={() => navigate(`/news/${item.id}`)}
                    data-testid={`related-${item.id}`}
                  >
                    <span className="mono-ui text-[8px] xl:text-[9px] text-primary block mb-1 xl:mb-2">{item.source}</span>
                    <h4 className="text-xs xl:text-sm text-white font-display font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default NewsDetailPage;

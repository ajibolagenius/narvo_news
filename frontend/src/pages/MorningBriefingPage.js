import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';
import { Play, Pause, Calendar, ArrowClockwise, Clock, Radio, CaretRight, SpeakerHigh, TextAlignLeft, CaretDown, CaretUp } from '@phosphor-icons/react';
import Skeleton, { ListSkeleton } from '../components/Skeleton';
import { playBriefingIntro, playBriefingOutro, playSectionDivider } from '../lib/cinematicAudio';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/** Split a script into sentences for follow-along */
const splitToSentences = (text) => {
  if (!text) return [];
  return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
};

const MorningBriefingPage = () => {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [voices, setVoices] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const { playTrack, currentTrack, isPlaying, isLoading: audioLoading, currentTime: audioCurrentTime, duration: audioDuration } = useAudio();
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const audioEndedRef = useRef(null);
  const transcriptRef = useRef(null);

  // Follow-along state
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);
  const sentences = splitToSentences(briefing?.script);
  const isCurrentBriefingPlaying = currentTrack?.id === briefing?.id && isPlaying;

  // Calculate which sentence is active based on audio progress
  useEffect(() => {
    if (!isCurrentBriefingPlaying || !sentences.length || !audioDuration) {
      if (!isCurrentBriefingPlaying) setActiveSentenceIdx(-1);
      return;
    }
    const progress = audioCurrentTime / audioDuration;
    const idx = Math.min(Math.floor(progress * sentences.length), sentences.length - 1);
    setActiveSentenceIdx(idx);
  }, [audioCurrentTime, audioDuration, isCurrentBriefingPlaying, sentences.length]);

  // Auto-scroll to active sentence
  useEffect(() => {
    if (activeSentenceIdx < 0 || !transcriptRef.current) return;
    const el = transcriptRef.current.querySelector(`[data-sentence="${activeSentenceIdx}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeSentenceIdx]);

  // Listen for briefing audio ended to play outro
  useEffect(() => {
    const handler = () => {
      if (sfxEnabled && currentTrack?.source === 'NARVO_BRIEFING') {
        playBriefingOutro().catch(() => {});
      }
    };
    const audioEl = document.querySelector('audio');
    if (audioEl) {
      audioEl.addEventListener('ended', handler);
      audioEndedRef.current = { el: audioEl, handler };
    }
    return () => {
      if (audioEndedRef.current) {
        audioEndedRef.current.el.removeEventListener('ended', audioEndedRef.current.handler);
      }
    };
  }, [sfxEnabled, currentTrack]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/briefing/latest`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_URL}/api/briefing/history?limit=10`).then(r => r.json()).catch(() => ({ briefings: [] })),
      fetch(`${API_URL}/api/voices`).then(r => r.json()).catch(() => [])
    ]).then(([latestBriefing, historyData, voicesData]) => {
      if (latestBriefing) setBriefing(latestBriefing);
      setHistory(historyData.briefings || []);
      setVoices(voicesData);
      setLoading(false);
      setHistoryLoading(false);
    });
  }, []);

  const generateBriefing = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/briefing/generate?voice_id=${selectedVoice}&force_regenerate=true`);
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
        const histRes = await fetch(`${API_URL}/api/briefing/history?limit=10`);
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData.briefings || []);
        }
      }
    } catch (e) { console.error('Error generating briefing:', e); }
    setGenerating(false);
  };

  const loadHistoricalBriefing = async (date) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/briefing/${date}`);
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
      }
    } catch (e) { console.error('Error loading briefing:', e); }
    setLoading(false);
  };

  const handlePlay = async () => {
    if (briefing?.audio_url) {
      if (sfxEnabled) {
        try { await playBriefingIntro(); } catch (e) {}
        await new Promise(r => setTimeout(r, 1400));
      }
      playTrack({ id: briefing.id, title: briefing.title, url: briefing.audio_url, source: 'NARVO_BRIEFING' });
    }
  };

  const handleSectionDivider = useCallback(async () => {
    if (sfxEnabled) { try { await playSectionDivider(); } catch (e) {} }
  }, [sfxEnabled]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="flex-1 flex flex-col bg-background-dark min-w-0 min-h-0" data-testid="briefing-page">
      {/* Header */}
      <div className="h-12 md:h-14 flex items-center justify-between px-4 md:px-8 bg-surface/30 narvo-border-b shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <Radio className="w-4 h-4 text-primary" />
          <span className="mono-ui text-[9px] md:text-xs text-forest">MODULE: <span className="text-primary">MORNING_BRIEFING</span></span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3">
          <button
            onClick={generateBriefing}
            disabled={generating}
            className="h-7 md:h-8 px-2 md:px-3 bg-primary text-background-dark mono-ui text-[8px] md:text-[9px] font-bold hover:bg-white transition-all disabled:opacity-50 flex items-center gap-1"
            data-testid="generate-btn"
          >
            <ArrowClockwise className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{generating ? 'GEN...' : 'NEW'}</span>
          </button>
          <button
            onClick={() => setSfxEnabled(v => !v)}
            className={`h-7 md:h-8 px-2 narvo-border mono-ui text-[8px] md:text-[9px] font-bold flex items-center gap-1 transition-all ${sfxEnabled ? 'bg-primary/10 border-primary text-primary' : 'text-forest hover:text-content'}`}
            data-testid="sfx-toggle"
          >
            <SpeakerHigh weight={sfxEnabled ? 'fill' : 'regular'} className="w-3 h-3" />
            <span className="hidden sm:inline">SFX</span>
          </button>
        </div>
      </div>

      {/* Mobile Archive Toggle */}
      <button
        onClick={() => setShowArchive(v => !v)}
        className="lg:hidden h-10 flex items-center justify-between px-4 bg-surface/20 narvo-border-b"
        data-testid="archive-toggle"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="mono-ui text-[9px] text-forest font-bold">ARCHIVE_LOG</span>
          <span className="mono-ui text-[7px] text-forest/50">{history.length} ENTRIES</span>
        </div>
        {showArchive ? <CaretUp className="w-3 h-3 text-forest" /> : <CaretDown className="w-3 h-3 text-forest" />}
      </button>

      {/* Mobile Archive Drawer */}
      {showArchive && (
        <div className="lg:hidden max-h-48 overflow-y-auto bg-surface/10 narvo-border-b px-2 py-1 space-y-1">
          {history.map((item) => (
            <button
              key={item.date}
              onClick={() => { loadHistoricalBriefing(item.date); setShowArchive(false); }}
              className={`w-full p-2.5 text-left narvo-border transition-all text-[9px] ${briefing?.date === item.date ? 'border-primary bg-primary/5' : 'hover:bg-surface/30'}`}
            >
              <div className="flex items-center justify-between">
                <span className={`mono-ui font-bold ${briefing?.date === item.date ? 'text-primary' : 'text-forest'}`}>
                  {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                {item.date === today && <span className="mono-ui text-[7px] text-primary bg-primary/10 px-1 py-0.5">TODAY</span>}
              </div>
              <span className="mono-ui text-[8px] text-forest/60">{item.stories?.length || 0} STORIES</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left: Briefing Content */}
        <section className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 pb-20 md:pb-8 min-w-0">
          <div className="max-w-3xl mx-auto lg:mx-0">
            {loading ? (
              <div className="space-y-6">
                <div className="narvo-border bg-surface/30 p-6 md:p-8">
                  <Skeleton variant="text" className="w-32 h-3 mb-4" />
                  <Skeleton variant="text" className="w-3/4 h-8 mb-3" />
                  <Skeleton variant="text" className="w-24 h-5 mb-6" />
                  <Skeleton className="w-48 h-12" />
                </div>
                <ListSkeleton count={4} />
              </div>
            ) : briefing ? (
              <>
                {/* Briefing Card */}
                <div className="narvo-border bg-surface/50 p-4 md:p-8 mb-4 md:mb-6">
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <span className="w-2 h-2 bg-primary animate-pulse" />
                    <span className="mono-ui text-[9px] md:text-[10px] text-primary font-bold tracking-widest">
                      {briefing.date === today ? 'LIVE_BROADCAST' : 'ARCHIVED_BROADCAST'}
                    </span>
                  </div>
                  <h2 className="font-display text-lg md:text-3xl text-content mb-2 md:mb-3 uppercase tracking-tight">{briefing.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <span className="mono-ui text-[8px] md:text-[10px] text-forest narvo-border px-2 py-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{briefing.duration_estimate}
                    </span>
                    <span className="mono-ui text-[8px] md:text-[10px] text-forest">{briefing.stories?.length || 0} STORIES</span>
                    <span className="mono-ui text-[8px] md:text-[10px] text-forest uppercase">VOICE: {briefing.voice_id || 'NOVA'}</span>
                  </div>
                  <button
                    onClick={handlePlay}
                    disabled={!briefing.audio_url || audioLoading}
                    className={`${isCurrentBriefingPlaying ? 'bg-white' : 'bg-primary hover:bg-white'} text-background-dark font-display font-bold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base transition-all flex items-center gap-2 disabled:opacity-50`}
                    data-testid="play-briefing-btn"
                  >
                    {audioLoading ? (
                      <div className="w-5 h-5 border-2 border-background-dark border-t-transparent animate-spin rounded-full" />
                    ) : isCurrentBriefingPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isCurrentBriefingPlaying ? 'PAUSE' : 'PLAY BRIEFING'}</span>
                  </button>
                </div>

                {/* Stories List */}
                <div className="narvo-border bg-surface/20 divide-y divide-forest/10">
                  <div className="p-3 md:p-4 flex items-center justify-between">
                    <span className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-widest">STORIES_INCLUDED</span>
                    <span className="mono-ui text-[7px] md:text-[8px] text-forest/60">{briefing.stories?.length || 0} / 5 SEGMENTS</span>
                  </div>
                  {briefing.stories?.map((story, i) => (
                    <div
                      key={story.id || i}
                      onClick={() => { handleSectionDivider(); navigate(`/news/${story.id}`); }}
                      className="p-3 md:p-4 flex gap-2 md:gap-3 hover:bg-surface/40 transition-colors cursor-pointer group"
                      data-testid={`story-${i}`}
                    >
                      <span className="mono-ui text-[9px] md:text-[10px] text-primary font-bold shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="mono-ui text-[7px] md:text-[8px] text-forest/60 uppercase">{story.category || 'GENERAL'}</span>
                          <span className="text-forest/30">•</span>
                          <span className="mono-ui text-[7px] md:text-[8px] text-forest/60">{story.source}</span>
                        </div>
                        <span className="text-slate-300 text-xs md:text-sm group-hover:text-primary transition-colors line-clamp-2">{story.title}</span>
                      </div>
                      <CaretRight className="w-4 h-4 text-forest/30 group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  ))}
                </div>

                {/* Mobile Transcript (shown below stories on small screens) */}
                {briefing.script && (
                  <div className="lg:hidden narvo-border bg-surface/10 mt-4">
                    <div className="p-3 narvo-border-b flex items-center gap-2">
                      <TextAlignLeft className="w-3.5 h-3.5 text-primary" />
                      <span className="mono-ui text-[9px] text-forest font-bold tracking-widest">TRANSCRIPT</span>
                      {isCurrentBriefingPlaying && <span className="mono-ui text-[7px] text-primary animate-pulse">LIVE</span>}
                    </div>
                    <div className="p-3 max-h-64 overflow-y-auto custom-scroll" ref={transcriptRef}>
                      {sentences.map((sentence, idx) => (
                        <span
                          key={idx}
                          data-sentence={idx}
                          className={`mono-ui text-[10px] leading-relaxed inline transition-colors duration-300 ${
                            idx === activeSentenceIdx
                              ? 'text-primary font-bold bg-primary/5'
                              : idx < activeSentenceIdx ? 'text-forest/50' : 'text-forest/80'
                          }`}
                        >
                          {sentence}{' '}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 md:py-20">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 narvo-border flex items-center justify-center">
                  <Radio className="w-8 h-8 md:w-10 md:h-10 text-forest/30" />
                </div>
                <h3 className="font-display text-lg text-content uppercase mb-3">NO_BRIEFING_LOADED</h3>
                <p className="mono-ui text-[10px] text-forest mb-6">Generate your first morning briefing</p>
                <button
                  onClick={generateBriefing}
                  disabled={generating}
                  className="bg-primary text-background-dark font-display font-bold px-6 py-3 text-sm hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                  data-testid="generate-briefing-btn"
                >
                  <ArrowClockwise className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                  {generating ? 'GENERATING...' : '[ GENERATE BRIEFING ]'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Transcript (desktop) + Archive (desktop) */}
        <aside className="hidden lg:flex lg:w-80 xl:w-96 narvo-border-l bg-surface/5 flex-col shrink-0">
          {/* Transcript Panel */}
          {briefing?.script ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="h-12 flex items-center justify-between px-4 narvo-border-b bg-surface/20 shrink-0">
                <div className="flex items-center gap-2">
                  <TextAlignLeft className="w-4 h-4 text-primary" />
                  <span className="mono-ui text-[10px] text-forest font-bold tracking-widest">TRANSCRIPT</span>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrentBriefingPlaying && (
                    <span className="mono-ui text-[8px] text-primary bg-primary/10 px-1.5 py-0.5 animate-pulse font-bold">LIVE</span>
                  )}
                  <span className="mono-ui text-[8px] text-forest/50">{sentences.length} LINES</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scroll p-4 xl:p-6" ref={transcriptRef} data-testid="transcript-panel">
                <div className="space-y-0">
                  {sentences.map((sentence, idx) => (
                    <span
                      key={idx}
                      data-sentence={idx}
                      className={`mono-ui text-[10px] xl:text-[11px] leading-[1.8] inline transition-all duration-300 ${
                        idx === activeSentenceIdx
                          ? 'text-primary font-bold bg-primary/5 px-0.5'
                          : idx < activeSentenceIdx ? 'text-forest/40' : 'text-forest/80'
                      }`}
                    >
                      {sentence}{' '}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-3">
                <TextAlignLeft className="w-10 h-10 text-forest/20 mx-auto" />
                <p className="mono-ui text-[9px] text-forest/40">TRANSCRIPT WILL APPEAR HERE</p>
              </div>
            </div>
          )}

          {/* Archive Section (desktop) */}
          <div className="narvo-border-t shrink-0">
            <div className="h-10 flex items-center justify-between px-4 bg-surface/20">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="mono-ui text-[9px] text-forest font-bold tracking-widest">ARCHIVE_LOG</span>
              </div>
              <span className="mono-ui text-[7px] text-forest/50">{history.length} ENTRIES</span>
            </div>
            <div className="max-h-48 overflow-y-auto custom-scroll p-2 space-y-1">
              {historyLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="w-full h-12" />)
              ) : history.length === 0 ? (
                <div className="p-3 text-center">
                  <p className="mono-ui text-[8px] text-forest/50">NO_HISTORY</p>
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.date}
                    onClick={() => loadHistoricalBriefing(item.date)}
                    className={`w-full p-2.5 text-left narvo-border transition-all ${
                      briefing?.date === item.date ? 'border-primary bg-primary/5' : 'hover:border-forest hover:bg-surface/30'
                    }`}
                    data-testid={`history-${item.date}`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`mono-ui text-[8px] font-bold ${briefing?.date === item.date ? 'text-primary' : 'text-forest'}`}>
                        {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      {item.date === today && <span className="mono-ui text-[7px] text-primary bg-primary/10 px-1 py-0.5">TODAY</span>}
                    </div>
                    <span className={`mono-ui text-[7px] ${briefing?.date === item.date ? 'text-content' : 'text-forest/60'}`}>
                      {item.stories?.length || 0} STORIES • {item.duration_estimate || '~3 MIN'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default MorningBriefingPage;

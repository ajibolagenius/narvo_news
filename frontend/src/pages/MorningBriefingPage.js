import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';
import { Play, Pause, Calendar, RefreshCw, Clock, Radio, ChevronRight } from '@phosphor-icons/react';
import Skeleton, { ListSkeleton } from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const MorningBriefingPage = () => {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [voices, setVoices] = useState([]);
  const { playTrack, currentTrack, isPlaying, isLoading: audioLoading } = useAudio();

  // Fetch initial data
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
        // Refresh history
        const histRes = await fetch(`${API_URL}/api/briefing/history?limit=10`);
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData.briefings || []);
        }
      }
    } catch (e) {
      console.error('Error generating briefing:', e);
    }
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
    } catch (e) {
      console.error('Error loading briefing:', e);
    }
    setLoading(false);
  };

  const handlePlay = () => {
    if (briefing?.audio_url) {
      playTrack({
        id: briefing.id,
        title: briefing.title,
        url: briefing.audio_url,
        source: 'NARVO_BRIEFING'
      });
    }
  };

  const isCurrentBriefingPlaying = currentTrack?.id === briefing?.id && isPlaying;
  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="flex-1 flex flex-col lg:flex-row bg-background-dark min-w-0 overflow-hidden" data-testid="briefing-page">
      {/* Main Content */}
      <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="h-12 md:h-14 flex items-center justify-between px-4 md:px-8 bg-surface/30 narvo-border-b shrink-0">
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 text-primary" />
            <span className="mono-ui text-[10px] md:text-xs text-forest">MODULE: <span className="text-primary">MORNING_BRIEFING</span></span>
          </div>
          <div className="flex items-center gap-3">
            {voices.length > 0 && (
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="h-8 px-2 bg-background-dark narvo-border mono-ui text-[9px] text-forest focus:outline-none focus:border-primary"
                data-testid="voice-selector"
              >
                {voices.map(v => (
                  <option key={v.id} value={v.id}>{v.name.toUpperCase()}</option>
                ))}
              </select>
            )}
            <button
              onClick={generateBriefing}
              disabled={generating}
              className="h-8 px-3 bg-primary text-background-dark mono-ui text-[9px] font-bold hover:bg-white transition-all disabled:opacity-50 flex items-center gap-1.5"
              data-testid="generate-btn"
            >
              <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'GENERATING...' : 'NEW'}
            </button>
          </div>
        </div>

        {/* Briefing Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
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
                <div className="narvo-border bg-surface/50 p-5 md:p-8 mb-4 md:mb-6">
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <span className="w-2 h-2 bg-primary animate-pulse" />
                    <span className="mono-ui text-[9px] md:text-[10px] text-primary font-bold tracking-widest">
                      {briefing.date === today ? 'LIVE_BROADCAST' : 'ARCHIVED_BROADCAST'}
                    </span>
                  </div>
                  <h2 className="font-display text-xl md:text-3xl text-white mb-2 md:mb-3 uppercase tracking-tight">{briefing.title}</h2>
                  <div className="flex items-center gap-4 mb-4 md:mb-6">
                    <span className="mono-ui text-[9px] md:text-[10px] text-forest narvo-border px-2 py-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {briefing.duration_estimate}
                    </span>
                    <span className="mono-ui text-[9px] md:text-[10px] text-forest">
                      {briefing.stories?.length || 0} STORIES
                    </span>
                    <span className="mono-ui text-[9px] md:text-[10px] text-forest uppercase">
                      VOICE: {briefing.voice_id || 'NOVA'}
                    </span>
                  </div>
                  
                  {/* Play Button */}
                  <button 
                    onClick={handlePlay}
                    disabled={!briefing.audio_url || audioLoading}
                    className={`${isCurrentBriefingPlaying ? 'bg-white' : 'bg-primary hover:bg-white'} text-background-dark font-display font-bold px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base transition-all flex items-center gap-2 md:gap-3 disabled:opacity-50`}
                    data-testid="play-briefing-btn"
                  >
                    {audioLoading ? (
                      <div className="w-5 h-5 border-2 border-background-dark border-t-transparent animate-spin rounded-full" />
                    ) : isCurrentBriefingPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                    <span>{isCurrentBriefingPlaying ? 'PAUSE' : 'PLAY BRIEFING'}</span>
                  </button>
                </div>

                {/* Stories List */}
                <div className="narvo-border bg-surface/20 divide-y divide-forest/10">
                  <div className="p-3 md:p-4 flex items-center justify-between">
                    <span className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-widest">STORIES_INCLUDED</span>
                    <span className="mono-ui text-[8px] text-forest/60">{briefing.stories?.length || 0} / 5 SEGMENTS</span>
                  </div>
                  {briefing.stories?.map((story, i) => (
                    <div 
                      key={story.id || i} 
                      onClick={() => navigate(`/news/${story.id}`)}
                      className="p-3 md:p-4 flex gap-2 md:gap-3 hover:bg-surface/40 transition-colors cursor-pointer group"
                      data-testid={`story-${i}`}
                    >
                      <span className="mono-ui text-[9px] md:text-[10px] text-primary font-bold shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="mono-ui text-[8px] text-forest/60 uppercase">{story.category || 'GENERAL'}</span>
                          <span className="text-forest/30">•</span>
                          <span className="mono-ui text-[8px] text-forest/60">{story.source}</span>
                        </div>
                        <span className="text-slate-300 text-xs md:text-sm group-hover:text-primary transition-colors line-clamp-2">{story.title}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-forest/30 group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  ))}
                </div>

                {/* Transcript Preview */}
                {briefing.script && (
                  <div className="narvo-border bg-surface/10 mt-4 md:mt-6">
                    <div className="p-3 md:p-4 narvo-border-b">
                      <span className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-widest">TRANSCRIPT_PREVIEW</span>
                    </div>
                    <div className="p-3 md:p-4 max-h-32 overflow-y-auto custom-scroll">
                      <p className="mono-ui text-[10px] text-forest/80 leading-relaxed whitespace-pre-wrap">
                        {briefing.script.slice(0, 400)}...
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 md:py-20">
                <div className="w-20 h-20 mx-auto mb-6 narvo-border flex items-center justify-center">
                  <Radio className="w-10 h-10 text-forest/30" />
                </div>
                <h3 className="font-display text-lg text-white uppercase mb-3">NO_BRIEFING_LOADED</h3>
                <p className="mono-ui text-[10px] text-forest mb-6">Generate your first morning briefing</p>
                <button 
                  onClick={generateBriefing}
                  disabled={generating}
                  className="bg-primary text-background-dark font-display font-bold px-6 md:px-8 py-3 md:py-4 text-sm md:text-base hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                  data-testid="generate-briefing-btn"
                >
                  <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                  {generating ? 'GENERATING...' : '[ GENERATE BRIEFING ]'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Historical Briefings Sidebar */}
      <aside className="w-full lg:w-64 xl:w-72 narvo-border-l bg-surface/10 flex flex-col shrink-0 lg:h-full order-first lg:order-last">
        <div className="h-12 md:h-14 flex items-center justify-between px-4 narvo-border-b bg-surface/20 shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-widest">ARCHIVE_LOG</span>
          </div>
          <span className="mono-ui text-[8px] text-forest/60">{history.length} ENTRIES</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scroll p-2">
          {historyLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-14" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="p-4 text-center">
              <Calendar className="w-8 h-8 text-forest/20 mx-auto mb-2" />
              <p className="mono-ui text-[9px] text-forest/60">NO_HISTORY</p>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((item) => {
                const isSelected = briefing?.date === item.date;
                const isToday = item.date === today;
                return (
                  <button
                    key={item.date}
                    onClick={() => loadHistoricalBriefing(item.date)}
                    className={`w-full p-3 text-left transition-all narvo-border ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-forest hover:bg-surface/30'
                    }`}
                    data-testid={`history-${item.date}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`mono-ui text-[9px] font-bold ${isSelected ? 'text-primary' : 'text-forest'}`}>
                        {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      {isToday && (
                        <span className="mono-ui text-[7px] text-primary bg-primary/10 px-1 py-0.5">TODAY</span>
                      )}
                    </div>
                    <span className={`mono-ui text-[8px] ${isSelected ? 'text-white' : 'text-forest/60'}`}>
                      {item.stories?.length || 0} STORIES • {item.duration_estimate || '~3 MIN'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </main>
  );
};

export default MorningBriefingPage;

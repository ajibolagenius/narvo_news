import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Play, Pause, Calendar, Radio, Mic, Globe, BarChart3, 
  ChevronLeft, ChevronRight, Clock, RefreshCw, Volume2,
  CheckCircle, Circle, ArrowRight
} from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const MorningBriefingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const { playTrack, currentTrack, isPlaying, isLoading: audioLoading } = useAudio();
  const waveformRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/briefing/latest`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_URL}/api/briefing/history?limit=14`).then(r => r.json()).catch(() => ({ briefings: [] })),
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
        const histRes = await fetch(`${API_URL}/api/briefing/history?limit=14`);
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
        setCurrentStoryIndex(0);
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

  // Waveform animation
  useEffect(() => {
    if (!waveformRef.current) return;
    const bars = waveformRef.current.querySelectorAll('.wave-bar');
    bars.forEach((bar, i) => {
      const height = isCurrentBriefingPlaying 
        ? Math.random() * 60 + 20 
        : 20 + (i % 3) * 10;
      bar.style.height = `${height}%`;
    });
    
    if (isCurrentBriefingPlaying) {
      const interval = setInterval(() => {
        bars.forEach((bar) => {
          bar.style.height = `${Math.random() * 60 + 20}%`;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isCurrentBriefingPlaying]);

  return (
    <main className="flex-1 flex flex-col lg:flex-row bg-[#0a0a0a] min-w-0 overflow-hidden" data-testid="briefing-page">
      {/* Left Sidebar - Historical Log */}
      <aside className="w-full lg:w-72 xl:w-80 border-r border-[#333333] bg-[#0a0a0a] flex flex-col shrink-0 lg:h-full order-2 lg:order-1">
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#333333] bg-[#111111] shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4FF00]" />
            <span className="font-mono text-[10px] text-[#8BAE66] font-bold tracking-widest uppercase">ARCHIVE_LOG</span>
          </div>
          <span className="font-mono text-[9px] text-[#525252]">{history.length} ENTRIES</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scroll">
          {historyLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 border border-[#333333] bg-[#111111]">
                  <Skeleton variant="text" className="w-24 h-3 mb-2" />
                  <Skeleton variant="text" className="w-full h-4" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 text-center">
              <Radio className="w-8 h-8 text-[#525252] mx-auto mb-3" />
              <p className="font-mono text-[10px] text-[#525252]">NO_HISTORY_AVAILABLE</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {history.map((item) => {
                const isSelected = briefing?.date === item.date;
                const isToday = item.date === today;
                return (
                  <button
                    key={item.date}
                    onClick={() => loadHistoricalBriefing(item.date)}
                    className={`w-full p-3 text-left transition-all border ${
                      isSelected 
                        ? 'border-[#D4FF00] bg-[#D4FF00]/5' 
                        : 'border-[#333333] bg-[#111111] hover:border-[#628141] hover:bg-[#1A1A1A]'
                    }`}
                    data-testid={`history-${item.date}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-[9px] font-bold ${isSelected ? 'text-[#D4FF00]' : 'text-[#8BAE66]'}`}>
                        {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      {isToday && (
                        <span className="font-mono text-[8px] text-[#D4FF00] bg-[#D4FF00]/10 px-1.5 py-0.5">TODAY</span>
                      )}
                    </div>
                    <p className={`font-mono text-[10px] truncate ${isSelected ? 'text-white' : 'text-[#8BAE66]'}`}>
                      {item.stories?.length || 0} STORIES // {item.duration_estimate || '~3 MIN'}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content - Command Center */}
      <section className="flex-1 flex flex-col min-w-0 overflow-hidden order-1 lg:order-2">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-[#333333] bg-[#111111]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#D4FF00]" />
              <span className="font-display text-lg md:text-xl font-bold text-white uppercase tracking-tight">BRIEFING</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[#525252]">
              <span className="w-1 h-1 bg-[#628141]" />
              <span className="font-mono text-[9px]">SYSTEM_MODULE_V2.1</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="h-8 px-3 bg-[#111111] border border-[#333333] font-mono text-[10px] text-[#8BAE66] focus:outline-none focus:border-[#D4FF00]"
              data-testid="voice-selector"
            >
              {voices.map(v => (
                <option key={v.id} value={v.id}>{v.name.toUpperCase()} // {v.accent}</option>
              ))}
            </select>
            <button
              onClick={generateBriefing}
              disabled={generating}
              className="h-8 px-4 bg-[#D4FF00] text-[#0a0a0a] font-mono text-[10px] font-bold hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2"
              data-testid="generate-btn"
            >
              <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'GENERATING...' : 'NEW_BRIEFING'}
            </button>
          </div>
        </header>

        {/* Main Player Area */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          {loading ? (
            <div className="p-8 space-y-8">
              <Skeleton className="w-full h-64 bg-[#111111]" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="text" className="w-full h-12" />
                ))}
              </div>
            </div>
          ) : !briefing ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 border border-dashed border-[#333333] flex items-center justify-center">
                  <Mic className="w-12 h-12 text-[#525252]" />
                </div>
                <h2 className="font-display text-2xl font-bold text-white uppercase mb-4">NO_BRIEFING_LOADED</h2>
                <p className="font-mono text-[11px] text-[#525252] mb-8">
                  Generate your first morning briefing to start listening to AI-curated news digests.
                </p>
                <button
                  onClick={generateBriefing}
                  disabled={generating}
                  className="h-14 px-8 bg-[#D4FF00] text-[#0a0a0a] font-display font-bold text-base hover:bg-white transition-all disabled:opacity-50 flex items-center gap-3 mx-auto"
                  data-testid="first-generate-btn"
                >
                  <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
                  {generating ? 'GENERATING...' : '[ GENERATE_BRIEFING ]'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 md:p-8 space-y-6 pb-32">
              {/* Briefing Header Card */}
              <div className="border border-[#333333] bg-[#111111] relative overflow-hidden">
                {/* Background texture */}
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1741991109902-98bf764fb35d?auto=format&fit=crop&w=1200&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(100%)'
                  }}
                />
                
                <div className="relative z-10 p-6 md:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-[#D4FF00] animate-pulse" />
                        <span className="font-mono text-[9px] text-[#D4FF00] font-bold tracking-widest">
                          {briefing.date === today ? 'LIVE_BROADCAST' : 'ARCHIVED_BROADCAST'}
                        </span>
                      </div>
                      <h1 className="font-display text-2xl md:text-4xl font-bold text-white uppercase tracking-tight mb-2">
                        {briefing.title}
                      </h1>
                      <div className="flex items-center gap-4 font-mono text-[10px] text-[#8BAE66]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {briefing.duration_estimate}
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {briefing.stories?.length || 0} STORIES
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {briefing.voice_id?.toUpperCase() || 'NOVA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Waveform Visualization */}
                  <div 
                    ref={waveformRef}
                    className="h-24 md:h-32 flex items-end gap-1 mb-6 px-2"
                    data-testid="waveform"
                  >
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div
                        key={i}
                        className="wave-bar flex-1 bg-[#D4FF00] transition-all duration-150"
                        style={{ height: '20%', opacity: isCurrentBriefingPlaying ? 1 : 0.3 }}
                      />
                    ))}
                  </div>

                  {/* Play Controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlay}
                      disabled={!briefing.audio_url || audioLoading}
                      className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-all ${
                        isCurrentBriefingPlaying 
                          ? 'bg-white text-[#0a0a0a]' 
                          : 'bg-[#D4FF00] text-[#0a0a0a] hover:bg-white'
                      } disabled:opacity-50`}
                      data-testid="play-briefing-btn"
                    >
                      {audioLoading ? (
                        <div className="w-6 h-6 border-2 border-[#0a0a0a] border-t-transparent animate-spin rounded-full" />
                      ) : isCurrentBriefingPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8 ml-1" />
                      )}
                    </button>
                    <div className="flex-1">
                      <span className="font-mono text-[10px] text-[#8BAE66] block mb-1">
                        {isCurrentBriefingPlaying ? 'NOW_PLAYING' : 'READY_TO_PLAY'}
                      </span>
                      <span className="font-display text-base md:text-lg text-white font-bold uppercase">
                        {briefing.title}
                      </span>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#628141]" />
                      <div className="w-24 h-1 bg-[#333333]">
                        <div className="w-3/4 h-full bg-[#D4FF00]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stories Checklist */}
              <div className="border border-[#333333] bg-[#111111]">
                <div className="h-12 flex items-center justify-between px-4 border-b border-[#333333] bg-[#0a0a0a]">
                  <span className="font-mono text-[10px] text-[#8BAE66] font-bold tracking-widest">STORIES_INCLUDED</span>
                  <span className="font-mono text-[9px] text-[#525252]">{briefing.stories?.length || 0} / 5 SEGMENTS</span>
                </div>
                <div className="divide-y divide-[#333333]">
                  {briefing.stories?.map((story, idx) => (
                    <button
                      key={story.id || idx}
                      onClick={() => { setCurrentStoryIndex(idx); navigate(`/news/${story.id}`); }}
                      className={`w-full p-4 flex items-start gap-4 text-left transition-all group ${
                        idx === currentStoryIndex ? 'bg-[#D4FF00]/5' : 'hover:bg-[#1A1A1A]'
                      }`}
                      data-testid={`story-${idx}`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {idx === currentStoryIndex ? (
                          <CheckCircle className="w-5 h-5 text-[#D4FF00]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#333333] group-hover:text-[#628141]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[9px] text-[#D4FF00] font-bold">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="font-mono text-[9px] text-[#525252] uppercase">
                            {story.category || 'GENERAL'}
                          </span>
                          <span className="font-mono text-[8px] text-[#333333]">•</span>
                          <span className="font-mono text-[9px] text-[#525252] truncate">
                            {story.source}
                          </span>
                        </div>
                        <h3 className={`font-display text-sm md:text-base font-bold uppercase leading-tight ${
                          idx === currentStoryIndex ? 'text-[#D4FF00]' : 'text-white group-hover:text-[#D4FF00]'
                        } transition-colors`}>
                          {story.title}
                        </h3>
                        {story.summary && (
                          <p className="font-mono text-[10px] text-[#525252] mt-1 line-clamp-1">
                            {story.summary}
                          </p>
                        )}
                      </div>
                      <ArrowRight className={`w-4 h-4 shrink-0 mt-1 transition-all ${
                        idx === currentStoryIndex ? 'text-[#D4FF00]' : 'text-[#333333] group-hover:text-[#628141]'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Script Preview */}
              {briefing.script && (
                <div className="border border-[#333333] bg-[#111111]">
                  <div className="h-12 flex items-center px-4 border-b border-[#333333] bg-[#0a0a0a]">
                    <span className="font-mono text-[10px] text-[#8BAE66] font-bold tracking-widest">TRANSCRIPT_PREVIEW</span>
                  </div>
                  <div className="p-4 max-h-48 overflow-y-auto custom-scroll">
                    <p className="font-mono text-[11px] text-[#8BAE66] leading-relaxed whitespace-pre-wrap">
                      {briefing.script.slice(0, 500)}...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default MorningBriefingPage;

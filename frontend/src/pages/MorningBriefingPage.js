import React, { useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Play, Pause } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const MorningBriefingPage = () => {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const generateBriefing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/briefing/generate?voice_id=nova`);
      if (res.ok) setBriefing(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { generateBriefing(); }, []);

  return (
    <main className="flex-1 flex flex-col bg-background-dark min-w-0" data-testid="briefing-page">
      <div className="h-14 flex items-center justify-between px-8 bg-surface/30 narvo-border-b shrink-0">
        <span className="mono-ui text-[10px] text-forest">MODULE: <span className="text-primary">MORNING_BRIEFING</span></span>
        <span className="mono-ui text-[10px] text-forest">DAILY_DIGEST</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scroll p-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="flex items-end gap-1 h-8 justify-center mb-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-1 bg-forest animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <span className="mono-ui text-xs text-forest">[GENERATING BRIEFING...]</span>
            </div>
          ) : briefing ? (
            <>
              <div className="narvo-border bg-surface/50 p-8 mb-6">
                <span className="mono-ui text-[9px] text-forest block mb-3 font-bold tracking-widest">PRIORITY_DIGEST</span>
                <h2 className="font-display text-2xl text-white mb-3 uppercase">{briefing.title}</h2>
                <span className="mono-ui text-[9px] text-forest narvo-border px-2 py-0.5 inline-block mb-6">{briefing.duration_estimate}</span>
                <button onClick={() => playTrack({ id: briefing.id, title: briefing.title, audio_url: briefing.audio_url })} className="bg-primary text-background-dark font-display font-bold px-6 py-3 hover:bg-white transition-all flex items-center gap-3" data-testid="play-briefing-btn">
                  {currentTrack?.id === briefing.id && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{currentTrack?.id === briefing.id && isPlaying ? 'PAUSE' : 'PLAY BRIEFING'}</span>
                </button>
              </div>
              <div className="narvo-border bg-surface/20 divide-y divide-forest/10">
                <div className="p-4"><span className="mono-ui text-[9px] text-forest font-bold tracking-widest">STORIES_INCLUDED</span></div>
                {briefing.stories?.map((story, i) => (
                  <div key={i} className="p-4 flex gap-3 hover:bg-surface/40 transition-colors">
                    <span className="mono-ui text-[10px] text-primary font-bold shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-slate-300 text-sm">{story.title}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <button onClick={generateBriefing} className="bg-primary text-background-dark font-display font-bold px-8 py-4 hover:bg-white transition-all" data-testid="generate-briefing-btn">
                [GENERATE BRIEFING]
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MorningBriefingPage;

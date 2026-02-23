import React, { useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Play, Pause } from 'lucide-react';
import Skeleton, { ListSkeleton } from '../components/Skeleton';

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
      <div className="h-12 md:h-14 flex items-center justify-between px-4 md:px-8 bg-surface/30 narvo-border-b shrink-0">
        <span className="mono-ui text-[10px] md:text-xs text-forest">MODULE: <span className="text-primary">MORNING_BRIEFING</span></span>
        <span className="mono-ui text-[10px] md:text-xs text-forest">DAILY_DIGEST</span>
      </div>
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
              <div className="narvo-border bg-surface/50 p-5 md:p-8 mb-4 md:mb-6">
                <span className="mono-ui text-[9px] md:text-[10px] text-forest block mb-2 md:mb-3 font-bold tracking-widest">PRIORITY_DIGEST</span>
                <h2 className="font-display text-xl md:text-2xl text-white mb-2 md:mb-3 uppercase">{briefing.title}</h2>
                <span className="mono-ui text-[9px] md:text-[10px] text-forest narvo-border px-2 py-0.5 inline-block mb-4 md:mb-6">{briefing.duration_estimate}</span>
                <button onClick={() => playTrack({ id: briefing.id, title: briefing.title, audio_url: briefing.audio_url })} className="bg-primary text-background-dark font-display font-bold px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base hover:bg-white transition-all flex items-center gap-2 md:gap-3" data-testid="play-briefing-btn">
                  {currentTrack?.id === briefing.id && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{currentTrack?.id === briefing.id && isPlaying ? 'PAUSE' : 'PLAY BRIEFING'}</span>
                </button>
              </div>
              <div className="narvo-border bg-surface/20 divide-y divide-forest/10">
                <div className="p-3 md:p-4"><span className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-widest">STORIES_INCLUDED</span></div>
                {briefing.stories?.map((story, i) => (
                  <div key={i} className="p-3 md:p-4 flex gap-2 md:gap-3 hover:bg-surface/40 transition-colors">
                    <span className="mono-ui text-[9px] md:text-[10px] text-primary font-bold shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-slate-300 text-xs md:text-sm">{story.title}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 md:py-20">
              <button onClick={generateBriefing} className="bg-primary text-background-dark font-display font-bold px-6 md:px-8 py-3 md:py-4 text-sm md:text-base hover:bg-white transition-all" data-testid="generate-briefing-btn">
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

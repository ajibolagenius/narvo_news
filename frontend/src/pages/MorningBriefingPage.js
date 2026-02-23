import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const MorningBriefingPage = () => {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const generateBriefing = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/briefing/generate?voice_id=nova`);
      if (response.ok) setBriefing(await response.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { generateBriefing(); }, []);

  return (
    <div className="min-h-screen bg-background-dark" data-testid="briefing-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-forest hover:text-primary">&larr; [BACK]</button>
          <span className="font-display text-lg text-white">[Morning Briefing]</span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-20"><span className="mono-ui text-xs text-text-secondary">[GENERATING BRIEFING...]</span></div>
        ) : briefing ? (
          <>
            <div className="border border-forest bg-surface p-6 mb-6">
              <h2 className="font-display text-xl text-white mb-2">{briefing.title}</h2>
              <span className="mono-ui text-[9px] text-forest border border-forest px-1">{briefing.duration_estimate}</span>
              <button onClick={() => playTrack({ id: briefing.id, title: briefing.title, audio_url: briefing.audio_url })} className="bg-primary text-background-dark font-display font-bold px-6 py-3 hover:bg-white transition-all mt-4 block" data-testid="play-briefing-btn">
                {currentTrack?.id === briefing.id && isPlaying ? '[PAUSE]' : '[PLAY BRIEFING]'}
              </button>
            </div>
            <div className="border border-forest bg-surface p-6">
              <h3 className="font-display text-lg text-white mb-4">Stories Included</h3>
              {briefing.stories?.map((story, i) => (
                <div key={i} className="border border-forest p-4 mb-2 flex gap-3">
                  <span className="mono-ui text-[10px] text-primary">{i + 1}.</span>
                  <span className="text-slate-400 text-sm">{story.title}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <button onClick={generateBriefing} className="bg-primary text-background-dark font-display font-bold px-6 py-3 hover:bg-white transition-all" data-testid="generate-briefing-btn">
            [GENERATE BRIEFING]
          </button>
        )}
      </div>
    </div>
  );
};

export default MorningBriefingPage;

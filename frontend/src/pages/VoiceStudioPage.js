import React, { useState, useEffect } from 'react';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const VoiceStudioPage = () => {
  const [voices, setVoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/voices`)
      .then(res => res.json())
      .then(data => { setVoices(data); setSelected(data[0]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 flex flex-col bg-background-dark min-w-0" data-testid="voice-studio-page">
      <div className="h-12 md:h-14 flex items-center justify-between px-4 md:px-8 bg-surface/30 narvo-border-b shrink-0">
        <span className="mono-ui text-[10px] md:text-xs text-forest">MODULE: <span className="text-primary">VOICE_SYNTHESIS_ENGINE</span></span>
        <span className="mono-ui text-[10px] md:text-xs text-forest">{voices.length} VOICE_NODES</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <span className="mono-ui text-[9px] md:text-[10px] text-primary block mb-4 md:mb-6 font-bold tracking-[0.2em]">{'//'} REGIONAL_VOICE_PROFILES</span>
          
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="narvo-border bg-surface/20 p-4 md:p-6">
                  <Skeleton variant="text" className="w-32 h-6 mb-2" />
                  <Skeleton variant="text" className="w-24 h-4 mb-3" />
                  <Skeleton variant="text" className="w-full h-4" />
                  <Skeleton variant="text" className="w-3/4 h-4 mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
              {voices.map((voice) => (
                <div key={voice.id} className={`narvo-border p-4 md:p-6 cursor-pointer transition-all ${selected?.id === voice.id ? 'bg-primary text-background-dark border-primary' : 'bg-surface/20 hover:bg-surface/40'}`} onClick={() => setSelected(voice)} data-testid={`studio-voice-${voice.id}`}>
                  <h3 className="font-display text-base md:text-lg font-bold uppercase mb-1">{voice.name}</h3>
                  <span className="mono-ui text-[9px] md:text-[10px] opacity-70">{voice.accent}</span>
                  <p className="text-xs md:text-sm mt-2 md:mt-3 opacity-80 font-mono">{voice.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default VoiceStudioPage;

import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const VoiceStudioPage = () => {
  const [voices, setVoices] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/voices`).then(res => res.json()).then(data => { setVoices(data); setSelected(data[0]); });
  }, []);

  return (
    <main className="flex-1 flex flex-col bg-background-dark min-w-0" data-testid="voice-studio-page">
      <div className="h-14 flex items-center justify-between px-8 bg-surface/30 narvo-border-b shrink-0">
        <span className="mono-ui text-[10px] text-forest">MODULE: <span className="text-primary">VOICE_SYNTHESIS_ENGINE</span></span>
        <span className="mono-ui text-[10px] text-forest">{voices.length} VOICE_NODES</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scroll p-8">
        <div className="max-w-4xl mx-auto">
          <span className="mono-ui text-[9px] text-primary block mb-6 font-bold tracking-[0.2em]">{'//'} REGIONAL_VOICE_PROFILES</span>
          <div className="grid md:grid-cols-2 gap-4">
            {voices.map((voice) => (
              <div key={voice.id} className={`narvo-border p-6 cursor-pointer transition-all ${selected?.id === voice.id ? 'bg-primary text-background-dark border-primary' : 'bg-surface/20 hover:bg-surface/40'}`} onClick={() => setSelected(voice)} data-testid={`studio-voice-${voice.id}`}>
                <h3 className="font-display text-lg font-bold uppercase mb-1">{voice.name}</h3>
                <span className="mono-ui text-[10px] opacity-70">{voice.accent}</span>
                <p className="text-sm mt-3 opacity-80 font-mono">{voice.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default VoiceStudioPage;

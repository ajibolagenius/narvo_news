import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const VoiceStudioPage = () => {
  const navigate = useNavigate();
  const [voices, setVoices] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/voices`).then(res => res.json()).then(data => { setVoices(data); setSelected(data[0]); });
  }, []);

  return (
    <div className="min-h-screen bg-background-dark" data-testid="voice-studio-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-forest hover:text-primary">&larr; [BACK]</button>
          <span className="font-display text-lg text-white">[Regional Voice Studio]</span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {voices.map((voice) => (
            <div key={voice.id} className={`border p-6 cursor-pointer transition-all ${selected?.id === voice.id ? 'bg-primary text-background-dark border-primary' : 'border-forest hover:border-primary'}`} onClick={() => setSelected(voice)} data-testid={`studio-voice-${voice.id}`}>
              <h3 className="font-display text-lg font-bold uppercase mb-1">{voice.name}</h3>
              <span className="mono-ui text-[10px] opacity-70">{voice.accent}</span>
              <p className="text-sm mt-3 opacity-80">{voice.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceStudioPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('lagos');
  const [selectedVoice, setSelectedVoice] = useState('pidgin');
  const [selectedInterests, setSelectedInterests] = useState(['politics', 'sports', 'afrobeats']);

  const regions = [
    { id: 'lagos', name: 'Lagos / West Africa', tz: 'UTC+1', country: 'NIGERIA' },
    { id: 'nairobi', name: 'Nairobi / East Africa', tz: 'UTC+3', country: 'KENYA' },
    { id: 'johannesburg', name: 'Johannesburg / South', tz: 'UTC+2', country: 'SOUTH AFRICA' },
    { id: 'accra', name: 'Accra / West Africa', tz: 'UTC+0', country: 'GHANA' },
  ];

  const voices = [
    { id: 'pidgin', name: 'Pidgin // Sabi-Work Node', desc: 'Metropolitan rhythm, dialectal precision, zero-loss fidelity.' },
    { id: 'yoruba', name: 'Yoruba // Tonal-Pulse', desc: 'Strict tonal accuracy, broadcast-grade regional nuance.' },
    { id: 'igbo', name: 'Igbo // Core-Flow', desc: 'Rhythmic regional accent, synthesized with natural cadence.' },
  ];

  const interests = [
    { id: 'politics', name: 'Politics' },
    { id: 'tech', name: 'Tech' },
    { id: 'sports', name: 'Sports' },
    { id: 'finance', name: 'Finance' },
    { id: 'afrobeats', name: 'Afrobeats' },
    { id: 'culture', name: 'Culture' },
  ];

  const toggleInterest = (id) => {
    setSelectedInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleComplete = () => {
    const preferences = { region: selectedRegion, voice: selectedVoice, interests: selectedInterests };
    localStorage.setItem('narvo_preferences', JSON.stringify(preferences));
    navigate('/dashboard');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background-dark" data-testid="onboarding-page">
      <header className="h-16 flex items-center justify-between px-6 border-b border-forest bg-background-dark z-10">
        <div className="flex items-center gap-4">
          <svg className="w-6 h-6 text-primary" viewBox="0 0 256 256" fill="currentColor">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/>
          </svg>
          <h1 className="font-display text-xl tracking-tight font-bold text-white uppercase">
            NARVO <span className="text-forest font-light mx-2">//</span> SETUP_CONSOLE
          </h1>
        </div>
        <div className="mono-ui text-[10px] text-forest">SYSTEM_ACCESS_ID: <span className="text-primary">009-AF-X</span></div>
      </header>

      <main className="flex-1 grid grid-cols-12 h-full overflow-hidden">
        <section className="col-span-12 md:col-span-3 border-r border-forest h-full flex flex-col bg-background-dark">
          <div className="p-6 border-b border-forest">
            <span className="mono-ui text-[10px] text-forest block mb-2">P-01 // LOCALE_MATRIX</span>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white">Regional Node</h2>
            <p className="text-forest text-xs mt-2 leading-relaxed font-mono">Select production node for regional news calibration.</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ul className="flex flex-col">
              {regions.map((region) => (
                <li key={region.id} className="border-b border-forest">
                  <label className={`cursor-pointer group flex items-center justify-between p-5 transition-colors ${selectedRegion === region.id ? 'bg-primary text-background-dark' : 'hover:bg-forest/10'}`} data-testid={`region-${region.id}`}>
                    <div className="flex flex-col">
                      <span className="font-display text-lg font-bold uppercase">{region.name}</span>
                      <span className={`mono-ui text-[10px] ${selectedRegion === region.id ? 'opacity-80' : 'text-forest'}`}>{region.tz} - {region.country}</span>
                    </div>
                    <input type="radio" name="region" checked={selectedRegion === region.id} onChange={() => setSelectedRegion(region.id)} className="hidden" />
                    {selectedRegion === region.id && (
                      <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-surface border-t border-forest">
            <div className="flex justify-between items-center text-forest text-[10px] mono-ui"><span>SIGNAL_QUALITY</span><span className="text-primary">98.4%</span></div>
            <div className="w-full bg-background-dark h-1 mt-2 border border-forest"><div className="h-full w-[98%] bg-primary" /></div>
          </div>
        </section>

        <section className="col-span-12 md:col-span-4 border-r border-forest h-full flex flex-col bg-background-dark">
          <div className="p-6 border-b border-forest">
            <span className="mono-ui text-[10px] text-forest block mb-2">P-02 // VOICE_SYNTHESIS_ENGINE</span>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white">Vocal Matrix</h2>
            <p className="text-forest text-xs mt-2 leading-relaxed font-mono">Calibrate the regional synthesis engine for high-fidelity audio delivery.</p>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {voices.map((voice) => (
              <div key={voice.id} className="relative group">
                <input type="radio" id={voice.id} name="voice" checked={selectedVoice === voice.id} onChange={() => setSelectedVoice(voice.id)} className="peer hidden" />
                <label htmlFor={voice.id} className={`block border p-5 cursor-pointer transition-all ${selectedVoice === voice.id ? 'bg-primary text-background-dark border-primary' : 'border-forest hover:border-primary'}`} data-testid={`voice-${voice.id}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-display text-lg font-bold uppercase">{voice.name}</span>
                    <svg className={`w-5 h-5 ${selectedVoice !== voice.id ? 'opacity-40' : ''}`} viewBox="0 0 256 256" fill="currentColor">
                      <path d="M56,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM88,24a8,8,0,0,0-8,8V224a8,8,0,0,0,16,0V32A8,8,0,0,0,88,24Zm40,32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V64A8,8,0,0,0,128,56Z"/>
                    </svg>
                  </div>
                  <p className="mono-ui text-[10px] opacity-70 mb-4">{voice.desc}</p>
                  <div className="flex items-center gap-2 text-[10px] mono-ui font-bold">
                    <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor"><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/></svg>
                    <span>AUDITION_MODE</span>
                  </div>
                </label>
              </div>
            ))}
          </div>
          <div className="h-20 border-t border-forest flex items-center justify-center relative overflow-hidden bg-surface">
            <div className="absolute inset-0 flex items-center justify-center gap-[3px] opacity-30">
              {[4, 8, 12, 6, 16, 8, 12, 4].map((h, i) => (
                <div key={i} className={`w-1 bg-forest ${i === 4 ? 'bg-primary animate-pulse' : ''}`} style={{ height: `${h}px` }} />
              ))}
            </div>
            <span className="relative z-10 mono-ui text-[9px] text-forest bg-surface px-2">SIGNAL_ANALYZER // STANDBY</span>
          </div>
        </section>

        <section className="col-span-12 md:col-span-5 h-full flex flex-col bg-background-dark">
          <div className="p-6 border-b border-forest">
            <span className="mono-ui text-[10px] text-forest block mb-2">P-03 // NARRATIVE_CALIBRATION</span>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white">Interest Matrix</h2>
            <p className="text-forest text-xs mt-2 leading-relaxed font-mono">Map your cognitive interest grid for precise news delivery.</p>
          </div>
          <div className="flex-1 p-6 flex flex-col">
            <div className="grid grid-cols-3 gap-[1px] border border-forest bg-forest">
              {interests.map((interest, idx) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <label key={interest.id} className={`cursor-pointer group relative h-28 flex flex-col justify-between p-3 transition-colors ${isSelected ? 'bg-primary text-background-dark' : 'bg-background-dark hover:bg-forest/10 text-white'}`} data-testid={`interest-${interest.id}`}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleInterest(interest.id)} className="hidden" />
                    <div className="flex justify-between items-start">
                      <span className={`mono-ui text-[9px] ${isSelected ? '' : 'text-forest'}`}>{String(idx + 1).padStart(2, '0')}</span>
                      {isSelected && (
                        <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM181.66,109.66l-72,72a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L104,164.69l66.34-66.35a8,8,0,0,1,11.32,11.32Z"/></svg>
                      )}
                    </div>
                    <span className={`font-display text-lg font-bold uppercase leading-none ${!isSelected ? 'group-hover:text-primary' : ''}`}>{interest.name}</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-auto pt-8">
              <div className="flex justify-between items-center mb-4">
                <span className="mono-ui text-[10px] text-forest">SYSTEM_STATUS: <span className="text-primary">INITIAL_LINK_READY</span></span>
                <span className="mono-ui text-[10px] text-forest">CALIBRATION_PROGRESS: {Math.round((selectedInterests.length / interests.length) * 100)}%</span>
              </div>
              <button onClick={handleComplete} className="w-full bg-primary text-background-dark font-display font-bold text-lg py-5 hover:bg-white active:bg-primary/80 transition-all flex items-center justify-center gap-3" data-testid="complete-onboarding-btn">
                <span className="uppercase tracking-tighter">Initialize Narrative Feed</span>
                <svg className="w-6 h-6" viewBox="0 0 256 256" fill="currentColor"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OnboardingPage;

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Waveform, Radio, Prohibit, Check, Translate, SpeakerHigh, Stop, CircleNotch } from '@phosphor-icons/react';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { useHapticAlert } from '../components/HapticAlerts';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const BROADCAST_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', description: 'INTERNATIONAL', sample: 'Welcome to Narvo. Your trusted source for African news.' },
  { code: 'pcm', name: 'Naija', native: 'Naija Tok', description: 'PIDGIN_NAIJA', sample: 'Welcome to Narvo. Your trusted source for African news.' },
  { code: 'yo', name: 'Yoruba', native: 'Ede Yoruba', description: 'ILU_YORUBA', sample: 'Welcome to Narvo. Your trusted source for African news.' },
  { code: 'ha', name: 'Hausa', native: 'Harshen Hausa', description: 'AREWACIN_NAJERIYA', sample: 'Welcome to Narvo. Your trusted source for African news.' },
  { code: 'ig', name: 'Igbo', native: 'Asusu Igbo', description: 'ALA_IGBO', sample: 'Welcome to Narvo. Your trusted source for African news.' },
];

const VoiceStudioPage = () => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewTime] = useState('00:14');
  const [regionFilter, setRegionFilter] = useState('AFRICA');
  const [dialectFilter, setDialectFilter] = useState('ALL');
  const [broadcastLanguage, setBroadcastLang] = useState('en');
  const [langPreviewPlaying, setLangPreviewPlaying] = useState(null);
  const [langPreviewLoading, setLangPreviewLoading] = useState(null);
  const langAudioRef = useRef(null);
  const { playTrack, setBroadcastLanguage } = useAudio();
  const { user } = useAuth();
  const { showAlert } = useHapticAlert();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voicesRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/voices`),
          user?.id ? fetch(`${API_URL}/api/settings/${user.id}`) : Promise.resolve(null)
        ]);
        
        const voicesData = await voicesRes.json();
        setVoices(voicesData);
        
        if (settingsRes && settingsRes.ok) {
          const settingsData = await settingsRes.json();
          const savedVoice = voicesData.find(v => v.id === settingsData.voice_model);
          if (savedVoice) setSelectedVoice(savedVoice);
          else if (voicesData.length > 0) setSelectedVoice(voicesData[0]);
          if (settingsData.voice_region) setRegionFilter(settingsData.voice_region.toUpperCase());
          if (settingsData.voice_dialect) setDialectFilter(settingsData.voice_dialect.toUpperCase());
          if (settingsData.broadcast_language) setBroadcastLang(settingsData.broadcast_language);
        } else if (voicesData.length > 0) {
          setSelectedVoice(voicesData[0]);
        }
      } catch (err) {
        console.error('Failed to load voices:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [user?.id]);

  useEffect(() => {
    return () => { if (langAudioRef.current) langAudioRef.current.pause(); };
  }, []);

  const handleApplyModel = async () => {
    if (!selectedVoice || !user?.id) return;
    
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/settings/${user.id}/voice?voice_model=${selectedVoice.id}&voice_dialect=${dialectFilter.toLowerCase()}&voice_region=${regionFilter.toLowerCase()}`, {
        method: 'POST'
      });
      showAlert('VOICE_CHANGED');
    } catch (err) {
      showAlert('NETWORK_ERROR');
    }
    setSaving(false);
  };

  const handlePreview = () => {
    if (selectedVoice) {
      playTrack({ 
        id: `preview-${selectedVoice.id}`, 
        title: `Voice Preview: ${selectedVoice.name}`,
        summary: `Testing ${selectedVoice.accent} voice model`
      });
      setPreviewPlaying(true);
    }
  };

  const handleBroadcastLanguageChange = async (langCode) => {
    setBroadcastLang(langCode);
    const userId = user?.id || 'guest';
    try {
      await fetch(`${API_URL}/api/settings/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcast_language: langCode }),
      });
      setBroadcastLanguage(langCode);
      const langInfo = BROADCAST_LANGUAGES.find(l => l.code === langCode);
      showAlert({
        type: 'success',
        title: 'BROADCAST_UPDATED',
        message: `Now broadcasting in ${langInfo?.name || langCode}`,
        code: 'LANG_SAVE',
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to save broadcast language:', err);
    }
  };

  const playLangPreview = async (e, lang) => {
    e.stopPropagation();
    if (langPreviewPlaying === lang.code) {
      if (langAudioRef.current) { langAudioRef.current.pause(); langAudioRef.current = null; }
      setLangPreviewPlaying(null);
      return;
    }
    if (langAudioRef.current) { langAudioRef.current.pause(); langAudioRef.current = null; }
    setLangPreviewLoading(lang.code);
    setLangPreviewPlaying(null);
    try {
      const res = await fetch(`${API_URL}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: lang.sample, voice_id: 'onyx', language: lang.code }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const data = await res.json();
      const audio = new Audio(data.audio_url);
      langAudioRef.current = audio;
      audio.onended = () => { setLangPreviewPlaying(null); langAudioRef.current = null; };
      audio.onerror = () => { setLangPreviewPlaying(null); langAudioRef.current = null; };
      await audio.play();
      setLangPreviewPlaying(lang.code);
    } catch (err) {
      showAlert({ type: 'warning', title: 'PREVIEW_FAILED', message: 'Could not generate voice preview.', code: 'TTS_ERR', duration: 3000 });
    } finally {
      setLangPreviewLoading(null);
    }
  };

  const getVoiceStatus = (voice) => {
    if (selectedVoice?.id === voice.id) return { label: 'ACTIVE_MODEL', active: true };
    return { label: 'STANDBY', active: false };
  };

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-background-dark" data-testid="voice-studio-page">
      {/* Preview Panel */}
      <div className="p-4 md:p-8 narvo-border-b bg-background-dark flex flex-col gap-4 md:gap-6 shrink-0">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-content uppercase tracking-tight">
              Broadcast_Preview
            </h2>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1">
              <span className="mono-ui text-[9px] md:text-[10px] text-forest font-bold">NODE: LAG_88_V</span>
              <span className="mono-ui text-[9px] md:text-[10px] text-forest/40 font-bold hidden sm:inline">.</span>
              <span className="mono-ui text-[9px] md:text-[10px] text-forest font-bold">FREQ: 48kHz / 32bit</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-content hover:bg-forest transition-colors" data-testid="skip-back-btn">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={handlePreview}
              className="w-10 h-10 md:w-12 md:h-12 bg-primary text-background-dark flex items-center justify-center hover:bg-white transition-colors"
              data-testid="preview-play-btn"
            >
              {previewPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="currentColor" />}
            </button>
            <button className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-content hover:bg-forest transition-colors" data-testid="skip-forward-btn">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="h-14 md:h-16 narvo-border bg-background-dark/40 flex items-center gap-1 px-4 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-5" 
            style={{ backgroundImage: 'radial-gradient(#628141 1px, transparent 1px)', backgroundSize: '10px 10px' }}
          />
          {[20, 40, 60, 100, 80, 50, 30, 20, 40, 60, 100, 80, 50, 30, 20].map((h, i) => (
            <div 
              key={i} 
              className={`w-1 transition-all ${i >= 3 && i <= 10 ? 'bg-primary' : 'bg-primary/30'}`}
              style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
          <div className="flex-1 h-px bg-forest opacity-20 ml-2" />
          <span className="mono-ui text-[8px] md:text-[9px] text-primary font-bold absolute right-4 bottom-2 tracking-widest">
            {previewTime} / 02:30
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scroll pb-20 md:pb-8">
        {/* Broadcast Language Section */}
        <div className="p-4 md:p-8 narvo-border-b">
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <h3 className="font-display text-xl md:text-2xl font-bold text-content uppercase tracking-tight">
              BROADCAST_LANGUAGE
            </h3>
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-[0.2em] hidden sm:block">
              AUDIO_TRANSLATION_ENGINE
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary shrink-0">
              <Translate className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="mono-ui text-[10px] md:text-[12px] text-content font-bold">AUDIO_NARRATION_LANGUAGE</h4>
              <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold break-words">NEWS_WILL_BE_TRANSLATED_AND_READ_ALOUD_IN_THIS_LANGUAGE</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {BROADCAST_LANGUAGES.map(lang => {
              const isActive = broadcastLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleBroadcastLanguageChange(lang.code)}
                  className={`relative p-4 md:p-5 narvo-border text-left transition-all ${
                    isActive
                      ? 'bg-primary text-background-dark border-primary' 
                      : 'hover:bg-surface/10 hover:border-forest'
                  }`}
                  data-testid={`broadcast-lang-${lang.code}`}
                >
                  {isActive && (
                    <span className="absolute top-2 right-2 text-[7px] font-bold px-1.5 py-0.5 bg-background-dark text-primary mono-ui">
                      ON_AIR
                    </span>
                  )}
                  <span className="block mono-ui text-[11px] md:text-[12px] font-bold mb-1">{lang.name}</span>
                  <span className={`block mono-ui text-[9px] md:text-[10px] ${isActive ? 'text-background-dark/70' : 'text-forest'}`}>
                    {lang.native}
                  </span>
                  <span className={`block mt-2 mono-ui text-[7px] md:text-[8px] tracking-wider ${isActive ? 'text-background-dark/50' : 'text-forest/60'}`}>
                    {lang.description}
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => playLangPreview(e, lang)}
                    onKeyDown={(e) => { if (e.key === 'Enter') playLangPreview(e, lang); }}
                    className={`absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center narvo-border transition-all cursor-pointer ${
                      langPreviewPlaying === lang.code
                        ? (isActive ? 'bg-background-dark text-primary' : 'bg-primary text-background-dark')
                        : (isActive ? 'bg-background-dark/20 text-background-dark hover:bg-background-dark hover:text-primary' : 'bg-surface/20 text-forest hover:bg-primary hover:text-background-dark')
                    }`}
                    data-testid={`voice-preview-${lang.code}`}
                  >
                    {langPreviewLoading === lang.code ? (
                      <CircleNotch weight="bold" className="w-3.5 h-3.5 animate-spin" />
                    ) : langPreviewPlaying === lang.code ? (
                      <Stop weight="fill" className="w-3.5 h-3.5" />
                    ) : (
                      <SpeakerHigh weight="bold" className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 mono-ui text-[8px] md:text-[9px] text-forest/50">
            THIS_CONTROLS_AUDIO_NARRATION — INTERFACE_TEXT_LANGUAGE_IS_SET_IN_SETTINGS
          </p>
        </div>

        {/* Voice Selection Grid */}
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
            <h3 className="mono-ui text-[10px] md:text-[11px] text-forest font-bold tracking-[0.2em]">
              VOICE_MATRIX // SELECT_ENTITY_MODEL
            </h3>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <button 
                onClick={() => setRegionFilter(regionFilter === 'AFRICA' ? 'ALL' : 'AFRICA')}
                className={`px-3 md:px-4 py-2 narvo-border mono-ui text-[8px] md:text-[9px] font-bold transition-all ${
                  regionFilter === 'AFRICA' ? 'bg-primary text-background-dark' : 'text-forest hover:text-content hover:border-white'
                }`}
                data-testid="region-filter-btn"
              >
                REGION: {regionFilter}
              </button>
              <button 
                onClick={() => setDialectFilter(dialectFilter === 'ALL' ? 'PIDGIN' : 'ALL')}
                className={`px-3 md:px-4 py-2 narvo-border mono-ui text-[8px] md:text-[9px] font-bold transition-all ${
                  dialectFilter !== 'ALL' ? 'bg-primary text-background-dark' : 'text-forest hover:text-content hover:border-white'
                }`}
                data-testid="dialect-filter-btn"
              >
                DIALECT: {dialectFilter}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="narvo-border p-6 md:p-8 flex flex-col gap-4">
                  <Skeleton variant="text" className="w-24 h-4" />
                  <Skeleton variant="text" className="w-32 h-8" />
                  <div className="h-20 md:h-24 narvo-border bg-background-dark/20" />
                  <Skeleton variant="text" className="w-full h-4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {voices.map((voice) => {
                const status = getVoiceStatus(voice);
                return (
                  <div 
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`narvo-border p-6 md:p-8 flex flex-col cursor-pointer transition-all ${
                      status.active 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-forest hover:bg-surface/20'
                    }`}
                    data-testid={`voice-card-${voice.id}`}
                  >
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div className="space-y-1">
                        <span className={`mono-ui text-[7px] md:text-[8px] px-2 py-0.5 font-bold ${
                          status.active 
                            ? 'bg-primary text-background-dark' 
                            : 'border border-forest text-forest'
                        }`}>
                          {status.label}
                        </span>
                        <h4 className="font-display text-xl md:text-2xl font-bold text-content uppercase">
                          {voice.name.replace(' ', '_')}
                        </h4>
                      </div>
                      {status.active ? (
                        <Waveform className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                      ) : (
                        <Prohibit className="w-5 h-5 md:w-6 md:h-6 text-forest" />
                      )}
                    </div>
                    
                    <div className="h-20 md:h-24 narvo-border bg-background-dark/20 flex items-center justify-center mb-4 md:mb-6 overflow-hidden relative">
                      <div 
                        className="absolute inset-0 opacity-10" 
                        style={{ backgroundImage: 'linear-gradient(45deg, #628141 25%, transparent 25%, transparent 50%, #628141 50%, #628141 75%, transparent 75%, transparent)', backgroundSize: '20px 20px' }}
                      />
                      <Radio className="w-8 h-8 text-forest opacity-30" />
                    </div>
                    
                    <div className="flex justify-between items-end narvo-border-t border-forest/30 pt-3 md:pt-4">
                      <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold uppercase">
                        Variant: {voice.accent}
                      </span>
                      <span className={`mono-ui text-[8px] md:text-[9px] font-bold ${status.active ? 'text-primary' : 'text-forest'}`}>
                        {status.active ? 'SIGNAL_STABLE' : 'NODE_IDLE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Voice Info Panel */}
      {selectedVoice && (
        <div className="narvo-border-t p-4 md:p-6 bg-surface/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 narvo-border bg-primary/20 flex items-center justify-center">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div>
              <span className="text-content font-display font-bold text-sm md:text-base">{selectedVoice.name}</span>
              <span className="mono-ui text-[8px] md:text-[9px] text-forest block">{selectedVoice.description}</span>
            </div>
          </div>
          <button 
            onClick={handleApplyModel}
            disabled={saving}
            className="bg-primary text-background-dark px-6 md:px-8 py-2 md:py-3 mono-ui text-[10px] md:text-[11px] font-bold hover:bg-white transition-all disabled:opacity-50"
            data-testid="apply-voice-btn"
          >
            {saving ? 'SAVING...' : 'APPLY_MODEL'}
          </button>
        </div>
      )}
    </main>
  );
};

export default VoiceStudioPage;

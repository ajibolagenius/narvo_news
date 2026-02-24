import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, AudioWaveform, Radio, CircleOff, Check } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { useHapticAlert } from '../components/HapticAlerts';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const VoiceStudioPage = () => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewTime] = useState('00:14');
  const [regionFilter, setRegionFilter] = useState('AFRICA');
  const [dialectFilter, setDialectFilter] = useState('ALL');
  const { playTrack } = useAudio();
  const { user } = useAuth();
  const { showAlert } = useHapticAlert();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voicesRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/voices`),
          user?.id ? fetch(`${API_URL}/api/settings/${user.id}/voice`) : Promise.resolve(null)
        ]);
        
        const voicesData = await voicesRes.json();
        setVoices(voicesData);
        
        if (settingsRes) {
          const settingsData = await settingsRes.json();
          const savedVoice = voicesData.find(v => v.id === settingsData.voice_model);
          if (savedVoice) setSelectedVoice(savedVoice);
          else if (voicesData.length > 0) setSelectedVoice(voicesData[0]);
          if (settingsData.voice_region) setRegionFilter(settingsData.voice_region.toUpperCase());
          if (settingsData.voice_dialect) setDialectFilter(settingsData.voice_dialect.toUpperCase());
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

  const getVoiceStatus = (voice) => {
    if (selectedVoice?.id === voice.id) return { label: 'ACTIVE_MODEL', active: true };
    return { label: 'STANDBY', active: false };
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background-dark" data-testid="voice-studio-page">
      {/* Preview Panel */}
      <div className="p-6 md:p-8 narvo-border-b bg-background-dark flex flex-col gap-4 md:gap-6 shrink-0">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
              Broadcast_Preview
            </h2>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1">
              <span className="mono-ui text-[9px] md:text-[10px] text-forest font-bold">NODE: LAG_88_V</span>
              <span className="mono-ui text-[9px] md:text-[10px] text-forest/40 font-bold hidden sm:inline">•</span>
              <span className="mono-ui text-[9px] md:text-[10px] text-forest font-bold">FREQ: 48kHz / 32bit</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-white hover:bg-forest transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={handlePreview}
              className="w-10 h-10 md:w-12 md:h-12 bg-primary text-background-dark flex items-center justify-center hover:bg-white transition-colors"
              data-testid="preview-play-btn"
            >
              {previewPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="currentColor" />}
            </button>
            <button className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-white hover:bg-forest transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="h-14 md:h-16 narvo-border bg-black/40 flex items-center gap-1 px-4 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-5" 
            style={{ backgroundImage: 'radial-gradient(#628141 1px, transparent 1px)', backgroundSize: '10px 10px' }}
          />
          {/* Visualizer Bars */}
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

      {/* Voice Selection Grid */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 pb-20 md:pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <h3 className="mono-ui text-[10px] md:text-[11px] text-forest font-bold tracking-[0.2em]">
            VOICE_MATRIX // SELECT_ENTITY_MODEL
          </h3>
          <div className="flex flex-wrap gap-2 md:gap-4">
            <button 
              onClick={() => setRegionFilter(regionFilter === 'AFRICA' ? 'ALL' : 'AFRICA')}
              className={`px-3 md:px-4 py-2 narvo-border mono-ui text-[8px] md:text-[9px] font-bold transition-all ${
                regionFilter === 'AFRICA' ? 'bg-primary text-background-dark' : 'text-forest hover:text-white hover:border-white'
              }`}
            >
              REGION: {regionFilter}
            </button>
            <button 
              onClick={() => setDialectFilter(dialectFilter === 'ALL' ? 'PIDGIN' : 'ALL')}
              className={`px-3 md:px-4 py-2 narvo-border mono-ui text-[8px] md:text-[9px] font-bold transition-all ${
                dialectFilter !== 'ALL' ? 'bg-primary text-background-dark' : 'text-forest hover:text-white hover:border-white'
              }`}
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
                <div className="h-20 md:h-24 narvo-border bg-black/20" />
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
                      <h4 className="font-display text-xl md:text-2xl font-bold text-white uppercase">
                        {voice.name.replace(' ', '_')}
                      </h4>
                    </div>
                    {status.active ? (
                      <AudioWaveform className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    ) : (
                      <CircleOff className="w-5 h-5 md:w-6 md:h-6 text-forest" />
                    )}
                  </div>
                  
                  <div className="h-20 md:h-24 narvo-border bg-black/20 flex items-center justify-center mb-4 md:mb-6 overflow-hidden relative">
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

      {/* Selected Voice Info Panel */}
      {selectedVoice && (
        <div className="narvo-border-t p-4 md:p-6 bg-surface/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 narvo-border bg-primary/20 flex items-center justify-center">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div>
              <span className="text-white font-display font-bold text-sm md:text-base">{selectedVoice.name}</span>
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

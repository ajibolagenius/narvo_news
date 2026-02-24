import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Rows, Type, Hand, Pointer, Mic, Info, Loader2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useHapticAlert } from '../components/HapticAlerts';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DEFAULT_SETTINGS = {
  displayDensity: 'standard',
  fontScale: 100,
  lateralSwipe: true,
  pinchZoom: false,
  voiceCommands: false,
};

const AccessibilityPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showAlert } = useHapticAlert();
  const [displayDensity, setDisplayDensity] = useState('standard');
  const [fontScale, setFontScale] = useState(100);
  const [gestures, setGestures] = useState({ lateralSwipe: true, pinchZoom: false });
  const [voiceCommandsList] = useState([
    { id: 1, command: '"NARVO, OPEN NEWSFEED"', active: true },
    { id: 2, command: '"NARVO, BRIGHTNESS UP"', active: true },
  ]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const userId = user?.id || 'guest';
      try {
        const res = await fetch(`${API_URL}/api/settings/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setDisplayDensity(data.display_density || DEFAULT_SETTINGS.displayDensity);
          setFontScale(data.font_scale ?? DEFAULT_SETTINGS.fontScale);
          setGestures({
            lateralSwipe: data.gestural_swipe ?? DEFAULT_SETTINGS.lateralSwipe,
            pinchZoom: data.gestural_pinch ?? DEFAULT_SETTINGS.pinchZoom,
          });
        }
      } catch (err) {
        console.error('Failed to load accessibility settings:', err);
      }
      setLoadingSettings(false);
    };
    fetchSettings();
  }, [user?.id]);

  const handleDensityChange = (id) => {
    setDisplayDensity(id);
    setHasChanges(true);
  };

  const handleFontScaleChange = (val) => {
    setFontScale(val);
    setHasChanges(true);
  };

  const toggleGesture = (key) => {
    setGestures(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const userId = user?.id || 'guest';
    try {
      const res = await fetch(`${API_URL}/api/settings/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_density: displayDensity,
          font_scale: fontScale,
          gestural_swipe: gestures.lateralSwipe,
          gestural_pinch: gestures.pinchZoom,
        }),
      });
      if (res.ok) {
        setHasChanges(false);
        showAlert({ type: 'success', title: t('alerts.settings_saved'), message: t('alerts.settings_saved_msg'), code: 'SAVE_OK' });
      }
    } catch (err) {
      showAlert({ type: 'error', title: 'SAVE_FAILED', message: 'Could not save accessibility settings.', code: 'ERR_SAVE' });
    }
    setSaving(false);
  };

  const densityOptions = [
    { id: 'compact', label: t('accessibility.compact'), desc: 'MAX_DENSITY_MODE // MIN_PADDING', bars: 4 },
    { id: 'standard', label: t('accessibility.standard'), desc: 'BALANCED_FLOW // OPTIMAL_READ', bars: 2 },
    { id: 'expanded', label: t('accessibility.expanded'), desc: 'MAX_WHITESPACE // FOCUS_DOCK', bars: 1 },
  ];

  if (loadingSettings) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background-dark" data-testid="accessibility-page">
        <div className="flex items-center gap-3 mono-ui text-xs text-forest">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          {t('common.loading')}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-forest/30 overflow-hidden bg-background-dark" data-testid="accessibility-page">
      {/* 01: Display Density */}
      <section className="flex flex-col h-full overflow-hidden">
        <div className="p-6 md:p-8 narvo-border-b flex justify-between items-center shrink-0">
          <div className="space-y-1">
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-widest">LAYER_01</span>
            <h3 className="text-primary font-bold text-lg md:text-xl tracking-tight uppercase">{t('accessibility.display_density')}</h3>
          </div>
          <Rows className="w-5 h-5 md:w-6 md:h-6 text-forest" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 space-y-6 md:space-y-8">
          <p className="mono-ui text-[9px] md:text-[10px] text-forest leading-relaxed font-bold">
            ADJUST THE INFORMATION DENSITY OF THE BROADCAST GRID. HIGHER DENSITY ALLOWS FOR MAXIMUM DATA THROUGHPUT.
          </p>

          <div className="space-y-3 md:space-y-4">
            {densityOptions.map(option => (
              <label key={option.id} className="block cursor-pointer group">
                <input 
                  type="radio" 
                  name="density" 
                  checked={displayDensity === option.id}
                  onChange={() => handleDensityChange(option.id)}
                  className="peer sr-only" 
                />
                <div className={`p-4 md:p-6 narvo-border bg-surface/10 transition-all relative ${
                  displayDensity === option.id ? 'bg-primary/5 border-primary' : 'hover:border-forest'
                }`}>
                  <div className={`absolute right-4 md:right-6 top-4 md:top-6 w-4 h-4 narvo-border transition-all ${
                    displayDensity === option.id ? 'bg-primary border-primary' : ''
                  }`} />
                  <h4 className="font-display text-lg md:text-xl font-bold text-white uppercase mb-2">{option.label}</h4>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">{option.desc}</p>
                  <div className={`mt-3 md:mt-4 flex h-5 md:h-6 opacity-30 group-hover:opacity-60 ${option.bars === 1 ? '' : `gap-${option.bars === 4 ? '1' : '2'}`}`}>
                    {Array.from({ length: option.bars }).map((_, i) => (
                      <div key={i} className={`bg-forest ${option.bars === 1 ? 'w-full' : 'flex-1'}`} />
                    ))}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* 02: Font Scaling */}
      <section className="flex flex-col h-full overflow-hidden">
        <div className="p-6 md:p-8 narvo-border-b flex justify-between items-center shrink-0">
          <div className="space-y-1">
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-widest">LAYER_02</span>
            <h3 className="text-primary font-bold text-lg md:text-xl tracking-tight uppercase">{t('accessibility.font_scaling')}</h3>
          </div>
          <Type className="w-5 h-5 md:w-6 md:h-6 text-forest" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 space-y-8 md:space-y-12">
          <div className="space-y-4 md:space-y-6">
            <div className="flex justify-between items-end">
              <span className="mono-ui text-[9px] md:text-[10px] text-forest font-bold">SCALE_FACTOR</span>
              <span className="font-display text-2xl md:text-3xl font-bold text-primary leading-none">{fontScale}%</span>
            </div>
            <div className="relative py-3 md:py-4">
              <input 
                type="range" 
                className="w-full h-1 bg-forest/30 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary"
                min="75" 
                max="150" 
                value={fontScale}
                onChange={(e) => handleFontScaleChange(parseInt(e.target.value))}
                data-testid="font-scale-slider"
              />
              <div className="flex justify-between mt-3 md:mt-4 mono-ui text-[8px] md:text-[9px] text-forest font-bold">
                <span>75%</span>
                <span>100%</span>
                <span>150%</span>
              </div>
            </div>
          </div>

          <div className="narvo-border bg-surface/5 p-4 md:p-8 space-y-6 md:space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-forest px-2 md:px-3 py-1 mono-ui text-[7px] md:text-[8px] text-white font-bold">
              OUTPUT_PREVIEW
            </div>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <span className="mono-ui text-[8px] md:text-[9px] text-primary font-bold border-l-2 border-primary pl-2 uppercase">
                  HEADLINE // SPACE GROTESK
                </span>
                <h4 
                  className="font-display font-bold text-white uppercase leading-tight"
                  style={{ fontSize: `${Math.round(24 * fontScale / 100)}px` }}
                >
                  BREAKING: GLOBAL_MARKET_NODE_4 SHIFT REPORTED.
                </h4>
              </div>
              <div className="space-y-2">
                <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold border-l-2 border-forest pl-2 uppercase">
                  BODY // JETBRAINS MONO
                </span>
                <p 
                  className="mono-ui text-forest leading-relaxed"
                  style={{ fontSize: `${Math.round(11 * fontScale / 100)}px` }}
                >
                  SYSTEM ANALYSIS DETECTS 14% FLUCTUATION. NODES 4, 8, AND 12 ARE OPERATING AT PEAK CAPACITY.
                </p>
              </div>
            </div>
          </div>

          <div className="narvo-border p-3 md:p-4 bg-primary/5 flex gap-3 md:gap-4">
            <Info className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
            <p className="mono-ui text-[8px] md:text-[9px] text-forest leading-relaxed font-bold">
              FONT SCALING AFFECTS ALL TERMINAL READOUTS. BROADCAST GRAPHICS MAINTAIN FIXED RATIOS FOR INTEGRITY.
            </p>
          </div>
        </div>
      </section>

      {/* 03: Interaction */}
      <section className="flex flex-col h-full overflow-hidden">
        <div className="p-6 md:p-8 narvo-border-b flex justify-between items-center shrink-0">
          <div className="space-y-1">
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-widest">LAYER_03</span>
            <h3 className="text-primary font-bold text-lg md:text-xl tracking-tight uppercase">{t('accessibility.ui_interaction')}</h3>
          </div>
          <Pointer className="w-5 h-5 md:w-6 md:h-6 text-forest" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 space-y-8 md:space-y-10">
          <div className="space-y-4 md:space-y-6">
            <h4 className="mono-ui text-[9px] md:text-[10px] text-forest font-bold border-b border-forest/30 pb-2">
              {t('accessibility.gestural_control')}
            </h4>

            <div className="space-y-2 md:space-y-3">
              {/* Lateral Swipe */}
              <div className="p-3 md:p-4 narvo-border bg-surface/5 flex items-center justify-between group hover:border-primary transition-all">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-white group-hover:text-primary transition-colors">
                    <Hand className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="mono-ui text-[10px] md:text-[11px] text-white font-bold">{t('accessibility.lateral_swipe')}</h5>
                    <p className="mono-ui text-[8px] md:text-[9px] text-forest">NAV_DATA_STREAMS</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={gestures.lateralSwipe}
                  onChange={() => toggleGesture('lateralSwipe')}
                  className="w-4 h-4 md:w-5 md:h-5 bg-transparent narvo-border checked:bg-primary focus:ring-0 cursor-pointer"
                  data-testid="gesture-swipe"
                />
              </div>

              {/* Pinch Zoom */}
              <div className="p-3 md:p-4 narvo-border bg-surface/5 flex items-center justify-between group hover:border-primary transition-all">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-white group-hover:text-primary transition-colors">
                    <Hand className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="mono-ui text-[10px] md:text-[11px] text-white font-bold">{t('accessibility.pinch_zoom')}</h5>
                    <p className="mono-ui text-[8px] md:text-[9px] text-forest">EXPAND_MAP_DOCK</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={gestures.pinchZoom}
                  onChange={() => toggleGesture('pinchZoom')}
                  className="w-4 h-4 md:w-5 md:h-5 bg-transparent narvo-border checked:bg-primary focus:ring-0 cursor-pointer"
                  data-testid="gesture-pinch"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="flex justify-between items-end border-b border-forest/30 pb-2">
              <h4 className="mono-ui text-[9px] md:text-[10px] text-forest font-bold">{t('accessibility.voice_commands')}</h4>
              <span className="mono-ui text-[8px] md:text-[9px] text-primary font-bold animate-pulse">LISTENING_V2</span>
            </div>

            {/* Voice Waveform */}
            <div className="narvo-border bg-black p-4 flex items-center justify-center gap-1 h-24 md:h-32">
              {[8, 16, 24, 20, 28, 12, 20, 10].map((h, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 ${i === 3 || i === 4 ? 'bg-primary' : i < 3 ? 'bg-forest/40' : 'bg-forest/60'}`}
                  style={{ height: `${h * 4}px` }}
                />
              ))}
            </div>

            <div className="space-y-2">
              {voiceCommandsList.map(cmd => (
                <button 
                  key={cmd.id}
                  className="w-full p-3 md:p-4 narvo-border bg-surface/5 flex items-center gap-3 md:gap-4 hover:bg-forest/10 transition-all group"
                >
                  <Mic className="w-4 h-4 text-forest group-hover:text-primary transition-colors" />
                  <span className="mono-ui text-[9px] md:text-[10px] text-white font-bold flex-1 text-left">{cmd.command}</span>
                  <span className="mono-ui text-[7px] md:text-[8px] text-primary border border-primary px-1.5 md:px-2">ACTIVE</span>
                </button>
              ))}
            </div>

            <button className="w-full py-3 md:py-4 narvo-border border-dashed border-forest/50 mono-ui text-[9px] md:text-[10px] text-forest font-bold hover:text-primary hover:border-primary transition-all">
              + {t('accessibility.calibrate')}
            </button>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`w-full py-3 md:py-4 mono-ui text-[10px] md:text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${
              hasChanges && !saving
                ? 'bg-primary text-background-dark hover:bg-white' 
                : 'bg-forest/30 text-forest cursor-not-allowed'
            }`}
            data-testid="save-accessibility-btn"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t('system_settings.saving') : t('system_settings.save_config')}
          </button>
        </div>
      </section>
    </main>
  );
};

export default AccessibilityPage;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Rows, TextT, HandPointing, Cursor, Microphone, Info, CircleNotch, FloppyDisk } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useHapticAlert } from '../components/HapticAlerts';
import { ResponsiveTabView } from '../components/ResponsiveTabView';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const LS_KEY = 'narvo_settings_cache';

const cacheToLocal = (payload) => {
  try {
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    localStorage.setItem(LS_KEY, JSON.stringify({ ...existing, ...payload }));
  } catch { /* ignore */ }
};

const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; }
};

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
  const cached = readLocal();
  const [displayDensity, setDisplayDensity] = useState(cached?.display_density || 'standard');
  const [fontScale, setFontScale] = useState(cached?.font_scale ?? 100);
  const [gestures, setGestures] = useState({
    lateralSwipe: cached?.gestural_swipe ?? true,
    pinchZoom: cached?.gestural_pinch ?? false,
  });
  const [voiceCommandsList] = useState([
    { id: 1, command: '"NARVO, OPEN NEWSFEED"', active: true },
    { id: 2, command: '"NARVO, BRIGHTNESS UP"', active: true },
  ]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
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
    const payload = {
      display_density: displayDensity,
      font_scale: fontScale,
      gestural_swipe: gestures.lateralSwipe,
      gestural_pinch: gestures.pinchZoom,
    };
    cacheToLocal(payload);
    try {
      const res = await fetch(`${API_URL}/api/settings/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[rgb(var(--color-bg))]" data-testid="accessibility-page">
        <div className="flex items-center gap-3 font-mono text-xs text-[rgb(var(--color-text-secondary))]">
          <CircleNotch weight="bold" className="w-5 h-5 animate-spin text-[rgb(var(--color-primary))]" />
          {t('common.loading')}
        </div>
      </main>
    );
  }

  // Define tabs for ResponsiveTabView
  const tabs = [
    {
      id: 'density',
      label: t('accessibility.display_density'),
      icon: <Rows weight="bold" className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <p className="font-mono text-[10px] text-[rgb(var(--color-text-secondary))] leading-relaxed font-bold">
            ADJUST THE INFORMATION DENSITY OF THE BROADCAST GRID.
          </p>
          <div className="space-y-3">
            {densityOptions.map(option => (
              <label key={option.id} className="block cursor-pointer group">
                <input 
                  type="radio" 
                  name="density" 
                  checked={displayDensity === option.id}
                  onChange={() => handleDensityChange(option.id)}
                  className="peer sr-only" 
                />
                <div className={`p-4 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/10 transition-all relative ${
                  displayDensity === option.id ? 'bg-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]' : 'hover:border-[rgb(var(--color-text-secondary))]'
                }`}>
                  <div className={`absolute right-4 top-4 w-4 h-4 border border-[rgb(var(--color-border))] transition-all ${
                    displayDensity === option.id ? 'bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]' : ''
                  }`} />
                  <h4 className="font-display text-lg font-bold text-[rgb(var(--color-text-primary))] uppercase mb-2">{option.label}</h4>
                  <p className="font-mono text-[9px] text-[rgb(var(--color-text-secondary))] font-bold">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'font',
      label: t('accessibility.font_scaling'),
      icon: <TextT weight="bold" className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="font-mono text-[10px] text-[rgb(var(--color-text-secondary))] font-bold">SCALE_FACTOR</span>
              <span className="font-display text-2xl font-bold text-[rgb(var(--color-primary))] leading-none">{fontScale}%</span>
            </div>
            <div className="relative py-3">
              <input 
                type="range" 
                className="w-full h-1 bg-[rgb(var(--color-surface))] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[rgb(var(--color-primary))]"
                min="75" 
                max="150" 
                value={fontScale}
                onChange={(e) => handleFontScaleChange(parseInt(e.target.value))}
                data-testid="font-scale-slider"
              />
              <div className="flex justify-between mt-3 font-mono text-[9px] text-[rgb(var(--color-text-secondary))] font-bold">
                <span>75%</span>
                <span>100%</span>
                <span>150%</span>
              </div>
            </div>
          </div>

          <div className="border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/5 p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-[rgb(var(--color-border))] px-2 py-1 font-mono text-[8px] text-[rgb(var(--color-text-primary))] font-bold">
              OUTPUT_PREVIEW
            </div>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <span className="font-mono text-[9px] text-[rgb(var(--color-primary))] font-bold border-l-2 border-[rgb(var(--color-primary))] pl-2 uppercase">
                  HEADLINE // SPACE GROTESK
                </span>
                <h4 
                  className="font-display font-bold text-[rgb(var(--color-text-primary))] uppercase leading-tight"
                  style={{ fontSize: `${Math.round(24 * fontScale / 100)}px` }}
                >
                  BREAKING: GLOBAL_MARKET_NODE_4 SHIFT REPORTED.
                </h4>
              </div>
              <div className="space-y-2">
                <span className="font-mono text-[9px] text-[rgb(var(--color-text-secondary))] font-bold border-l-2 border-[rgb(var(--color-text-secondary))] pl-2 uppercase">
                  BODY // JETBRAINS MONO
                </span>
                <p 
                  className="font-mono text-[rgb(var(--color-text-secondary))] leading-relaxed"
                  style={{ fontSize: `${Math.round(11 * fontScale / 100)}px` }}
                >
                  SYSTEM ANALYSIS DETECTS 14% FLUCTUATION.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-[rgb(var(--color-border))] p-3 bg-[rgb(var(--color-primary))]/5 flex gap-3">
            <Info weight="fill" className="w-4 h-4 text-[rgb(var(--color-primary))] shrink-0" />
            <p className="font-mono text-[9px] text-[rgb(var(--color-text-secondary))] leading-relaxed font-bold">
              FONT SCALING AFFECTS ALL TERMINAL READOUTS.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'interaction',
      label: t('accessibility.ui_interaction'),
      icon: <Cursor weight="bold" className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-mono text-[10px] text-[rgb(var(--color-text-secondary))] font-bold border-b border-[rgb(var(--color-border))] pb-2">
              {t('accessibility.gestural_control')}
            </h4>

            <div className="space-y-2">
              {/* Lateral Swipe */}
              <div className="p-3 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/5 flex items-center justify-between group hover:border-[rgb(var(--color-primary))] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-primary))] transition-colors">
                    <HandPointing weight="bold" className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="font-mono text-[10px] text-[rgb(var(--color-text-primary))] font-bold">{t('accessibility.lateral_swipe')}</h5>
                    <p className="font-mono text-[9px] text-[rgb(var(--color-text-secondary))]">NAV_DATA_STREAMS</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={gestures.lateralSwipe}
                  onChange={() => toggleGesture('lateralSwipe')}
                  className="w-4 h-4 bg-transparent border border-[rgb(var(--color-border))] checked:bg-[rgb(var(--color-primary))] cursor-pointer"
                  data-testid="gesture-swipe"
                />
              </div>

              {/* Pinch Zoom */}
              <div className="p-3 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/5 flex items-center justify-between group hover:border-[rgb(var(--color-primary))] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-primary))] transition-colors">
                    <HandPointing weight="bold" className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="font-mono text-[10px] text-[rgb(var(--color-text-primary))] font-bold">{t('accessibility.pinch_zoom')}</h5>
                    <p className="font-mono text-[9px] text-[rgb(var(--color-text-secondary))]">EXPAND_MAP_DOCK</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={gestures.pinchZoom}
                  onChange={() => toggleGesture('pinchZoom')}
                  className="w-4 h-4 bg-transparent border border-[rgb(var(--color-border))] checked:bg-[rgb(var(--color-primary))] cursor-pointer"
                  data-testid="gesture-pinch"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-[rgb(var(--color-border))] pb-2">
              <h4 className="font-mono text-[10px] text-[rgb(var(--color-text-secondary))] font-bold">{t('accessibility.voice_commands')}</h4>
              <span className="font-mono text-[9px] text-[rgb(var(--color-primary))] font-bold animate-pulse">LISTENING_V2</span>
            </div>

            <div className="space-y-2">
              {voiceCommandsList.map(cmd => (
                <button 
                  key={cmd.id}
                  className="w-full p-3 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/5 flex items-center gap-3 hover:bg-[rgb(var(--color-border))]/10 transition-all group"
                >
                  <Microphone weight="fill" className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover:text-[rgb(var(--color-primary))] transition-colors" />
                  <span className="font-mono text-[10px] text-[rgb(var(--color-text-primary))] font-bold flex-1 text-left">{cmd.command}</span>
                  <span className="font-mono text-[8px] text-[rgb(var(--color-primary))] border border-[rgb(var(--color-primary))] px-1.5">ACTIVE</span>
                </button>
              ))}
            </div>

            <button className="w-full py-3 border border-dashed border-[rgb(var(--color-border))] font-mono text-[10px] text-[rgb(var(--color-text-secondary))] font-bold hover:text-[rgb(var(--color-primary))] hover:border-[rgb(var(--color-primary))] transition-all">
              + {t('accessibility.calibrate')}
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-[rgb(var(--color-bg))]" data-testid="accessibility-page">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/10 shrink-0">
        <span className="font-mono text-[10px] text-[rgb(var(--color-text-secondary))] font-bold uppercase">
          MODULE: <span className="text-[rgb(var(--color-primary))]">ACCESSIBILITY</span>
        </span>
        <button 
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`h-8 px-4 font-mono text-[10px] font-bold transition-all flex items-center gap-2 ${
            hasChanges && !saving
              ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-bg))] hover:bg-white' 
              : 'bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-dim))] cursor-not-allowed'
          }`}
          data-testid="save-accessibility-btn"
        >
          {saving ? <CircleNotch weight="bold" className="w-4 h-4 animate-spin" /> : <FloppyDisk weight="bold" className="w-4 h-4" />}
          {saving ? 'SAVING...' : 'SAVE'}
        </button>
      </div>

      {/* Content - Tabs on mobile, Columns on desktop */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        <ResponsiveTabView tabs={tabs} className="h-full" />
      </div>
    </main>
  );
};

export default AccessibilityPage;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Monitor, Bell, Pulse, Gauge, Lightning, ArrowCounterClockwise, FloppyDisk, CircleNotch, MusicNotes } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useHapticAlert } from '../components/HapticAlerts';

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
  highContrast: true,
  interfaceScale: 'DEFAULT',
  hapticSync: false,
  alertVolume: 65,
  dataLimit: 2400,
  bandwidthPriority: 'STREAMING',
  aggregatorMediastack: true,
  aggregatorNewsdata: true,
  soundTheme: 'narvo_classic',
};

const SoundThemesSection = ({ settings, updateSetting }) => {
  const [themes, setThemes] = useState([]);
  useEffect(() => {
    fetch(`${API_URL}/api/sound-themes`)
      .then(r => r.json())
      .then(setThemes)
      .catch(() => {});
  }, []);

  if (!themes.length) return null;

  return (
    <section className="space-y-6 md:space-y-8" data-testid="sound-themes-section">
      <div className="flex items-end justify-between narvo-border-b border-forest/30 pb-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-content uppercase tracking-tight">
          BROADCAST_THEMES
        </h2>
        <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-[0.2em] hidden sm:block">
          AUDIO_BRANDING_ENGINE
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {themes.map(theme => {
          const isActive = (settings.soundTheme || 'narvo_classic') === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => updateSetting('soundTheme', theme.id)}
              className={`narvo-border p-4 md:p-5 text-left transition-all relative ${
                isActive ? 'bg-primary text-background-dark border-primary' : 'hover:bg-surface/10 hover:border-forest'
              }`}
              data-testid={`theme-${theme.id}`}
            >
              {isActive && (
                <span className="absolute top-2 right-2 text-[7px] font-bold px-1.5 py-0.5 bg-background-dark text-primary mono-ui">
                  ACTIVE
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <MusicNotes className="w-4 h-4" weight="bold" />
                <span className="mono-ui text-[11px] md:text-[12px] font-bold">{theme.name.toUpperCase()}</span>
              </div>
              <p className={`mono-ui text-[8px] md:text-[9px] leading-relaxed ${isActive ? 'text-background-dark/70' : 'text-forest'}`}>
                {theme.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};

const SystemGearSixPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showAlert } = useHapticAlert();
  const [settings, setGearSix] = useState(() => {
    const cached = readLocal();
    if (cached) {
      return {
        highContrast: cached.high_contrast ?? DEFAULT_SETTINGS.highContrast,
        interfaceScale: (cached.interface_scale || 'DEFAULT').toUpperCase().replace('%', '').replace('100', 'DEFAULT'),
        hapticSync: cached.haptic_sync ?? DEFAULT_SETTINGS.hapticSync,
        alertVolume: cached.alert_volume ?? DEFAULT_SETTINGS.alertVolume,
        dataLimit: Math.round((cached.data_limit ?? 2.4) * 1000),
        bandwidthPriority: (cached.bandwidth_priority || 'streaming').toUpperCase(),
        aggregatorMediastack: cached.aggregator_mediastack ?? DEFAULT_SETTINGS.aggregatorMediastack,
        aggregatorNewsdata: cached.aggregator_newsdata ?? DEFAULT_SETTINGS.aggregatorNewsdata,
      };
    }
    return DEFAULT_SETTINGS;
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingGearSix, setLoadingGearSix] = useState(true);

  useEffect(() => {
    const fetchGearSix = async () => {
      const userId = user?.id || 'guest';
      try {
        const res = await fetch(`${API_URL}/api/settings/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setGearSix({
            highContrast: data.high_contrast ?? DEFAULT_SETTINGS.highContrast,
            interfaceScale: (data.interface_scale || 'DEFAULT').toUpperCase().replace('%', '').replace('100', 'DEFAULT'),
            hapticSync: data.haptic_sync ?? DEFAULT_SETTINGS.hapticSync,
            alertVolume: data.alert_volume ?? DEFAULT_SETTINGS.alertVolume,
            dataLimit: Math.round((data.data_limit ?? 2.4) * 1000),
            bandwidthPriority: (data.bandwidth_priority || 'streaming').toUpperCase(),
            aggregatorMediastack: data.aggregator_mediastack ?? DEFAULT_SETTINGS.aggregatorMediastack,
            aggregatorNewsdata: data.aggregator_newsdata ?? DEFAULT_SETTINGS.aggregatorNewsdata,
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
      setLoadingGearSix(false);
    };
    fetchGearSix();
  }, [user?.id]);

  // Auto-save with debounce
  const autoSaveTimeoutRef = React.useRef(null);
  
  const saveSettings = React.useCallback(async (settingsToSave) => {
    const userId = user?.id || 'guest';
    const payload = {
      high_contrast: settingsToSave.highContrast,
      interface_scale: settingsToSave.interfaceScale === 'DEFAULT' ? '100%' : settingsToSave.interfaceScale.toLowerCase(),
      haptic_sync: settingsToSave.hapticSync,
      alert_volume: settingsToSave.alertVolume,
      data_limit: settingsToSave.dataLimit / 1000,
      bandwidth_priority: settingsToSave.bandwidthPriority.toLowerCase(),
      aggregator_mediastack: settingsToSave.aggregatorMediastack,
      aggregator_newsdata: settingsToSave.aggregatorNewsdata,
      sound_theme: settingsToSave.soundTheme || 'narvo_classic',
    };
    cacheToLocal(payload);
    try {
      const res = await fetch(`${API_URL}/api/settings/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return true;
      }
    } catch (err) {
      console.error('[Settings] Auto-save failed:', err);
    }
    return false;
  }, [user?.id]);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setGearSix(newSettings);
    setHasChanges(true);
    
    // Auto-save with 1 second debounce
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      const success = await saveSettings(newSettings);
      if (success) {
        setHasChanges(false);
      }
      setSaving(false);
    }, 1000);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    setSaving(true);
    const success = await saveSettings(settings);
    if (success) {
      setHasChanges(false);
      showAlert({ type: 'success', title: t('alerts.settings_saved'), message: t('alerts.settings_saved_msg'), code: 'SAVE_OK' });
    } else {
      showAlert({ type: 'error', title: 'SAVE_FAILED', message: 'Could not save settings.', code: 'ERR_SAVE' });
    }
    setSaving(false);
  };

  const handleReset = () => {
    setGearSix(DEFAULT_SETTINGS);
    setHasChanges(true);
    showAlert({ type: 'sync', title: t('alerts.settings_reset'), message: t('alerts.settings_reset_msg'), code: 'RESET_OK' });
  };

  if (loadingGearSix) {
    return (
      <main className="flex-1 overflow-y-auto custom-scroll flex items-center justify-center bg-background-dark" data-testid="system-settings-page">
        <div className="flex items-center gap-3 mono-ui text-xs text-forest">
          <CircleNotch className="w-5 h-5 animate-spin text-primary" />
          {t('system_settings.loading')}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll flex flex-col items-center bg-background-dark min-h-0" data-testid="system-settings-page">
      <div className="w-full max-w-4xl p-4 md:p-10 space-y-12 md:space-y-16 pb-32">
        {/* 01: Display & Interface */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-end justify-between narvo-border-b border-forest/30 pb-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-content uppercase tracking-tight">
              {t('system_settings.display_entity')}
            </h2>
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-[0.2em] hidden sm:block">
              VISUAL_OUTPUT_LAYER
            </span>
          </div>

          <div className="narvo-border divide-y divide-forest/30">
            {/* High Contrast Mode */}
            <div className="p-4 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-surface/5 transition-colors group">
              <div className="flex items-center gap-3 md:gap-6">
                <div className="w-8 h-8 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary shrink-0">
                  <Sun className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h3 className="mono-ui text-[10px] md:text-[12px] text-content font-bold">{t('system_settings.high_contrast')}</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold break-words">{t('system_settings.high_contrast_desc')}</p>
                </div>
              </div>
              <button 
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className={`w-12 h-6 md:w-14 md:h-7 narvo-border transition-all relative shrink-0 self-end sm:self-auto ${
                  settings.highContrast ? 'bg-primary' : 'bg-surface/30'
                }`}
                data-testid="toggle-high-contrast"
              >
                <div className={`absolute top-0.5 w-5 h-5 md:w-6 md:h-6 bg-white transition-all ${
                  settings.highContrast ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Interface Scaling */}
            <div className="p-4 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface/5 transition-colors group">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary">
                  <Monitor className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="mono-ui text-[11px] md:text-[12px] text-content font-bold">{t('system_settings.interface_scaling')}</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">{t('system_settings.interface_scaling_desc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4 font-mono text-[10px] md:text-[11px] font-bold text-primary">
                <span>100%</span>
                <select 
                  value={settings.interfaceScale}
                  onChange={(e) => updateSetting('interfaceScale', e.target.value)}
                  className="appearance-none bg-surface/20 narvo-border px-3 md:px-4 py-2 pr-8 md:pr-10 mono-ui text-[9px] md:text-[10px] text-content focus:outline-none focus:border-primary transition-all cursor-pointer"
                  data-testid="select-interface-scale"
                >
                  <option value="COMPACT">COMPACT</option>
                  <option value="DEFAULT">DEFAULT</option>
                  <option value="COMFORTABLE">COMFORTABLE</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Aggregator Sources */}
        <section className="space-y-6 md:space-y-8" data-testid="aggregator-preferences">
          <div className="flex items-end justify-between narvo-border-b border-forest/30 pb-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-content uppercase tracking-tight">
              NEWS_AGGREGATORS
            </h2>
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-[0.2em] hidden sm:block">
              PROGRAMMATIC_FEED_SOURCES
            </span>
          </div>

          <div className="narvo-border divide-y divide-forest/30">
            {[
              { key: 'aggregatorMediastack', label: 'MEDIASTACK', desc: 'GLOBAL_NEWS_API — AFRICAN_MARKET_FOCUS', badge: 'LIVE' },
              { key: 'aggregatorNewsdata', label: 'NEWSDATA.IO', desc: 'NIGERIAN_NEWS_API — LOCAL_SOURCE_PRIORITY', badge: 'LIVE' },
            ].map(agg => (
              <div key={agg.key} className="p-4 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-surface/5 transition-colors">
                <div className="flex items-center gap-3 md:gap-6">
                  <div className="w-8 h-8 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary shrink-0">
                    <Lightning weight={settings[agg.key] ? 'fill' : 'regular'} className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="mono-ui text-[10px] md:text-[12px] text-content font-bold">{agg.label}</h3>
                      <span className={`mono-ui text-[7px] font-bold px-1.5 py-0.5 ${
                        settings[agg.key] ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface/20 text-forest/50 border border-forest/20'
                      }`}>{settings[agg.key] ? agg.badge : 'OFF'}</span>
                    </div>
                    <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold break-words">{agg.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting(agg.key, !settings[agg.key])}
                  className={`w-12 h-6 narvo-border relative transition-all shrink-0 self-end sm:self-auto ${
                    settings[agg.key] ? 'bg-primary' : 'bg-surface/20'
                  }`}
                  data-testid={`toggle-${agg.key}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-background-dark transition-all ${
                    settings[agg.key] ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Broadcast Sound Themes */}
        <SoundThemesSection settings={settings} updateSetting={updateSetting} />

        {/* 03: Notification Engine */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-end justify-between narvo-border-b border-forest/30 pb-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-content uppercase tracking-tight">
              {t('system_settings.notification_syntax')}
            </h2>
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-[0.2em] hidden sm:block">
              ALERT_SYSTEM_MANAGEMENT
            </span>
          </div>

          <div className="narvo-border divide-y divide-forest/30">
            {/* Haptic Sync */}
            <div className="p-4 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-surface/5 transition-colors group">
              <div className="flex items-center gap-3 md:gap-6">
                <div className="w-8 h-8 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary shrink-0">
                  <Pulse className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h3 className="mono-ui text-[10px] md:text-[12px] text-content font-bold">{t('system_settings.haptic_sync')}</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold break-words">{t('system_settings.haptic_sync_desc')}</p>
                </div>
              </div>
              <button 
                onClick={() => updateSetting('hapticSync', !settings.hapticSync)}
                className={`w-12 h-6 md:w-14 md:h-7 narvo-border transition-all relative shrink-0 self-end sm:self-auto ${
                  settings.hapticSync ? 'bg-primary' : 'bg-surface/30'
                }`}
                data-testid="toggle-haptic"
              >
                <div className={`absolute top-0.5 w-5 h-5 md:w-6 md:h-6 bg-white transition-all ${
                  settings.hapticSync ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Alert Volume Slider */}
            <div className="p-4 md:p-8 flex flex-col gap-4 md:gap-6 hover:bg-surface/5 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary">
                    <Bell className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="mono-ui text-[11px] md:text-[12px] text-content font-bold">{t('system_settings.alert_amplitude')}</h3>
                    <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">{t('system_settings.alert_amplitude_desc')}</p>
                  </div>
                </div>
                <span className="mono-ui text-[10px] md:text-[11px] text-primary font-bold border border-primary px-2 py-1">
                  {settings.alertVolume}%
                </span>
              </div>
              <div className="pl-0 md:pl-[72px]">
                <input 
                  type="range" 
                  className="w-full h-1 bg-forest/30 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary"
                  min="0" 
                  max="100" 
                  value={settings.alertVolume}
                  onChange={(e) => updateSetting('alertVolume', parseInt(e.target.value))}
                  data-testid="slider-alert-volume"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 04: Data & Throughput */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-end justify-between narvo-border-b border-forest/30 pb-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-content uppercase tracking-tight">
              {t('system_settings.data_throughput')}
            </h2>
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-[0.2em] hidden sm:block">
              BANDWIDTH_SYNC_CONTROL
            </span>
          </div>

          <div className="narvo-border divide-y divide-forest/30">
            {/* Data Limit Slider */}
            <div className="p-4 md:p-8 flex flex-col gap-4 md:gap-6 hover:bg-surface/5 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary">
                    <Gauge className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="mono-ui text-[11px] md:text-[12px] text-content font-bold">{t('system_settings.data_limit')}</h3>
                    <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">{t('system_settings.data_limit_desc')}</p>
                  </div>
                </div>
                <span className="mono-ui text-[10px] md:text-[11px] text-primary font-bold border border-primary px-2 py-1">
                  {(settings.dataLimit / 1000).toFixed(1)} TB
                </span>
              </div>
              <div className="pl-0 md:pl-[72px] flex items-center gap-3 md:gap-4">
                <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">0</span>
                <input 
                  type="range" 
                  className="flex-1 h-1 bg-forest/30 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary"
                  min="0" 
                  max="5000" 
                  value={settings.dataLimit}
                  onChange={(e) => updateSetting('dataLimit', parseInt(e.target.value))}
                  data-testid="slider-data-limit"
                />
                <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">5TB</span>
              </div>
            </div>

            {/* Bandwidth Priority */}
            <div className="p-4 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface/5 transition-colors group">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary">
                  <Lightning className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="mono-ui text-[11px] md:text-[12px] text-content font-bold">{t('system_settings.bandwidth_priority')}</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">{t('system_settings.bandwidth_priority_desc')}</p>
                </div>
              </div>
              <div className="flex narvo-border divide-x divide-forest/50">
                {['STREAMING', 'INGEST', 'VOICE'].map(option => (
                  <button
                    key={option}
                    onClick={() => updateSetting('bandwidthPriority', option)}
                    className={`px-3 md:px-4 py-2 mono-ui text-[9px] md:text-[10px] font-bold transition-all ${
                      settings.bandwidthPriority === option 
                        ? 'bg-primary text-background-dark' 
                        : 'text-forest hover:text-content hover:bg-surface/10'
                    }`}
                    data-testid={`bandwidth-${option.toLowerCase()}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 md:gap-6 pt-8 md:pt-12">
          <button 
            onClick={handleReset}
            className="px-6 md:px-10 py-3 md:py-4 mono-ui text-[10px] md:text-[11px] font-bold text-forest narvo-border hover:bg-forest/10 transition-all flex items-center justify-center gap-2"
            data-testid="reset-defaults-btn"
          >
            <ArrowCounterClockwise className="w-4 h-4" />
            {t('system_settings.reset_defaults')}
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className={`px-6 md:px-10 py-3 md:py-4 mono-ui text-[10px] md:text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${
              hasChanges && !saving
                ? 'bg-primary text-background-dark hover:bg-white' 
                : saving
                ? 'bg-forest/50 text-forest cursor-wait'
                : 'bg-forest/30 text-forest'
            }`}
            data-testid="save-config-btn"
          >
            {saving ? <CircleNotch className="w-4 h-4 animate-spin" /> : <FloppyDisk className="w-4 h-4" />}
            {saving ? 'AUTO_SAVING...' : hasChanges ? t('system_settings.save_config') : 'SAVED'}
          </button>
          <span className="mono-ui text-[8px] text-forest/60 mt-2">AUTO_SAVE_ENABLED</span>
        </div>
      </div>
    </main>
  );
};

export default SystemGearSixPage;

import React, { useState } from 'react';
import { Sun, Monitor, Bell, Vibrate, Gauge, Zap, RotateCcw, Save } from 'lucide-react';

const SystemSettingsPage = () => {
  const [settings, setSettings] = useState({
    highContrast: true,
    interfaceScale: 'DEFAULT',
    hapticSync: false,
    alertVolume: 65,
    dataLimit: 2400,
    bandwidthPriority: 'STREAMING',
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save to localStorage for persistence
    localStorage.setItem('narvo_system_settings', JSON.stringify(settings));
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings({
      highContrast: true,
      interfaceScale: 'DEFAULT',
      hapticSync: false,
      alertVolume: 65,
      dataLimit: 2400,
      bandwidthPriority: 'STREAMING',
    });
    setHasChanges(true);
  };

  return (
    <main className="flex-1 overflow-y-auto custom-scroll flex flex-col items-center bg-background-dark" data-testid="system-settings-page">
      <div className="w-full max-w-4xl p-4 md:p-10 space-y-12 md:space-y-16 pb-32">
        {/* 01: Display & Interface */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-end justify-between narvo-border-b border-forest/30 pb-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
              DISPLAY_ENTITY
            </h2>
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-[0.2em] hidden sm:block">
              VISUAL_OUTPUT_LAYER
            </span>
          </div>

          <div className="narvo-border divide-y divide-forest/30">
            {/* High Contrast Mode */}
            <div className="p-4 md:p-8 flex items-center justify-between hover:bg-surface/5 transition-colors group">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary">
                  <Sun className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="mono-ui text-[11px] md:text-[12px] text-white font-bold">High_Contrast_Mode</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">OPTIMIZE_FOR_STUDIO_ENVIRONMENTS</p>
                </div>
              </div>
              <button 
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className={`w-12 h-6 md:w-14 md:h-7 narvo-border transition-all relative ${
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
                  <h3 className="mono-ui text-[11px] md:text-[12px] text-white font-bold">Interface_Scaling</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">ADJUST_UI_ELEMENT_DENSITY</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4 font-mono text-[10px] md:text-[11px] font-bold text-primary">
                <span>100%</span>
                <select 
                  value={settings.interfaceScale}
                  onChange={(e) => updateSetting('interfaceScale', e.target.value)}
                  className="appearance-none bg-surface/20 narvo-border px-3 md:px-4 py-2 pr-8 md:pr-10 mono-ui text-[9px] md:text-[10px] text-white focus:outline-none focus:border-primary transition-all cursor-pointer"
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

        {/* 02: Notification Engine */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-end justify-between narvo-border-b border-forest/30 pb-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
              NOTIFICATION_SYNTAX
            </h2>
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-[0.2em] hidden sm:block">
              ALERT_SYSTEM_MANAGEMENT
            </span>
          </div>

          <div className="narvo-border divide-y divide-forest/30">
            {/* Haptic Sync */}
            <div className="p-4 md:p-8 flex items-center justify-between hover:bg-surface/5 transition-colors group">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary">
                  <Vibrate className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="mono-ui text-[11px] md:text-[12px] text-white font-bold">Haptic_Sync</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">PHYSICAL_RESPONSE_ON_CRITICAL_ALERTS</p>
                </div>
              </div>
              <button 
                onClick={() => updateSetting('hapticSync', !settings.hapticSync)}
                className={`w-12 h-6 md:w-14 md:h-7 narvo-border transition-all relative ${
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
                    <h3 className="mono-ui text-[11px] md:text-[12px] text-white font-bold">Alert_Amplitude</h3>
                    <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">SYSTEM_WIDE_AUDIO_VOLUME</p>
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

        {/* 03: Data & Throughput */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-end justify-between narvo-border-b border-forest/30 pb-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
              DATA_THROUGHPUT
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
                    <h3 className="mono-ui text-[11px] md:text-[12px] text-white font-bold">Data_Limit_Threshold</h3>
                    <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">MONTHLY_QUOTA_FOR_BONDED_UPLINK</p>
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
                  <Zap className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="mono-ui text-[11px] md:text-[12px] text-white font-bold">Bandwidth_Priority</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">RESOURCE_ALLOCATION_FOR_LIVE_SIGNALS</p>
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
                        : 'text-forest hover:text-white hover:bg-surface/10'
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
            <RotateCcw className="w-4 h-4" />
            RESET_DEFAULTS
          </button>
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-6 md:px-10 py-3 md:py-4 mono-ui text-[10px] md:text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${
              hasChanges 
                ? 'bg-primary text-background-dark hover:bg-white' 
                : 'bg-forest/30 text-forest cursor-not-allowed'
            }`}
            data-testid="save-config-btn"
          >
            <Save className="w-4 h-4" />
            SAVE_SYSTEM_CONFIG
          </button>
        </div>
      </div>
    </main>
  );
};

export default SystemSettingsPage;

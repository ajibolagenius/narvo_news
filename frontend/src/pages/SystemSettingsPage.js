import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Monitor, Bell, Pulse, Gauge, Lightning, ArrowCounterClockwise, FloppyDisk, CircleNotch, BellRinging, BellSlash, Translate } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { useHapticAlert } from '../components/HapticAlerts';
import { requestNotificationPermission, getNotificationStatus, subscribeToPush, unsubscribeFromPush, getSubscription, isPushSupported } from '../lib/notificationService';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Supported broadcast languages with authentic native names
const BROADCAST_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', description: 'INTERNATIONAL' },
  { code: 'pcm', name: 'Naijá', native: 'Naijá Tok', description: 'PIDGIN_NAIJA' },
  { code: 'yo', name: 'Yorùbá', native: 'Èdè Yorùbá', description: 'ÌLÚ_YORÙBÁ' },
  { code: 'ha', name: 'Hausa', native: 'Harshen Hausa', description: 'AREWACIN_NAJERIYA' },
  { code: 'ig', name: 'Igbo', native: 'Asụsụ Igbo', description: 'ALA_IGBO' },
];

const DEFAULT_SETTINGS = {
  highContrast: true,
  interfaceScale: 'DEFAULT',
  hapticSync: false,
  alertVolume: 65,
  dataLimit: 2400,
  bandwidthPriority: 'STREAMING',
  pushNotifications: false,
  broadcastLanguage: 'en',
};

const SystemGearSixPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { setBroadcastLanguage, refreshLanguagePreference } = useAudio();
  const { showAlert } = useHapticAlert();
  const [settings, setGearSix] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingGearSix, setLoadingGearSix] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Check notification status on mount
  useEffect(() => {
    const checkNotifications = async () => {
      setNotificationStatus(getNotificationStatus());
      if (isPushSupported()) {
        const sub = await getSubscription();
        setIsSubscribed(!!sub);
      }
    };
    checkNotifications();
  }, []);

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
            broadcastLanguage: data.broadcast_language ?? DEFAULT_SETTINGS.broadcastLanguage,
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
      setLoadingGearSix(false);
    };
    fetchGearSix();
  }, [user?.id]);

  const updateSetting = (key, value) => {
    setGearSix(prev => ({ ...prev, [key]: value }));
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
          high_contrast: settings.highContrast,
          interface_scale: settings.interfaceScale === 'DEFAULT' ? '100%' : settings.interfaceScale.toLowerCase(),
          haptic_sync: settings.hapticSync,
          alert_volume: settings.alertVolume,
          data_limit: settings.dataLimit / 1000,
          bandwidth_priority: settings.bandwidthPriority.toLowerCase(),
          broadcast_language: settings.broadcastLanguage,
        }),
      });
      if (res.ok) {
        setHasChanges(false);
        // Update AudioContext with new language preference
        setBroadcastLanguage(settings.broadcastLanguage);
        showAlert({ type: 'success', title: t('alerts.settings_saved'), message: t('alerts.settings_saved_msg'), code: 'SAVE_OK' });
      }
    } catch (err) {
      showAlert({ type: 'error', title: 'SAVE_FAILED', message: 'Could not save settings.', code: 'ERR_SAVE' });
    }
    setSaving(false);
  };

  const handleToggleNotifications = async () => {
    if (!isPushSupported()) {
      showAlert({ type: 'warning', title: 'NOT_SUPPORTED', message: 'Push notifications are not supported in this browser.', code: 'PUSH_NS' });
      return;
    }
    
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
        showAlert({ type: 'sync', title: 'NOTIFICATIONS_OFF', message: 'Breaking news notifications disabled.', code: 'PUSH_OFF' });
      } else {
        const permission = await requestNotificationPermission();
        if (permission) {
          await subscribeToPush();
          setIsSubscribed(true);
          showAlert({ type: 'success', title: 'NOTIFICATIONS_ON', message: 'You will receive breaking news alerts.', code: 'PUSH_ON' });
        } else {
          showAlert({ type: 'error', title: 'PERMISSION_DENIED', message: 'Please enable notifications in browser settings.', code: 'PUSH_DENY' });
        }
      }
      setNotificationStatus(getNotificationStatus());
    } catch (err) {
      showAlert({ type: 'error', title: 'NOTIFICATION_ERROR', message: err.message, code: 'PUSH_ERR' });
    }
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
    <main className="flex-1 overflow-y-auto custom-scroll flex flex-col items-center bg-background-dark min-h-0" data-testid="system-settings-page">
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
            <div className="p-4 md:p-8 flex items-center justify-between hover:bg-surface/5 transition-colors group">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary">
                  <Sun className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="mono-ui text-[11px] md:text-[12px] text-content font-bold">{t('system_settings.high_contrast')}</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">{t('system_settings.high_contrast_desc')}</p>
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

        {/* 02: Broadcast Language */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-end justify-between narvo-border-b border-forest/30 pb-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-content uppercase tracking-tight">
              BROADCAST_LANGUAGE
            </h2>
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-[0.2em] hidden sm:block">
              AUDIO_TRANSLATION_ENGINE
            </span>
          </div>

          <div className="narvo-border divide-y divide-forest/30">
            {/* Language Selection */}
            <div className="p-4 md:p-8 flex flex-col gap-4 md:gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary">
                  <Translate className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="mono-ui text-[11px] md:text-[12px] text-content font-bold">NEWS_TRANSLATION</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">SELECT_YOUR_PREFERRED_BROADCAST_LANGUAGE</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pl-0 md:pl-[72px]">
                {BROADCAST_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => updateSetting('broadcastLanguage', lang.code)}
                    className={`p-3 md:p-4 narvo-border text-left transition-all ${
                      settings.broadcastLanguage === lang.code 
                        ? 'bg-primary text-background-dark border-primary' 
                        : 'hover:bg-surface/10 hover:border-forest'
                    }`}
                    data-testid={`lang-${lang.code}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono-ui text-[10px] md:text-[11px] font-bold">{lang.name}</span>
                      {settings.broadcastLanguage === lang.code && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 bg-background-dark text-primary">ACTIVE</span>
                      )}
                    </div>
                    <span className={`mono-ui text-[9px] md:text-[10px] ${
                      settings.broadcastLanguage === lang.code ? 'text-background-dark/70' : 'text-forest'
                    }`}>
                      {lang.native}
                    </span>
                    <div className={`mt-1 mono-ui text-[7px] md:text-[8px] ${
                      settings.broadcastLanguage === lang.code ? 'text-background-dark/50' : 'text-forest/60'
                    }`}>
                      {lang.description}
                    </div>
                  </button>
                ))}
              </div>
              
              <p className="pl-0 md:pl-[72px] mono-ui text-[8px] md:text-[9px] text-forest/70">
                NEWS_WILL_BE_TRANSLATED_AND_NARRATED_IN_SELECTED_LANGUAGE
              </p>
            </div>
          </div>
        </section>

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
            {/* Push Notifications for Breaking News */}
            <div className="p-4 md:p-8 flex items-center justify-between hover:bg-surface/5 transition-colors group">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary">
                  {isSubscribed ? <BellRinging className="w-5 h-5 md:w-6 md:h-6" /> : <BellSlash className="w-5 h-5 md:w-6 md:h-6" />}
                </div>
                <div className="space-y-1">
                  <h3 className="mono-ui text-[11px] md:text-[12px] text-content font-bold">BREAKING_NEWS_ALERTS</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">
                    {notificationStatus === 'denied' 
                      ? 'PERMISSION_BLOCKED_IN_BROWSER' 
                      : 'RECEIVE_PUSH_NOTIFICATIONS_FOR_URGENT_NEWS'
                    }
                  </p>
                  {!isPushSupported() && (
                    <p className="mono-ui text-[7px] text-red-400">NOT_SUPPORTED_IN_THIS_BROWSER</p>
                  )}
                </div>
              </div>
              <button 
                onClick={handleToggleNotifications}
                disabled={notificationStatus === 'denied' || !isPushSupported()}
                className={`w-12 h-6 md:w-14 md:h-7 narvo-border transition-all relative ${
                  isSubscribed ? 'bg-primary' : 'bg-surface/30'
                } ${(notificationStatus === 'denied' || !isPushSupported()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-testid="toggle-push-notifications"
              >
                <div className={`absolute top-0.5 w-5 h-5 md:w-6 md:h-6 bg-white transition-all ${
                  isSubscribed ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>
            
            {/* Haptic Sync */}
            <div className="p-4 md:p-8 flex items-center justify-between hover:bg-surface/5 transition-colors group">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 narvo-border flex items-center justify-center text-primary">
                  <Pulse className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="mono-ui text-[11px] md:text-[12px] text-content font-bold">{t('system_settings.haptic_sync')}</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">{t('system_settings.haptic_sync_desc')}</p>
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
            disabled={!hasChanges || saving}
            className={`px-6 md:px-10 py-3 md:py-4 mono-ui text-[10px] md:text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${
              hasChanges && !saving
                ? 'bg-primary text-background-dark hover:bg-white' 
                : 'bg-forest/30 text-forest cursor-not-allowed'
            }`}
            data-testid="save-config-btn"
          >
            {saving ? <CircleNotch className="w-4 h-4 animate-spin" /> : <FloppyDisk className="w-4 h-4" />}
            {saving ? t('system_settings.saving') : t('system_settings.save_config')}
          </button>
        </div>
      </div>
    </main>
  );
};

export default SystemGearSixPage;

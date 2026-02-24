import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useHapticAlert } from '../components/HapticAlerts';
import { SignOut, User, Microphone, Monitor, Wheelchair, CaretRight, ShieldCheck, Lightning, Database, Clock, Bell, Globe, Sun, Moon } from '@phosphor-icons/react';
import { LANGUAGES } from '../i18n';
import { NotificationToggle } from '../components/BreakingNews';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showAlert } = useHapticAlert();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {}
    localStorage.removeItem('narvo_user');
    localStorage.removeItem('narvo_preferences');
    navigate('/');
  };

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const settingsSections = [
    {
      title: t('settings.profile_management'),
      items: [
        { 
          icon: User, 
          label: t('settings.account'), 
          desc: 'SUBSCRIPTION_PLAN // METRICS // REGION', 
          path: '/account',
          status: 'PREMIUM_ACTIVE'
        },
        { 
          icon: Microphone, 
          label: t('settings.voice_studio'), 
          desc: 'BROADCAST_VOICE_MODEL // DIALECT_CONFIG', 
          path: '/voices',
          status: 'NOVA_SELECTED'
        },
      ]
    },
    {
      title: t('settings.system_configuration'),
      items: [
        { 
          icon: Monitor, 
          label: t('settings.system_settings'), 
          desc: 'DISPLAY // NOTIFICATIONS // THROUGHPUT', 
          path: '/system',
          status: 'CONFIGURED'
        },
        { 
          icon: Wheelchair, 
          label: t('settings.accessibility'), 
          desc: 'DENSITY // FONTS // GESTURES // VOICE_CMD', 
          path: '/accessibility',
          status: 'OPTIMIZED'
        },
      ]
    }
  ];

  const systemStats = [
    { icon: ShieldCheck, label: 'ENCRYPTION', value: 'AES-256-GCM' },
    { icon: Lightning, label: 'AUTH_PROVIDER', value: 'SUPABASE' },
    { icon: Database, label: 'STORAGE_USED', value: '2.4 GB' },
    { icon: Clock, label: 'SESSION_TIME', value: '04:32:18' },
  ];

  return (
    <main className="flex-1 overflow-y-auto custom-scroll bg-background-dark" data-testid="settings-page">
      {/* Header */}
      <div className="p-6 md:p-10 narvo-border-b">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 bg-primary animate-pulse" />
          <span className="mono-ui text-[9px] md:text-[10px] text-primary font-bold">CONTROL_CENTER_ACTIVE</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-content uppercase tracking-tight">
          {t('settings.title')}
        </h1>
        <p className="mono-ui text-[10px] md:text-[11px] text-forest mt-2">
          CONFIGURE_BROADCAST_PARAMETERS // MANAGE_SYSTEM_PROTOCOLS
        </p>
      </div>

      <div className="p-4 md:p-10">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          
          {/* User Profile Card */}
          {user && (
            <div className="narvo-border bg-surface/10 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl" />
              <div className="relative z-10">
                <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-[0.2em] block mb-4">
                  AUTHENTICATED_OPERATOR
                </span>
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 narvo-border bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="font-display text-primary text-2xl md:text-3xl font-bold">
                      {user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-content block font-display font-bold text-lg md:text-xl truncate">
                      {user.email}
                    </span>
                    <span className="mono-ui text-[9px] md:text-[10px] text-forest block mt-1">
                      OPERATOR_ID: {user.id?.slice(0, 20)}...
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-primary/20 text-primary mono-ui text-[8px] font-bold">
                        PREMIUM
                      </span>
                      <span className="px-2 py-0.5 bg-forest/20 text-forest mono-ui text-[8px] font-bold">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <div className="space-y-4">
            <h2 className="mono-ui text-[10px] md:text-[11px] text-forest font-bold tracking-[0.2em] border-b border-forest/30 pb-2">
              APPEARANCE_MODE
            </h2>
            <div className="narvo-border bg-surface/5 p-5 md:p-6">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 narvo-border bg-background-dark flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Moon weight="fill" className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  ) : (
                    <Sun weight="fill" className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg md:text-xl font-bold text-content uppercase">THEME_MODE</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest">SWITCH BETWEEN DARK AND LIGHT INTERFACE</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-4 py-3 narvo-border bg-surface/10 hover:bg-primary/10 hover:border-primary transition-all"
                  data-testid="settings-theme-toggle"
                >
                  <span className="mono-ui text-[10px] text-primary font-bold">{theme === 'dark' ? 'DARK' : 'LIGHT'}</span>
                  <div className="w-12 h-6 bg-background-dark narvo-border relative">
                    <div 
                      className={`absolute top-1 w-4 h-4 bg-primary transition-all ${theme === 'dark' ? 'left-1' : 'left-6'}`}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-4">
            <h2 className="mono-ui text-[10px] md:text-[11px] text-forest font-bold tracking-[0.2em] border-b border-forest/30 pb-2">
              BROADCAST_LANGUAGE
            </h2>
            <div className="narvo-border bg-surface/5 p-5 md:p-6">
              <div className="flex items-center gap-4 md:gap-6 mb-5">
                <div className="w-10 h-10 md:w-12 md:h-12 narvo-border bg-background-dark flex items-center justify-center">
                  <Globe className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg md:text-xl font-bold text-content uppercase">{t('settings.language')}</h3>
                  <p className="mono-ui text-[8px] md:text-[9px] text-forest">{t('settings.language_desc')}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="mono-ui text-[8px] text-forest">ACTIVE:</span>
                  <span className="mono-ui text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 narvo-border">{currentLang.label}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      showAlert({ type: 'sync', title: 'LANGUAGE_CHANGED', message: `Interface set to ${lang.label}`, code: 'LANG_OK', duration: 3000 });
                    }}
                    className={`p-3 narvo-border text-center transition-all ${
                      i18n.language === lang.code
                        ? 'bg-primary/10 border-primary'
                        : 'bg-surface/10 hover:border-forest hover:bg-surface/20'
                    }`}
                    data-testid={`lang-${lang.code}`}
                  >
                    <span className="block font-display text-sm font-bold text-content mb-1">{lang.label}</span>
                    <span className="mono-ui text-[7px] text-forest font-bold">{lang.region}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h2 className="mono-ui text-[10px] md:text-[11px] text-forest font-bold tracking-[0.2em] border-b border-forest/30 pb-2">
              PUSH_NOTIFICATIONS
            </h2>
            <NotificationToggle />
          </div>

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-4">
              <h2 className="mono-ui text-[10px] md:text-[11px] text-forest font-bold tracking-[0.2em] border-b border-forest/30 pb-2">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => navigate(item.path)}
                      className="narvo-border bg-surface/5 p-5 md:p-6 text-left group hover:bg-primary/5 hover:border-primary transition-all"
                      data-testid={`settings-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 narvo-border bg-background-dark flex items-center justify-center group-hover:border-primary transition-colors">
                          <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <CaretRight weight="bold" className="w-5 h-5 text-forest group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-display text-lg md:text-xl font-bold text-content uppercase mb-1 group-hover:text-primary transition-colors">
                        {item.label}
                      </h3>
                      <p className="mono-ui text-[8px] md:text-[9px] text-forest leading-relaxed">
                        {item.desc}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span className="mono-ui text-[7px] md:text-[8px] text-primary font-bold">
                          {item.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* System Stats */}
          <div className="space-y-4">
            <h2 className="mono-ui text-[10px] md:text-[11px] text-forest font-bold tracking-[0.2em] border-b border-forest/30 pb-2">
              SYSTEM_DIAGNOSTICS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {systemStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="narvo-border bg-surface/5 p-4 md:p-5">
                    <Icon className="w-4 h-4 text-forest mb-3" />
                    <span className="mono-ui text-[7px] md:text-[8px] text-forest block mb-1">
                      {stat.label}
                    </span>
                    <span className="mono-ui text-[11px] md:text-xs text-primary font-bold">
                      {stat.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Haptic Alert Demo */}
          <div className="space-y-4">
            <h2 className="mono-ui text-[10px] md:text-[11px] text-forest font-bold tracking-[0.2em] border-b border-forest/30 pb-2">
              NOTIFICATION_TEST_PANEL
            </h2>
            <p className="mono-ui text-[9px] text-forest/70 mb-4">
              Test haptic alert patterns for different system events
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                onClick={() => showAlert('SYNC_SUCCESS')}
                className="narvo-border bg-primary/10 p-4 hover:bg-primary/20 transition-colors text-left"
                data-testid="test-sync-success"
              >
                <Bell weight="fill" className="w-4 h-4 text-primary mb-2" />
                <span className="mono-ui text-[9px] text-primary font-bold block">SYNC_SUCCESS</span>
              </button>
              <button 
                onClick={() => showAlert('BREAKING_NEWS')}
                className="narvo-border bg-red-500/10 p-4 hover:bg-red-500/20 transition-colors text-left"
                data-testid="test-breaking-news"
              >
                <Lightning weight="fill" className="w-4 h-4 text-red-500 mb-2" />
                <span className="mono-ui text-[9px] text-red-500 font-bold block">BREAKING_NEWS</span>
              </button>
              <button 
                onClick={() => showAlert('BOOKMARK_ADDED')}
                className="narvo-border bg-forest/10 p-4 hover:bg-forest/20 transition-colors text-left"
                data-testid="test-bookmark"
              >
                <Bell weight="fill" className="w-4 h-4 text-forest mb-2" />
                <span className="mono-ui text-[9px] text-forest font-bold block">BOOKMARK_ADDED</span>
              </button>
              <button 
                onClick={() => showAlert('NETWORK_ERROR')}
                className="narvo-border bg-red-500/10 p-4 hover:bg-red-500/20 transition-colors text-left"
                data-testid="test-network-error"
              >
                <Bell weight="fill" className="w-4 h-4 text-red-400 mb-2" />
                <span className="mono-ui text-[9px] text-red-400 font-bold block">NETWORK_ERROR</span>
              </button>
            </div>
          </div>

          {/* Version + Logout */}
          <div className="pt-6 md:pt-8 border-t border-forest/20">
            <p className="mono-ui text-[8px] text-forest/50 text-center mb-4">
              {t('settings.version')}
            </p>
            <button 
              onClick={handleLogout} 
              className="w-full narvo-border bg-surface/5 text-forest font-display font-bold py-4 md:py-5 text-sm md:text-base hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all flex items-center justify-center gap-3 uppercase group" 
              data-testid="logout-btn"
            >
              <SignOut weight="bold" className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
              <span>[{t('settings.logout')}]</span>
            </button>
          </div>

        </div>
      </div>
    </main>
  );
};

export default SettingsPage;

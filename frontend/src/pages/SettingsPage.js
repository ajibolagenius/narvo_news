import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHapticAlert, ALERT_PRESETS } from '../components/HapticAlerts';
import { LogOut, User, Mic, Monitor, Accessibility, ChevronRight, Shield, Zap, Database, Clock, Bell } from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {}
    localStorage.removeItem('narvo_user');
    localStorage.removeItem('narvo_preferences');
    navigate('/');
  };

  const settingsSections = [
    {
      title: 'PROFILE_MANAGEMENT',
      items: [
        { 
          icon: User, 
          label: 'Account', 
          desc: 'SUBSCRIPTION_PLAN // METRICS // REGION', 
          path: '/account',
          status: 'PREMIUM_ACTIVE'
        },
        { 
          icon: Mic, 
          label: 'Voice Studio', 
          desc: 'BROADCAST_VOICE_MODEL // DIALECT_CONFIG', 
          path: '/voices',
          status: 'NOVA_SELECTED'
        },
      ]
    },
    {
      title: 'SYSTEM_CONFIGURATION',
      items: [
        { 
          icon: Monitor, 
          label: 'System Settings', 
          desc: 'DISPLAY // NOTIFICATIONS // THROUGHPUT', 
          path: '/system',
          status: 'CONFIGURED'
        },
        { 
          icon: Accessibility, 
          label: 'Accessibility', 
          desc: 'DENSITY // FONTS // GESTURES // VOICE_CMD', 
          path: '/accessibility',
          status: 'OPTIMIZED'
        },
      ]
    }
  ];

  const systemStats = [
    { icon: Shield, label: 'ENCRYPTION', value: 'AES-256-GCM' },
    { icon: Zap, label: 'AUTH_PROVIDER', value: 'SUPABASE' },
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
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white uppercase tracking-tight">
          Settings_Hub
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
                    <span className="text-white block font-display font-bold text-lg md:text-xl truncate">
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
                      data-testid={`settings-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 narvo-border bg-background-dark flex items-center justify-center group-hover:border-primary transition-colors">
                          <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-forest group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-display text-lg md:text-xl font-bold text-white uppercase mb-1 group-hover:text-primary transition-colors">
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

          {/* Logout Section */}
          <div className="pt-6 md:pt-8 border-t border-forest/20">
            <button 
              onClick={handleLogout} 
              className="w-full narvo-border bg-surface/5 text-forest font-display font-bold py-4 md:py-5 text-sm md:text-base hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all flex items-center justify-center gap-3 uppercase group" 
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
              <span>[TERMINATE_SESSION // LOG_OUT]</span>
            </button>
            <p className="mono-ui text-[8px] text-forest/50 text-center mt-3">
              ALL_LOCAL_DATA_WILL_BE_CLEARED // SESSION_ENCRYPTION_TERMINATED
            </p>
          </div>

        </div>
      </div>
    </main>
  );
};

export default SettingsPage;

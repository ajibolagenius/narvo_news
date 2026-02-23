import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Shield, Monitor } from 'lucide-react';

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

  return (
    <main className="flex-1 flex flex-col bg-background-dark min-w-0" data-testid="settings-page">
      <div className="h-12 md:h-14 flex items-center justify-between px-4 md:px-8 bg-surface/30 narvo-border-b shrink-0">
        <span className="mono-ui text-[10px] md:text-xs text-forest">MODULE: <span className="text-primary">SYSTEM_SETTINGS</span></span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
          {user && (
            <div className="narvo-border bg-surface/20 p-4 md:p-6">
              <span className="mono-ui text-[9px] md:text-[10px] text-forest block mb-3 md:mb-4 font-bold tracking-widest">OPERATOR_PROFILE</span>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 narvo-border bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="font-display text-primary text-xl md:text-2xl font-bold">{user.email?.[0]?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-white block font-display font-bold text-sm md:text-base truncate">{user.email}</span>
                  <span className="mono-ui text-[8px] md:text-[9px] text-forest">ID: {user.id?.slice(0, 12)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="narvo-border bg-surface/20 p-4 md:p-6">
            <span className="mono-ui text-[9px] md:text-[10px] text-forest block mb-3 md:mb-4 font-bold tracking-widest flex items-center gap-2">
              <Monitor className="w-3 h-3" /> DISPLAY_SETTINGS
            </span>
            <div className="flex items-center justify-between p-2.5 md:p-3 narvo-border bg-background-dark">
              <span className="text-white text-xs md:text-sm font-mono">Night Vision Mode</span>
              <div className="w-10 h-5 md:w-12 md:h-6 bg-primary" />
            </div>
          </div>

          <div className="narvo-border bg-surface/20 p-4 md:p-6">
            <span className="mono-ui text-[9px] md:text-[10px] text-forest block mb-3 md:mb-4 font-bold tracking-widest flex items-center gap-2">
              <Shield className="w-3 h-3" /> SECURITY_PROTOCOL
            </span>
            <div className="space-y-2 md:space-y-3 mono-ui text-[8px] md:text-[9px]">
              <div className="flex justify-between p-2.5 md:p-3 narvo-border bg-background-dark">
                <span className="text-forest">ENCRYPTION</span><span className="text-primary font-bold">AES-256-GCM</span>
              </div>
              <div className="flex justify-between p-2.5 md:p-3 narvo-border bg-background-dark">
                <span className="text-forest">AUTH_PROVIDER</span><span className="text-primary font-bold">SUPABASE</span>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="w-full narvo-border bg-surface/10 text-forest font-display font-bold py-3 md:py-4 text-sm md:text-base hover:bg-forest hover:text-white transition-all flex items-center justify-center gap-2 md:gap-3 uppercase" data-testid="logout-btn">
            <LogOut className="w-4 h-4" />
            [End Session / Log Out]
          </button>
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;

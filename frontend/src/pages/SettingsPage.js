import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch {
      localStorage.removeItem('narvo_user');
      localStorage.removeItem('narvo_preferences');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background-dark" data-testid="settings-page">
      <header className="border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-forest hover:text-primary">&larr; [BACK]</button>
          <span className="font-display text-lg text-white">[System Settings]</span>
        </div>
      </header>
      <div className="max-w-2xl mx-auto p-6">
        {user && (
          <div className="border border-forest bg-surface p-6 mb-4">
            <span className="mono-ui text-[10px] text-forest block mb-4">OPERATOR_PROFILE</span>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 border border-primary flex items-center justify-center">
                <span className="font-display text-primary text-lg font-bold">{user.email?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-white block font-display">{user.email}</span>
                <span className="mono-ui text-[9px] text-forest">ID: {user.id?.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        )}
        <div className="border border-forest bg-surface p-6 mb-4">
          <span className="mono-ui text-[10px] text-forest block mb-4">DISPLAY</span>
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">Night Vision Mode</span>
            <div className="w-12 h-6 bg-primary" />
          </div>
        </div>
        <button onClick={handleLogout} className="w-full border border-forest text-forest font-display font-bold py-4 hover:bg-forest hover:text-white transition-all" data-testid="logout-btn">
          [END SESSION / LOG OUT]
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;

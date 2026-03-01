import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { openTourGuide } from '../components/TourGuideModal';
import Clock from '../components/Clock';
import * as api from '../lib/api';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setConfirmMessage('');
    setLoading(true);
    try {
      if (isSignUp) {
        const data = await signUp(email, password);
        if (data?.user && !data.session) {
          setConfirmMessage('Check your email to confirm your account, then sign in.');
        } else {
          navigate('/onboarding');
        }
      } else {
        const data = await signIn(email, password);
        // Fetch preferences from server
        if (data?.user) {
          try {
            const res = await api.get(`api/preferences?user_id=${data.user.id}`);
            if (res.ok) {
              const prefs = await res.json();
              if (prefs.updated_at) {
                localStorage.setItem('narvo_preferences', JSON.stringify(prefs));
                navigate('/dashboard');
                setTimeout(openTourGuide, 2500);
                return;
              }
            }
          } catch {}
        }
        const prefs = localStorage.getItem('narvo_preferences');
        navigate(prefs ? '/dashboard' : '/onboarding');
        setTimeout(openTourGuide, 2500);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-background-dark" data-testid="auth-page">
      <header className="h-16 flex items-center justify-between px-8 border-b border-forest bg-background-dark z-10 shrink-0">
        <div className="flex items-center gap-4">
          <img src="/narvo_logo.svg" alt="Narvo" className="w-6 h-6 shrink-0" />
          <div className="font-display text-xl tracking-tight font-bold uppercase text-content">
            NARVO <span className="text-forest font-light mx-2">{'//'}</span> ACCESS_CENTER
          </div>
          <div className="h-4 w-[1px] bg-forest mx-2" />
          <div className="mono-ui text-[12px] text-forest">V.2.5.0_STABLE</div>
        </div>
        <div className="flex items-center gap-8 mono-ui text-[12px] text-forest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            <span>SECURE_CONNECTION: ACTIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span>LOCAL <Clock /></span>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 h-full">
        <div className="hidden lg:block lg:col-span-3 border-r border-forest h-full relative">
          <div className="absolute inset-0 grid grid-rows-6">
            <div className="border-b border-forest p-6 flex flex-col justify-end">
              <span className="mono-ui text-[11px] text-forest block mb-1">NODE_ID</span>
              <span className="mono-ui text-[12px] text-content">NRV-LGS-X1</span>
            </div>
            <div className="border-b border-forest p-6 flex flex-col justify-end">
              <span className="mono-ui text-[11px] text-forest block mb-1">ENCRYPTION</span>
              <span className="mono-ui text-[12px] text-primary">AES-256-GCM</span>
            </div>
            <div className="border-b border-forest" />
            <div className="border-b border-forest" />
            <div className="border-b border-forest" />
            <div className="p-6 flex items-end">
              <span className="mono-ui text-[11px] text-forest animate-pulse">AWAITING_INPUT_SIGNAL...</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 flex flex-col justify-center items-center relative p-6">
          <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-5">
            {[...Array(4)].map((_, i) => <div key={i} className="border-r border-forest h-full" />)}
          </div>

          <div className="w-full max-w-md z-10 relative">
            <div className="border border-forest bg-background-dark mb-[-1px]">
              <div className="p-4 flex justify-between items-center border-b border-forest">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-content">
                  {isSignUp ? 'Create Account' : 'Initialize Session'}
                </h2>
                <svg className="w-6 h-6 text-primary" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M184,128a56,56,0,1,1-56-56A56,56,0,0,1,184,128Z"/>
                </svg>
              </div>
              <div className="h-1 w-full bg-surface overflow-hidden border-b border-forest">
                <div className="h-full w-1/3 bg-primary" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="border border-forest border-t-0 bg-surface/50 p-8 flex flex-col gap-6">
              {error && (
                <div className="border border-red-500/50 bg-red-500/10 p-3 text-red-400 mono-ui text-[13px]" data-testid="auth-error">
                  [ERROR] {error}
                </div>
              )}
              {confirmMessage && (
                <div className="border border-primary/50 bg-primary/10 p-3 text-primary mono-ui text-[13px]" data-testid="auth-confirm">
                  [OK] {confirmMessage}
                </div>
              )}

              <div className="group relative">
                <label className="mono-ui text-[12px] text-forest mb-2 block font-bold">Operator Credential</label>
                <div className="flex items-center border border-forest bg-background-dark h-12 px-4 focus-within:border-primary transition-all">
                  <svg className="w-5 h-5 text-forest mr-3" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M200,112H184V88a56,56,0,0,0-112,0v24H56a8,8,0,0,0-8,8v80a8,8,0,0,0,8,8H200a8,8,0,0,0,8-8V120A8,8,0,0,0,200,112Z"/>
                  </svg>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="flex-1 bg-transparent border-none outline-none text-content mono-ui text-sm" placeholder="operator@narvo.io" required data-testid="email-input" />
                </div>
              </div>

              <div className="group relative">
                <div className="flex justify-between mb-2">
                  <label className="mono-ui text-[12px] text-forest font-bold">Access Code</label>
                  {!isSignUp && <Link to="/forgot-password" className="mono-ui text-[11px] text-primary cursor-pointer hover:underline" data-testid="forgot-password-link">[Recover_Key]</Link>}
                </div>
                <div className="flex items-center border border-forest bg-background-dark h-12 px-4 focus-within:border-primary transition-all">
                  <svg className="w-5 h-5 text-forest mr-3" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M216.57,39.43A80,80,0,0,0,83.91,120.78L28.69,176A15.86,15.86,0,0,0,24,187.31V216a16,16,0,0,0,16,16H72a8,8,0,0,0,8-8V208H96a8,8,0,0,0,8-8V184h16a8,8,0,0,0,5.66-2.34l9.56-9.57A80,80,0,0,0,216.57,39.43Z"/>
                  </svg>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isSignUp ? 'new-password' : 'current-password'} className="flex-1 bg-transparent border-none outline-none text-content mono-ui text-sm" placeholder="min 6 characters" required minLength={6} data-testid="password-input" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full h-14 bg-primary text-background-dark font-display font-bold uppercase tracking-tighter text-lg hover:bg-white transition-all flex items-center justify-between px-6 mt-2 group disabled:opacity-50" data-testid="auth-submit-btn">
                <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Initiate Sync'}</span>
                {!loading && (
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
                  </svg>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-px bg-forest/30" />
                <span className="mono-ui text-[11px] text-forest/50">OR</span>
                <div className="flex-1 h-px bg-forest/30" />
              </div>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={async () => {
                  try { await signInWithGoogle(); } catch (e) { setError(e.message); }
                }}
                className="w-full h-12 border border-forest bg-background-dark text-content mono-ui text-[13px] font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3"
                data-testid="google-auth-btn"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                CONTINUE WITH GOOGLE
              </button>
            </form>

            <div className="border border-forest border-t-0 bg-background-dark p-4">
              <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setConfirmMessage(''); }} className="w-full text-center mono-ui text-[13px] text-forest hover:text-primary transition-colors" data-testid="auth-toggle-btn">
                {isSignUp ? '[Already have access? Sign In]' : '[Request New Access? Create Account]'}
              </button>
            </div>

            <div className="grid grid-cols-2 border border-forest border-t-0 bg-background-dark">
              <div className="p-4 border-r border-forest flex items-center gap-3">
                <svg className="w-5 h-5 text-forest" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8Z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="mono-ui text-[11px] text-forest">AUTHENTICATION</span>
                  <span className="mono-ui text-[12px] text-content">Supabase_Auth</span>
                </div>
              </div>
              <div className="p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-forest" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="mono-ui text-[11px] text-forest">PROTOCOL</span>
                  <span className="mono-ui text-[12px] text-content">E2E_ENCRYPTED</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="mono-ui text-[11px] text-forest leading-relaxed">
                Authorized Access Only. Internal Signal NRV-00-1.<br />
                Clearance Level: [LEVEL_4_BROADCAST]
              </p>
            </div>

            <Link to="/" className="block text-center mono-ui text-[12px] text-forest mt-6 hover:text-primary" data-testid="back-to-landing">
              &larr; [BACK_TO_LANDING]
            </Link>
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-3 border-l border-forest h-full relative">
          <div className="absolute inset-0 grid grid-rows-6">
            <div className="border-b border-forest p-6 flex justify-end items-end">
              <span className="mono-ui text-[12px] text-forest">SECURE_HANDSHAKE: <span className="text-primary">PASS</span></span>
            </div>
            <div className="border-b border-forest p-6 flex flex-col justify-end items-end gap-1">
              <div className="h-[1px] w-12 bg-forest" /><div className="h-[1px] w-8 bg-forest opacity-50" /><div className="h-[1px] w-4 bg-forest opacity-30" />
            </div>
            <div className="border-b border-forest" />
            <div className="border-b border-forest" />
            <div className="border-b border-forest" />
            <div className="p-6 flex flex-col justify-end items-end text-right">
              <span className="mono-ui text-[11px] text-forest uppercase">Node_Location</span>
              <span className="mono-ui text-[12px] text-content">6.5244 N, 3.3792 E</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-12 border-t border-forest bg-surface/30 flex items-center justify-between px-8 text-forest mono-ui text-[11px] z-10 shrink-0">
        <div className="flex gap-6">
          <span className="pr-6 border-r border-forest/30">HELP_TERMINAL</span>
          <span>PRIVACY_PROTOCOL_2026</span>
        </div>
        <div className="flex items-center gap-2"><span>SYSTEM_STORAGE: 84% READ_ONLY</span></div>
      </footer>
    </div>
  );
};

export default AuthPage;

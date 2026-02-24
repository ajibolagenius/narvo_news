import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, ArrowRight, X } from 'lucide-react';
import Clock from '../components/Clock';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [breaking, setBreaking] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [breakingDismissed, setBreakingDismissed] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/news?limit=4`).then(r => r.json()),
      fetch(`${API_URL}/api/news/breaking`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/api/metrics`).then(r => r.json()).catch(() => null),
    ]).then(([newsData, breakingData, metricsData]) => {
      setNews(newsData);
      setBreaking(breakingData);
      setMetrics(metricsData);
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex flex-col border-x border-forest max-w-[1440px] mx-auto relative bg-background-dark" data-testid="landing-page">
      <header className="flex flex-col border-b border-forest">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-forest" viewBox="0 0 256 256" fill="currentColor">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM168,128a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V88a8,8,0,0,1,16,0v32h24A8,8,0,0,1,168,128Z"/>
              </svg>
              <h1 className="font-display text-2xl font-bold tracking-tighter text-white">NARVO</h1>
            </div>
            <div className="hidden md:flex items-center gap-4 border-l border-forest pl-6 h-10">
              <span className="mono-ui text-[10px] text-forest">SYSTEM_STATUS:</span>
              <span className="mono-ui text-[10px] text-primary">BROADCAST_READY: 100%</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            <a className="mono-ui text-[11px] hover:text-primary transition-colors text-slate-400" href="#about">ABOUT</a>
            <a className="mono-ui text-[11px] hover:text-primary transition-colors text-slate-400" href="#why">WHY NARVO?</a>
            <a className="mono-ui text-[11px] hover:text-primary transition-colors text-slate-400" href="#tech">TECHNOLOGY</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="mono-ui text-[11px] bg-forest/20 px-3 py-1 border border-forest text-forest">
              UTC: <Clock />
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-forest">
        <div className="lg:col-span-9 flex flex-col justify-center p-8 lg:p-16 border-r border-forest">
          <div className="mono-ui text-[12px] text-forest mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-forest block"></span>
            {t('landing.tagline')}
          </div>
          <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tighter text-white mb-8">
            {t('landing.headline').split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}
          </h1>
          <p className="text-lg lg:text-xl text-slate-400 max-w-xl mb-12">
            {t('landing.description')}
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/auth')} className="bg-primary text-background-dark font-display font-bold px-8 py-4 text-lg hover:bg-white transition-all" data-testid="start-broadcast-btn">
              [{t('landing.start_broadcast')}]
            </button>
            <button onClick={() => { localStorage.setItem('narvo_guest', 'true'); navigate('/dashboard'); }} className="border border-forest text-forest font-display font-bold px-8 py-4 text-lg hover:bg-forest hover:text-white transition-all" data-testid="demo-btn">
              [{t('landing.guest_play')}]
            </button>
          </div>
          {/* Breaking News Banner */}
          {!breakingDismissed && breaking.length > 0 && (
            <div className="mt-8 w-full bg-red-950/90 border border-red-500/50 px-4 py-3 flex items-center gap-3 animate-pulse-subtle" data-testid="landing-breaking-banner">
              <div className="flex items-center gap-2 shrink-0">
                <Zap className="w-3.5 h-3.5 text-red-400" />
                <span className="mono-ui text-[9px] md:text-[10px] text-red-400 font-bold tracking-widest">
                  {t('notifications.breaking_news')}
                </span>
              </div>
              <button
                onClick={() => navigate(`/news/${breaking[0].id}`)}
                className="flex-1 min-w-0 text-left group"
              >
                <span className="mono-ui text-[10px] md:text-[11px] text-white font-bold truncate block group-hover:text-red-300 transition-colors">
                  {breaking[0].title}
                </span>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/news/${breaking[0].id}`)}
                  className="mono-ui text-[8px] text-red-400 font-bold hover:text-white transition-colors hidden sm:flex items-center gap-1"
                >
                  {t('notifications.read_now')}
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button onClick={() => setBreakingDismissed(true)} className="p-1 hover:bg-red-500/20 transition-colors">
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-background-dark flex flex-col">
          <div className="h-12 border-b border-forest flex items-center px-4 justify-between bg-forest/5 shrink-0">
            <span className="mono-ui text-[10px] text-forest">{t('landing.incoming')}</span>
            <svg className="w-5 h-5 text-forest" viewBox="0 0 256 256" fill="currentColor">
              <path d="M56,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM88,24a8,8,0,0,0-8,8V224a8,8,0,0,0,16,0V32A8,8,0,0,0,88,24Zm40,32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V64A8,8,0,0,0,128,56Zm40,32a8,8,0,0,0-8,8v64a8,8,0,0,0,16,0V96A8,8,0,0,0,168,88Zm40-16a8,8,0,0,0-8,8v96a8,8,0,0,0,16,0V80A8,8,0,0,0,208,72Z"/>
            </svg>
          </div>
          <div className="flex flex-col flex-1">
            {news.map((item, idx) => (
              <article key={item.id} className={`p-6 ${idx < news.length - 1 ? 'border-b border-forest' : ''} group cursor-pointer hover:bg-forest/10 transition-all flex-1 flex flex-col justify-center`} onClick={() => navigate(`/news/${item.id}`)} data-testid={`transmission-${idx}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="mono-ui text-[9px] text-primary border border-primary px-1">AUDIO</span>
                  <span className="mono-ui text-[9px] text-forest">{item.truth_score ? `TRUTH_TAG: ${item.truth_score}%` : '04m 12s'}</span>
                </div>
                <h3 className="font-display text-md font-bold leading-snug mb-2 group-hover:text-primary transition-colors text-white line-clamp-2">{item.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-1 h-3 bg-primary animate-pulse"></span>
                  <span className="mono-ui text-[8px] text-forest">[PROCESSING_PULSE]</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-forest">
        {[
          { num: '01', title: t('landing.pillar_1_title'), desc: t('landing.pillar_1_desc') },
          { num: '02', title: t('landing.pillar_2_title'), desc: t('landing.pillar_2_desc') },
          { num: '03', title: t('landing.pillar_3_title'), desc: t('landing.pillar_3_desc') },
          { num: '04', title: t('landing.pillar_4_title'), desc: t('landing.pillar_4_desc') },
        ].map((pillar, idx) => (
          <div key={idx} className={`p-8 ${idx < 3 ? 'border-r border-forest' : ''} ${idx % 2 === 0 ? 'bg-forest/5' : 'bg-background-dark'} h-64 flex flex-col justify-between group hover:bg-forest/10 transition-all`}>
            <span className="mono-ui text-[10px] text-forest">{pillar.num}. {pillar.title}</span>
            <h4 className="font-display text-xl text-white">{pillar.desc}</h4>
            <div className="flex justify-end"><div className="w-12 h-12 text-forest opacity-30 group-hover:opacity-60 transition-opacity" /></div>
          </div>
        ))}
      </section>

      <section id="tech" className="grid grid-cols-1 md:grid-cols-3 border-b border-forest">
        {[
          { id: '0x01', title: t('landing.console_title'), desc: t('landing.console_desc'), metric: '99.9%', label: 'UPTIME_PROTOCOL' },
          { id: '0x02', title: t('landing.voices_title'), desc: t('landing.voices_desc'), metric: '1,420', label: 'VOICE_NODES' },
          { id: '0x03', title: t('landing.truth_title'), desc: t('landing.truth_desc'), metric: '0.8s', label: 'FACT_LATENCY' },
        ].map((mod, idx) => (
          <div key={idx} className={`p-8 ${idx < 2 ? 'border-r border-forest' : ''}`}>
            <div className="flex justify-between items-start mb-4"><p className="mono-ui text-[10px] text-forest">MOD_ID: {mod.id}</p></div>
            <h3 className="font-display text-2xl font-bold mb-4 uppercase text-white">{mod.title}</h3>
            <p className="text-slate-400 text-sm mb-6">{mod.desc}</p>
            <div className="border-t border-forest pt-4 flex justify-between items-center">
              <span className="mono-ui text-[10px] text-forest">{mod.label}</span>
              <span className="mono-ui text-[14px] text-primary">{mod.metric}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-forest">
        <div className="p-8 lg:p-16 border-r border-forest bg-forest/5 flex flex-col justify-center">
          <h2 className="font-display text-4xl font-bold mb-8 text-white">{t('landing.system_core')}</h2>
          <div className="space-y-4">
            {[
              { num: '01', title: 'RSS_SUMMARIZATION', desc: 'Multi-source ingestion filtered per user subscription.' },
              { num: '02', title: 'NATIVE_TRANSLATION', desc: 'Real-time localized translation into regional dialects.' },
              { num: '03', title: 'AUDIO_SYNTHESIS', desc: 'High-fidelity voice delivery powered by AI.' },
            ].map((step, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-forest bg-background-dark">
                <div className="w-10 h-10 flex items-center justify-center border border-forest text-primary font-mono text-xs shrink-0">{step.num}</div>
                <div>
                  <h4 className="mono-ui text-sm text-white mb-1">{step.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="p-8 flex-1 border-b border-forest flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <svg className="w-6 h-6 text-forest" viewBox="0 0 256 256" fill="currentColor"><path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z"/></svg>
              <h4 className="mono-ui text-lg text-white">Broadcast_Control_Unit</h4>
            </div>
            <div className="aspect-video w-full bg-forest/10 border border-forest relative overflow-hidden flex items-end p-8 gap-1">
              {[25, 50, 75, 66, 100, 33, 50].map((h, i) => (
                <div key={i} className={`flex-1 ${i % 2 === 1 ? 'bg-primary' : 'bg-forest/40'} ${i === 3 ? 'animate-pulse' : ''}`} style={{ height: `${h}%` }} />
              ))}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="mono-ui text-primary text-[10px] bg-background-dark px-4 py-2 border border-forest">SIGNAL_OPTIMIZED</span>
              </div>
            </div>
          </div>
          <div className="p-8 bg-primary/10 flex items-center justify-between">
            <div>
              <h5 className="mono-ui text-xs text-forest mb-1">INITIATE CONNECTION</h5>
              <p className="font-display font-bold text-xl text-primary uppercase">{t('landing.join_broadcast')}</p>
            </div>
            <button onClick={() => navigate('/auth')} className="bg-primary text-background-dark font-display font-bold px-8 py-4 hover:bg-white transition-all" data-testid="start-listening-btn">
              [{t('landing.start_listening')}]
            </button>
          </div>
        </div>
      </section>

      <footer className="mt-auto grid grid-cols-1 md:grid-cols-4 border-t border-forest bg-background-dark">
        <div className="p-6 border-r border-forest flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-8 text-white">
            <svg className="w-6 h-6 text-forest" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/></svg>
            <span className="font-display font-bold text-white tracking-tighter">NARVO</span>
          </div>
          <p className="mono-ui text-[9px] text-forest">V.2.5.0_STABLE_BUILD<br />2026 NARVO</p>
        </div>
        <div className="p-6 border-r border-forest">
          <h6 className="mono-ui text-[10px] text-forest mb-4">SYSTEM_LINKS</h6>
          <ul className="space-y-2">
            <li><a className="mono-ui text-[11px] text-slate-400 hover:text-primary transition-colors" href="#about">STATION_MAP</a></li>
            <li><a className="mono-ui text-[11px] text-slate-400 hover:text-primary transition-colors" href="#tech">CORE_RAG_PROTOCOLS</a></li>
            <li><a className="mono-ui text-[11px] text-slate-400 hover:text-primary transition-colors" href="#why">VOICE_MATRIX</a></li>
          </ul>
        </div>
        <div className="p-6 border-r border-forest">
          <h6 className="mono-ui text-[10px] text-forest mb-4">PROTOCOL_STATUS</h6>
          <div className="flex items-center gap-3 mb-2"><div className="w-2 h-2 bg-forest" /><span className="mono-ui text-[10px] text-slate-400">TRANSLATION: V.2.1</span></div>
          <div className="flex items-center gap-3 mb-2"><div className="w-2 h-2 bg-primary animate-pulse" /><span className="mono-ui text-[10px] text-slate-400">ENCRYPTION: AES_X</span></div>
          <div className="flex items-center gap-3"><div className="w-2 h-2 bg-forest" /><span className="mono-ui text-[10px] text-slate-400">SYNTHESIS: OPTIMIZED</span></div>
        </div>
        <div className="p-6 flex flex-col justify-between">
          <h6 className="mono-ui text-[10px] text-forest mb-4">CONNECT_SYSTEM</h6>
          <p className="mono-ui text-[9px] text-forest mt-4">LOG_STAMP: 2026.02.23</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

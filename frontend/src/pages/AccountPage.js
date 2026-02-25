import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Timer, Waveform, MapPin, FileText, Broadcast, User } from '@phosphor-icons/react';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const MetricCard = ({ title, icon: Icon, loading, children }) => (
  <div className="narvo-border bg-surface/5 p-5 md:p-8 flex flex-col justify-between min-h-[180px] md:min-h-[220px]">
    <div className="flex justify-between items-start">
      <h3 className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-widest">{title}</h3>
      <Icon className="w-4 h-4 md:w-5 md:h-5 text-forest" />
    </div>
    {loading ? (
      <Skeleton variant="text" className="w-24 h-12 mt-4" />
    ) : (
      <div className="mt-auto">{children}</div>
    )}
  </div>
);

const AccountPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/metrics`)
      .then(res => res.json())
      .then(data => { setMetrics(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const alerts = [
    { id: 1, type: 'feature', title: 'NEW_FEATURE: HUB_ANALYTICS', desc: 'ADVANCED_TRANSMISSION_METRICS ARE NOW LIVE FOR PREMIUM ENTITIES.', time: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }), priority: true },
    { id: 2, type: 'maintenance', title: 'MAINTENANCE_DOWNTIME', desc: 'REGION_LAGOS NODES WILL UNDERGO ENCRYPTION UPDATES ON FEB 28.', time: '24H_AGO', priority: false },
  ];

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll bg-background-dark min-h-0" data-testid="account-page">
      <div className="p-4 md:p-8 lg:p-10 space-y-6 md:space-y-8 pb-20 md:pb-10">

        {/* User Profile Card */}
        {user && (
          <div className="narvo-border bg-surface/10 p-4 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold tracking-[0.2em] block mb-4">
                AUTHENTICATED_OPERATOR
              </span>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 narvo-border bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="font-display text-primary text-xl md:text-2xl font-bold">{user.email?.[0]?.toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-content block font-display font-bold text-sm md:text-lg truncate">{user.email}</span>
                  <span className="mono-ui text-[8px] md:text-[9px] text-forest block mt-0.5">
                    OPERATOR_ID: {user.id?.slice(0, 16)}...
                  </span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-1.5 py-0.5 bg-primary/20 text-primary mono-ui text-[7px] md:text-[8px] font-bold">PREMIUM</span>
                    <span className="px-1.5 py-0.5 bg-forest/20 text-forest mono-ui text-[7px] md:text-[8px] font-bold">VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Panel */}
        <div className="narvo-border relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
            <Broadcast className="w-48 h-48 md:w-64 md:h-64 text-primary" />
          </div>
          <div className="relative z-10 p-4 md:p-8 space-y-4 md:space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-primary animate-pulse" />
              <span className="mono-ui text-[9px] md:text-[10px] text-primary font-bold uppercase">{t('account.stream_active')}</span>
            </div>
            <div>
              <h3 className="mono-ui text-[8px] md:text-[9px] text-forest font-bold uppercase tracking-widest mb-1">
                {t('account.current_plan')}
              </h3>
              <p className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-content uppercase leading-none">
                {t('account.premium_broadcast').split('\n').map((l, i) => <React.Fragment key={i}>{i > 0 && <br/>}{l}</React.Fragment>)}
              </p>
            </div>
            <div className="inline-flex px-2 py-1 border border-primary text-primary mono-ui text-[8px] md:text-[9px] font-bold">
              [PROTO_ID: PRM-BC-26]
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <button 
                className="px-4 md:px-6 py-2 bg-transparent border border-white text-content mono-ui text-[9px] md:text-[10px] font-bold hover:bg-primary hover:border-primary hover:text-background-dark transition-all"
                data-testid="manage-plan-btn"
              >
                {t('account.manage_plan')}
              </button>
              <button className="px-3 py-2 text-slate-400 mono-ui text-[9px] md:text-[10px] font-bold hover:text-primary transition-colors flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>{t('account.view_invoices')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div>
          <h2 className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-[0.2em] mb-4">
            TRANSMISSION_METRICS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <MetricCard title={t('account.broadcast_hours')} icon={Timer} loading={loading}>
              <span className="font-display text-4xl md:text-5xl font-bold text-content block">142.5</span>
              <div className="flex items-center gap-2 mono-ui text-[8px] md:text-[9px] font-bold mt-1">
                <span className="text-primary">+12.4%</span>
                <span className="text-forest opacity-70">VS_PREV_CYCLE</span>
              </div>
              <div className="w-full h-1 bg-forest/20 mt-4 relative">
                <div className="absolute top-0 left-0 h-full w-[70%] bg-primary" />
              </div>
            </MetricCard>

            <MetricCard title={t('account.signals_processed')} icon={Waveform} loading={loading}>
              <span className="font-display text-4xl md:text-5xl font-bold text-content block">
                {metrics?.stories_processed || 892}
              </span>
              <div className="flex items-center gap-2 mono-ui text-[8px] md:text-[9px] font-bold mt-1">
                <span className="text-forest opacity-70">AVG_28_PER_ROTATION</span>
              </div>
              <div className="flex items-end gap-1 h-8 mt-4 opacity-40">
                {[40, 60, 30, 80, 100, 50, 70].map((h, i) => (
                  <div key={i} className={`flex-1 ${i === 4 ? 'bg-primary' : 'bg-forest'}`} style={{ height: `${h}%` }} />
                ))}
              </div>
            </MetricCard>

            <MetricCard title={t('account.primary_region')} icon={MapPin} loading={loading}>
              <div className="flex items-center gap-3 mt-2">
                <MapPin className="w-6 h-6 md:w-8 md:h-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-display text-xl md:text-2xl font-bold text-content uppercase leading-none">Lagos, NG</h4>
                  <div className="flex gap-3 mono-ui text-[7px] md:text-[8px] text-primary font-bold mt-0.5">
                    <span>LAT: 6.5244</span>
                    <span>LON: 3.3792</span>
                  </div>
                </div>
              </div>
              <div className="narvo-border border-forest/30 p-2 bg-surface/10 mt-3">
                <div className="flex justify-between mono-ui text-[7px] md:text-[8px] text-forest font-bold">
                  <span>HUB_LOAD</span>
                  <span>{metrics?.network_load || '24%'}</span>
                </div>
                <div className="w-full h-[2px] bg-forest/20 mt-1.5">
                  <div className="w-[24%] h-full bg-primary" />
                </div>
              </div>
            </MetricCard>
          </div>
        </div>

        {/* System Alerts */}
        <div>
          <h2 className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-[0.2em] mb-4 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" />
            {t('account.system_alerts')}
          </h2>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-4 md:p-5 narvo-border relative cursor-pointer hover:border-primary transition-colors ${
                  alert.priority ? 'bg-primary/5' : 'border-forest/30 bg-surface/5'
                }`}
                data-testid={`alert-${alert.id}`}
              >
                {alert.priority && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                <p className={`mono-ui text-[10px] md:text-[11px] font-bold mb-1.5 ${alert.priority ? 'text-primary' : 'text-content'}`}>
                  {alert.title}
                </p>
                <p className="mono-ui text-[8px] md:text-[9px] text-forest leading-relaxed">{alert.desc}</p>
                <p className="mono-ui text-[7px] text-slate-500 mt-2 text-right">{alert.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Session Info */}
        {user && (
          <div className="narvo-border-t pt-4 md:pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-forest" />
              <span className="mono-ui text-[8px] md:text-[9px] text-forest">{t('account.session_active')}</span>
            </div>
            <span className="mono-ui text-[8px] text-forest/50">PROTO_VER: 2.6.1</span>
          </div>
        )}
      </div>
    </main>
  );
};

export default AccountPage;

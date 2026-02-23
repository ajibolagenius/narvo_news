import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Timer, AudioWaveform, MapPin, FileText, Broadcast } from 'lucide-react';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const AccountPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/metrics`)
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const alerts = [
    { id: 1, type: 'feature', title: 'NEW_FEATURE: HUB_ANALYTICS', desc: 'ADVANCED_TRANSMISSION_METRICS ARE NOW LIVE FOR PREMIUM ENTITIES.', time: '09:12_UTC', priority: true },
    { id: 2, type: 'maintenance', title: 'MAINTENANCE_DOWNTIME', desc: 'REGION_LAGOS NODES WILL UNDERGO ENCRYPTION UPDATES ON FEB 28.', time: '24H_AGO', priority: false },
  ];

  return (
    <main className="flex-1 overflow-y-auto custom-scroll bg-background-dark" data-testid="account-page">
      {/* Upper Section: Subscription & Alerts */}
      <div className="narvo-border-b flex flex-col lg:flex-row min-h-[300px] lg:min-h-[400px]">
        {/* Subscription Panel */}
        <div className="flex-1 p-6 md:p-10 lg:narvo-border-r hover:bg-primary/5 transition-all group relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Broadcast className="w-64 h-64 md:w-72 md:h-72 text-primary group-hover:text-background-dark" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-primary animate-pulse group-hover:bg-background-dark" />
                <span className="mono-ui text-[9px] md:text-[10px] text-primary font-bold uppercase group-hover:text-background-dark">Stream_Active</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="mono-ui text-[9px] md:text-[10px] text-forest font-bold uppercase group-hover:text-background-dark tracking-widest">
                  CURRENT_PLAN
                </h3>
                <p className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-white uppercase leading-none group-hover:text-background-dark">
                  Premium<br/>Broadcast
                </p>
              </div>
              
              <div className="inline-flex px-2 md:px-3 py-1 border border-primary text-primary mono-ui text-[9px] md:text-[10px] font-bold group-hover:border-background-dark group-hover:text-background-dark">
                [PROTO_ID: PRM-BC-26]
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 md:gap-6 mt-6">
              <button 
                className="px-4 md:px-8 py-2 md:py-3 bg-transparent border border-white text-white mono-ui text-[10px] md:text-[11px] font-bold hover:bg-white hover:text-background-dark transition-all group-hover:border-background-dark group-hover:text-background-dark"
                data-testid="manage-plan-btn"
              >
                MANAGE_PLAN
              </button>
              <button className="px-3 md:px-4 py-2 md:py-3 text-slate-400 mono-ui text-[10px] md:text-[11px] font-bold hover:text-white transition-colors group-hover:text-background-dark flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">VIEW_INVOICES</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="w-full lg:w-[350px] xl:w-[400px] p-6 md:p-10 flex flex-col gap-6 md:gap-8 narvo-border-t lg:border-t-0">
          <h3 className="mono-ui text-[9px] md:text-[10px] text-forest font-bold flex items-center gap-3 tracking-[0.2em]">
            <Bell className="w-4 h-4" />
            SYSTEM_ALERTS
          </h3>
          
          <div className="space-y-3 md:space-y-4">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-4 md:p-6 narvo-border relative hover:bg-forest/10 transition-colors cursor-pointer group ${
                  alert.priority ? 'bg-primary/5' : 'border-forest/30 bg-surface/5'
                }`}
                data-testid={`alert-${alert.id}`}
              >
                {alert.priority && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                <p className={`mono-ui text-[10px] md:text-[11px] font-bold mb-2 ${alert.priority ? 'text-primary' : 'text-white'}`}>
                  {alert.title}
                </p>
                <p className="mono-ui text-[8px] md:text-[9px] text-forest leading-relaxed">{alert.desc}</p>
                <p className="mono-ui text-[7px] md:text-[8px] text-slate-500 mt-3 md:mt-4 text-right">{alert.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Section: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Metric 1: Broadcast Hours */}
        <div className="p-6 md:p-10 narvo-border-r narvo-border-b md:border-b-0 hover:bg-primary/5 transition-all flex flex-col justify-between group cursor-pointer min-h-[200px] md:min-h-[250px]">
          <div className="flex justify-between items-start">
            <h3 className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-widest group-hover:text-background-dark">
              BROADCAST_HOURS
            </h3>
            <Timer className="w-5 h-5 text-forest group-hover:text-background-dark" />
          </div>
          
          <div className="space-y-2">
            {loading ? (
              <Skeleton variant="text" className="w-32 h-16" />
            ) : (
              <span className="font-display text-5xl md:text-6xl font-bold text-white block group-hover:text-background-dark transition-colors">
                142.5
              </span>
            )}
            <div className="flex items-center gap-2 mono-ui text-[8px] md:text-[9px] font-bold">
              <span className="text-primary group-hover:text-background-dark">+12.4%</span>
              <span className="text-forest group-hover:text-background-dark opacity-70">VS_PREV_CYCLE</span>
            </div>
          </div>
          
          <div className="w-full h-1 bg-forest/20 mt-6 md:mt-8 relative group-hover:bg-background-dark/20">
            <div className="absolute top-0 left-0 h-full w-[70%] bg-primary group-hover:bg-background-dark transition-all" />
          </div>
        </div>

        {/* Metric 2: Signals Processed */}
        <div className="p-6 md:p-10 narvo-border-r narvo-border-b md:border-b-0 hover:bg-primary/5 transition-all flex flex-col justify-between group cursor-pointer min-h-[200px] md:min-h-[250px]">
          <div className="flex justify-between items-start">
            <h3 className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-widest group-hover:text-background-dark">
              SIGNALS_PROCESSED
            </h3>
            <AudioWaveform className="w-5 h-5 text-forest group-hover:text-background-dark" />
          </div>
          
          <div className="space-y-2">
            {loading ? (
              <Skeleton variant="text" className="w-24 h-16" />
            ) : (
              <span className="font-display text-5xl md:text-6xl font-bold text-white block group-hover:text-background-dark transition-colors">
                {metrics?.stories_processed || 892}
              </span>
            )}
            <div className="flex items-center gap-2 mono-ui text-[8px] md:text-[9px] font-bold">
              <span className="text-forest group-hover:text-background-dark opacity-70">AVG_28_PER_ROTATION</span>
            </div>
          </div>
          
          <div className="flex items-end gap-1 h-10 md:h-12 mt-6 md:mt-8 opacity-40 group-hover:opacity-80 transition-all">
            {[40, 60, 30, 80, 100, 50, 70].map((h, i) => (
              <div 
                key={i} 
                className={`flex-1 ${i === 4 ? 'bg-primary' : 'bg-forest'} group-hover:bg-background-dark`} 
                style={{ height: `${h}%` }} 
              />
            ))}
          </div>
        </div>

        {/* Region Status */}
        <div className="p-6 md:p-10 relative group hover:bg-primary/5 transition-all bg-background-dark cursor-pointer overflow-hidden min-h-[200px] md:min-h-[250px]">
          <div 
            className="absolute inset-0 opacity-10 group-hover:opacity-0 transition-opacity"
            style={{ backgroundImage: 'linear-gradient(#628141 1px, transparent 1px), linear-gradient(90deg, #628141 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h3 className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-widest group-hover:text-background-dark">
                PRIMARY_REGION_STATUS
              </h3>
              <MapPin className="w-5 h-5 text-forest group-hover:text-background-dark" />
            </div>
            
            <div className="mt-auto space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 md:gap-4">
                <MapPin className="w-8 h-8 md:w-10 md:h-10 text-primary group-hover:text-background-dark transition-colors" />
                <div className="space-y-1">
                  <h4 className="font-display text-2xl md:text-3xl font-bold text-white group-hover:text-background-dark uppercase leading-none transition-colors">
                    Lagos, NG
                  </h4>
                  <div className="flex gap-3 md:gap-4 mono-ui text-[8px] md:text-[9px] text-primary font-bold group-hover:text-background-dark">
                    <span>LAT: 6.5244</span>
                    <span>LON: 3.3792</span>
                  </div>
                </div>
              </div>
              
              <div className="narvo-border border-forest/30 p-2 md:p-3 bg-surface/10 group-hover:border-background-dark transition-all">
                <div className="flex justify-between mono-ui text-[7px] md:text-[8px] text-forest font-bold group-hover:text-background-dark">
                  <span>HUB_LOAD</span>
                  <span>{metrics?.network_load || '24%'}</span>
                </div>
                <div className="w-full h-[2px] bg-forest/20 mt-2">
                  <div className="w-[24%] h-full bg-primary group-hover:bg-background-dark" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Footer */}
      {user && (
        <div className="narvo-border-t p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 narvo-border bg-primary/20 flex items-center justify-center">
              <span className="font-display text-primary text-xl font-bold">{user.email?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-white block font-display font-bold text-sm">{user.email}</span>
              <span className="mono-ui text-[8px] text-forest">USER_ID: {user.id?.slice(0, 16)}</span>
            </div>
          </div>
          <div className="mono-ui text-[9px] text-forest">
            SESSION_ACTIVE // ENCRYPTION: AES-256-GCM
          </div>
        </div>
      )}
    </main>
  );
};

export default AccountPage;

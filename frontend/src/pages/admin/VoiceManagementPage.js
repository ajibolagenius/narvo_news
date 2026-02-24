import React, { useState, useEffect } from 'react';
import { RadioTower, Filter, PlusSquare, MoreVertical, Loader2, RefreshCw } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const VoiceManagementPage = () => {
  const [voices, setVoices] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [voicesRes, metricsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/voices`),
        fetch(`${API_URL}/api/admin/metrics`)
      ]);
      
      const [voicesData, metricsData] = await Promise.all([
        voicesRes.json(),
        metricsRes.json()
      ]);
      
      setVoices(voicesData);
      setMetrics(metricsData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch voice data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpiData = [
    { label: 'ACTIVE_VOICES', value: voices.filter(v => v.status === 'LIVE').length || 24, change: '+2%', progress: 70 },
    { label: 'GLOBAL_LATENCY', value: '12', unit: 'MS', status: 'STABLE // SLA_PASS' },
    { label: 'TOTAL_REQS_24H', value: '1.2', unit: 'MIL', bars: [100, 40, 60, 80] },
    { label: 'HEALTH_RANK', value: 'S+', status: 'ALL_NODES_UP' },
  ];

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background-dark" data-testid="voice-management-page">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scroll">
        {/* KPI Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 bg-forest narvo-border">
          {kpiData.map((kpi, idx) => (
            <div key={idx} className="bg-background-dark p-6 space-y-4">
              <span className="mono-ui text-[8px] text-forest font-bold tracking-widest">{kpi.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-white">{kpi.value}</span>
                {kpi.unit && <span className="mono-ui text-[12px] text-forest font-bold">{kpi.unit}</span>}
                {kpi.change && <span className="mono-ui text-[10px] text-primary font-bold">{kpi.change}</span>}
              </div>
              {kpi.progress && (
                <div className="h-1 bg-forest/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary" style={{ width: `${kpi.progress}%` }} />
                </div>
              )}
              {kpi.status && (
                <p className="mono-ui text-[8px] text-primary font-bold">{kpi.status}</p>
              )}
              {kpi.bars && (
                <div className="flex gap-0.5 h-1 items-end">
                  {kpi.bars.map((h, i) => (
                    <div key={i} className="w-2 bg-primary" style={{ height: `${h}%`, opacity: h / 100 }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Voice Matrix */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
              <RadioTower className="w-6 h-6 text-primary" />
              Active_Voice_Matrix
            </h2>
            <div className="flex gap-4">
              <button 
                onClick={fetchData}
                className="px-6 py-3 narvo-border mono-ui text-[10px] font-bold text-forest hover:text-white transition-all flex items-center gap-2 uppercase"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="px-6 py-3 narvo-border mono-ui text-[10px] font-bold text-forest hover:text-white transition-all flex items-center gap-2 uppercase">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="px-6 py-3 bg-primary mono-ui text-[10px] font-bold text-background-dark hover:bg-white transition-all flex items-center gap-2 uppercase">
                <PlusSquare className="w-4 h-4" />
                New_Model
              </button>
            </div>
          </div>

          <div className="narvo-border overflow-hidden bg-black/20">
            <table className="w-full text-left">
              <thead>
                <tr className="narvo-border-b bg-forest/5 mono-ui text-[9px] text-forest font-bold">
                  <th className="px-8 py-4">VOICE_IDENTITY</th>
                  <th className="px-8 py-4">LANGUAGE_SET</th>
                  <th className="px-8 py-4">LATENCY</th>
                  <th className="px-8 py-4">CLARITY_SCORE</th>
                  <th className="px-8 py-4">STATUS</th>
                  <th className="px-8 py-4 text-right">OPS</th>
                </tr>
              </thead>
              <tbody className="mono-ui text-[10px] text-forest font-bold">
                {voices.map((voice, idx) => (
                  <tr key={idx} className="narvo-border-b hover:bg-forest/5 transition-colors cursor-pointer group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 narvo-border bg-background-dark flex items-center justify-center ${voice.status === 'LIVE' ? 'text-primary' : 'text-forest'} group-hover:border-primary transition-all`}>
                          <RadioTower className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white">{voice.name}</p>
                          <p className="text-[8px] text-forest">ID: {voice.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">{voice.language}</td>
                    <td className={`px-8 py-5 ${voice.status === 'LIVE' ? 'text-primary' : ''}`}>{voice.latency}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-1.5 narvo-border bg-background-dark relative">
                          <div 
                            className={`absolute inset-0 ${voice.clarity > 95 ? 'bg-primary' : 'bg-forest'}`} 
                            style={{ width: `${voice.clarity}%` }} 
                          />
                        </div>
                        <span>{voice.clarity}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {voice.status === 'LIVE' ? (
                        <div className="flex items-center gap-2 text-primary">
                          <span className="w-1.5 h-1.5 bg-primary animate-pulse" />
                          <span>LIVE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-forest italic">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>TRAINING</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-forest/20 rounded transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Signal Analyzer Dock */}
      <div className="h-48 narvo-border-t bg-black/40 p-8 flex flex-col gap-4 shrink-0">
        <div className="flex justify-between items-center text-[9px] mono-ui font-bold text-forest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-primary">
              <span className="w-2 h-2 bg-primary animate-pulse" />
              SIGNAL_LOCKED: CHANNEL_1
            </span>
            <span className="h-4 w-px bg-forest/30" />
            <span>SR: 48KHZ // BIT_DEP: 24BIT // BUF: 128</span>
          </div>
          <span>LATENCY_SYNC: +0.4MS</span>
        </div>
        <div className="flex-1 narvo-border bg-background-dark relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-full flex items-center">
            <div className="h-px w-full bg-forest/20 absolute top-1/2" />
            <svg className="w-full h-full text-primary opacity-80" viewBox="0 0 600 100" preserveAspectRatio="none">
              <path 
                d="M0 50 C 20 40, 40 60, 60 50 C 80 30, 100 70, 120 50 C 140 45, 160 55, 180 50 C 200 20, 220 80, 240 50 C 260 40, 280 60, 300 50 C 320 48, 340 52, 360 50 C 380 10, 400 90, 420 50 C 440 45, 460 55, 480 50 C 500 30, 520 70, 540 50 C 560 40, 580 60, 600 50" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VoiceManagementPage;

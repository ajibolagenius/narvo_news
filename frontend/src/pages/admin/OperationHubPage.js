import React from 'react';
import { RadioTower, Activity, AlertOctagon, Database, Search, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const OperationHubPage = () => {
  const telemetryData = [
    { label: 'NODE_LOAD', value: '42%', status: 'NOMINAL' },
    { label: 'API_LATENCY', value: '12ms', status: 'STABLE', highlight: true },
    { label: 'UPTIME', value: '99.98%', status: 'SLA+' },
    { label: 'ACTIVE_TRAFFIC', value: '4.8GBPS', status: '' },
  ];

  const metricsData = [
    { label: 'ACTIVE_STREAMS', value: '1,240', change: '+12%', icon: RadioTower },
    { label: 'AVG_BITRATE', value: '4.8', unit: 'MBPS', icon: Activity },
    { label: 'ERROR_RATE', value: '0.02', unit: '%', icon: AlertOctagon },
    { label: 'VOL_STORAGE', value: '84', unit: '%', icon: Database, progress: 84 },
  ];

  const alerts = [
    { type: 'warning', title: 'LATENCY_SPIKE: EU_WEST', desc: 'NODE_ID: 88219 // 14:02 UTC', icon: AlertTriangle },
    { type: 'success', title: 'BACKUP_COMPLETE: LAG_S3', desc: 'SUCCESS_VERIFIED // 09:00 UTC', icon: CheckCircle, muted: true },
    { type: 'error', title: 'STREAM_FAIL: #1102', desc: 'AUTH_ERROR: HANDSHAKE_FAIL', icon: XCircle },
  ];

  const streams = [
    { status: 'LIVE', id: '#8821-XJ', source: 'LAGOS_BROADCAST_1', region: 'NG_LAG_CENTRAL', bitrate: '4,500 KBPS', uptime: '02:14:00' },
    { status: 'OFFLINE', id: '#9932-BL', source: 'ABUJA_MAIN_HUB', region: 'NG_ABJ_NORTH', bitrate: '--', uptime: '--' },
    { status: 'LIVE', id: '#7710-AR', source: 'KANO_DATA_INGEST', region: 'NG_KAN_CORE', bitrate: '3,200 KBPS', uptime: '14:22:10' },
  ];

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background-dark" data-testid="operation-hub-page">
      {/* Telemetry Bar */}
      <div className="px-8 py-4 narvo-border-b bg-black/20 flex gap-12 items-center overflow-x-auto shrink-0">
        {telemetryData.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-0.5 min-w-max">
            <span className="mono-ui text-[8px] text-forest font-bold">{item.label}</span>
            <span className={`mono-ui text-[12px] font-bold ${item.highlight ? 'text-primary' : 'text-white'}`}>
              {item.value} {item.status && <span className="text-[9px] text-forest font-normal">{item.status}</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scroll p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-display text-3xl font-bold text-white uppercase tracking-tight">Operation_Overlook</h2>
            <p className="mono-ui text-[10px] text-forest font-bold tracking-widest mt-1">REAL_TIME_NODE_MONITORING</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 narvo-border mono-ui text-[10px] font-bold text-forest hover:bg-forest hover:text-white transition-all flex items-center gap-2">
              <FileText className="w-4 h-4" />
              GEN_REPORT
            </button>
            <button className="px-6 py-3 bg-primary mono-ui text-[10px] font-bold text-background-dark hover:bg-white transition-all">
              + NEW_INGEST
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 bg-forest narvo-border">
          {metricsData.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="bg-background-dark p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="mono-ui text-[9px] text-forest font-bold">{metric.label}</span>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-white">{metric.value}</span>
                  {metric.unit && <span className="mono-ui text-[12px] text-forest font-bold">{metric.unit}</span>}
                  {metric.change && <span className="mono-ui text-[9px] text-primary font-bold">{metric.change}</span>}
                </div>
                {metric.progress && (
                  <div className="h-1 bg-forest/20 relative">
                    <div className="absolute inset-0 bg-primary" style={{ width: `${metric.progress}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Charts & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 narvo-border bg-black/40 p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="mono-ui text-[11px] text-white font-bold tracking-widest">INGEST_VOLUME // 24H_CYCLE</h3>
              <div className="flex gap-4 mono-ui text-[9px] font-bold text-forest">
                <span className="hover:text-white cursor-pointer">1H</span>
                <span className="text-primary underline underline-offset-4">24H</span>
                <span className="hover:text-white cursor-pointer">7D</span>
              </div>
            </div>
            <div className="flex-1 h-64 relative narvo-border bg-background-dark/60 overflow-hidden">
              <div 
                className="absolute inset-0 opacity-5" 
                style={{ backgroundImage: 'linear-gradient(#628141 1px, transparent 1px), linear-gradient(90deg, #628141 1px, transparent 1px)', backgroundSize: '40px 40px' }}
              />
              <svg className="w-full h-full p-4 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0 35 Q 10 32, 20 25 T 40 28 T 60 15 T 80 20 T 100 10 L 100 40 L 0 40 Z" fill="rgba(235, 213, 171, 0.05)" />
                <path d="M0 35 Q 10 32, 20 25 T 40 28 T 60 15 T 80 20 T 100 10" stroke="#EBD5AB" strokeWidth="0.5" fill="none" vectorEffect="non-scaling-stroke" />
                <circle cx="20" cy="25" r="1" fill="#EBD5AB" />
                <circle cx="40" cy="28" r="1" fill="#EBD5AB" />
                <circle cx="60" cy="15" r="1" fill="#EBD5AB" />
                <circle cx="80" cy="20" r="1" fill="#EBD5AB" />
              </svg>
            </div>
          </div>

          {/* Alerts */}
          <div className="narvo-border bg-black/40 p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="mono-ui text-[11px] text-white font-bold tracking-widest">SYSTEM_ALERTS</h3>
              <span className="mono-ui text-[9px] bg-primary/10 text-primary border border-primary px-2 py-0.5">3_NEW</span>
            </div>
            <div className="space-y-4 overflow-y-auto custom-scroll pr-2">
              {alerts.map((alert, idx) => {
                const Icon = alert.icon;
                const colors = {
                  warning: 'text-primary',
                  success: 'text-forest',
                  error: 'text-red-500 bg-red-500/10 border-red-500/30',
                };
                return (
                  <div 
                    key={idx} 
                    className={`p-4 narvo-border bg-forest/5 flex items-start gap-4 hover:bg-forest/10 transition-colors cursor-pointer ${alert.muted ? 'opacity-50' : ''} ${alert.type === 'error' ? 'bg-red-500/10 border-red-500/30' : ''}`}
                  >
                    <Icon className={`w-5 h-5 ${colors[alert.type]}`} />
                    <div className="space-y-1">
                      <p className={`mono-ui text-[10px] font-bold ${alert.type === 'error' ? 'text-red-500' : 'text-white'}`}>{alert.title}</p>
                      <p className={`text-[9px] font-bold ${alert.type === 'error' ? 'text-red-500/70' : 'text-forest'}`}>{alert.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Streams Table */}
        <div className="narvo-border overflow-hidden bg-black/20">
          <div className="px-8 py-6 narvo-border-b flex justify-between items-center bg-background-dark">
            <h3 className="mono-ui text-[11px] text-white font-bold tracking-widest">ACTIVE_SIGNAL_MATRIX</h3>
            <div className="flex gap-4">
              <div className="relative">
                <input 
                  type="text" 
                  className="bg-transparent narvo-border mono-ui text-[9px] text-primary px-8 py-2 w-48 focus:outline-none focus:border-white" 
                  placeholder="SEARCH_ID..."
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-forest w-4 h-4" />
              </div>
              <button className="px-4 py-2 narvo-border mono-ui text-[9px] text-forest font-bold hover:text-white transition-colors uppercase">
                Sort: Status
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="narvo-border-b bg-forest/5 mono-ui text-[9px] text-forest font-bold">
                  <th className="px-8 py-4">SIGNAL</th>
                  <th className="px-8 py-4">ENTITY_ID</th>
                  <th className="px-8 py-4">SOURCE_NODE</th>
                  <th className="px-8 py-4">REGION_LOC</th>
                  <th className="px-8 py-4 text-right">BITRATE</th>
                  <th className="px-8 py-4 text-right">UPTIME</th>
                </tr>
              </thead>
              <tbody className="mono-ui text-[10px] text-forest font-bold">
                {streams.map((stream, idx) => (
                  <tr key={idx} className="narvo-border-b hover:bg-forest/5 transition-colors cursor-pointer">
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-3 ${stream.status === 'OFFLINE' ? 'text-forest opacity-50' : ''}`}>
                        <span className={`w-1.5 h-1.5 ${stream.status === 'LIVE' ? 'bg-primary animate-pulse' : 'bg-forest'}`} />
                        <span className={stream.status === 'LIVE' ? 'text-white' : ''}>{stream.status}</span>
                      </div>
                    </td>
                    <td className={`px-8 py-5 ${stream.status === 'LIVE' ? 'text-primary' : ''}`}>{stream.id}</td>
                    <td className="px-8 py-5">{stream.source}</td>
                    <td className="px-8 py-5 uppercase">{stream.region}</td>
                    <td className={`px-8 py-5 text-right ${stream.status === 'OFFLINE' ? 'opacity-50' : 'text-white'}`}>{stream.bitrate}</td>
                    <td className="px-8 py-5 text-right font-normal">{stream.uptime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OperationHubPage;

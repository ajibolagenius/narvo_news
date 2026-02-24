import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Broadcast, Pulse, WarningOctagon, Database, MagnifyingGlass, FileText, Warning, CheckCircle, XCircle, ArrowClockwise } from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const OperationHubPage = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      const [metricsRes, alertsRes, streamsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/metrics`),
        fetch(`${API_URL}/api/admin/alerts`),
        fetch(`${API_URL}/api/admin/streams`)
      ]);
      
      const [metricsData, alertsData, streamsData] = await Promise.all([
        metricsRes.json(),
        alertsRes.json(),
        streamsRes.json()
      ]);
      
      setMetrics(metricsData);
      setAlerts(alertsData);
      setStreams(streamsData);
      setLastUpdate(new Date().toISOString().slice(11, 19));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const telemetryData = metrics ? [
    { label: 'NODE_LOAD', value: metrics.node_load, status: 'NOMINAL' },
    { label: 'API_LATENCY', value: metrics.api_latency, status: 'STABLE', highlight: true },
    { label: 'UPTIME', value: metrics.uptime, status: 'SLA+' },
    { label: 'ACTIVE_TRAFFIC', value: metrics.active_traffic, status: '' },
  ] : [];

  const metricsData = metrics ? [
    { label: 'ACTIVE_STREAMS', value: metrics.active_streams?.toLocaleString() || '0', change: '+12%', icon: Broadcast },
    { label: 'AVG_BITRATE', value: metrics.avg_bitrate?.toString() || '0', unit: 'MBPS', icon: Pulse },
    { label: 'ERROR_RATE', value: metrics.error_rate?.toFixed(2) || '0', unit: '%', icon: WarningOctagon },
    { label: 'VOL_STORAGE', value: metrics.storage_used?.toString() || '0', unit: '%', icon: Database, progress: metrics.storage_used || 0 },
  ] : [];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return Warning;
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      default: return Warning;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return 'text-primary';
      case 'success': return 'text-forest';
      case 'error': return 'text-red-500';
      default: return 'text-forest';
    }
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background-dark" data-testid="operation-hub-page">
      {/* Telemetry Bar */}
      <div className="px-8 py-4 narvo-border-b bg-background-dark/20 flex gap-12 items-center overflow-x-auto shrink-0">
        {loading ? (
          <span className="mono-ui text-[10px] text-forest animate-pulse">LOADING_TELEMETRY...</span>
        ) : (
          telemetryData.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-0.5 min-w-max">
              <span className="mono-ui text-[8px] text-forest font-bold">{item.label}</span>
              <span className={`mono-ui text-[12px] font-bold ${item.highlight ? 'text-primary' : 'text-content'}`}>
                {item.value} {item.status && <span className="text-[9px] text-forest font-normal">{item.status}</span>}
              </span>
            </div>
          ))
        )}
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="p-2 text-forest hover:text-primary transition-colors"
            title="Refresh Data"
          >
            <ArrowClockwise className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {lastUpdate && (
            <span className="mono-ui text-[8px] text-forest">{t('admin.last_update')}: {lastUpdate}</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scroll p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-display text-3xl font-bold text-content uppercase tracking-tight">Operation_Overlook</h2>
            <p className="mono-ui text-[10px] text-forest font-bold tracking-widest mt-1">REAL_TIME_NODE_MONITORING</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 narvo-border mono-ui text-[10px] font-bold text-forest hover:bg-forest hover:text-content transition-all flex items-center gap-2">
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
                  <span className="font-display text-4xl font-bold text-content">{metric.value}</span>
                  {metric.unit && <span className="mono-ui text-[12px] text-forest font-bold">{metric.unit}</span>}
                  {metric.change && <span className="mono-ui text-[9px] text-primary font-bold">{metric.change}</span>}
                </div>
                {metric.progress !== undefined && (
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
          <div className="lg:col-span-2 narvo-border bg-background-dark/40 p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="mono-ui text-[11px] text-content font-bold tracking-widest">INGEST_VOLUME // 24H_CYCLE</h3>
              <div className="flex gap-4 mono-ui text-[9px] font-bold text-forest">
                <span className="hover:text-content cursor-pointer">1H</span>
                <span className="text-primary underline underline-offset-4">24H</span>
                <span className="hover:text-content cursor-pointer">7D</span>
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
          <div className="narvo-border bg-background-dark/40 p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="mono-ui text-[11px] text-content font-bold tracking-widest">{t('admin.system_alerts')}</h3>
              <span className="mono-ui text-[9px] bg-primary/10 text-primary border border-primary px-2 py-0.5">{alerts.length}_NEW</span>
            </div>
            <div className="space-y-4 overflow-y-auto custom-scroll pr-2">
              {alerts.map((alert, idx) => {
                const Icon = getAlertIcon(alert.type);
                const colorClass = getAlertColor(alert.type);
                return (
                  <div 
                    key={idx} 
                    className={`p-4 narvo-border bg-forest/5 flex items-start gap-4 hover:bg-forest/10 transition-colors cursor-pointer ${alert.type === 'error' ? 'bg-red-500/10 border-red-500/30' : ''}`}
                  >
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                    <div className="space-y-1">
                      <p className={`mono-ui text-[10px] font-bold ${alert.type === 'error' ? 'text-red-500' : 'text-content'}`}>{alert.title}</p>
                      <p className={`text-[9px] font-bold ${alert.type === 'error' ? 'text-red-500/70' : 'text-forest'}`}>{alert.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Streams Table */}
        <div className="narvo-border overflow-hidden bg-background-dark/20">
          <div className="px-8 py-6 narvo-border-b flex justify-between items-center bg-background-dark">
            <h3 className="mono-ui text-[11px] text-content font-bold tracking-widest">ACTIVE_SIGNAL_MATRIX</h3>
            <div className="flex gap-4">
              <div className="relative">
                <input 
                  type="text" 
                  className="bg-transparent narvo-border mono-ui text-[9px] text-primary px-8 py-2 w-48 focus:outline-none focus:border-white" 
                  placeholder="SEARCH_ID..."
                />
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-forest w-4 h-4" />
              </div>
              <button className="px-4 py-2 narvo-border mono-ui text-[9px] text-forest font-bold hover:text-content transition-colors uppercase">
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
                        <span className={stream.status === 'LIVE' ? 'text-content' : ''}>{stream.status}</span>
                      </div>
                    </td>
                    <td className={`px-8 py-5 ${stream.status === 'LIVE' ? 'text-primary' : ''}`}>{stream.id}</td>
                    <td className="px-8 py-5">{stream.source}</td>
                    <td className="px-8 py-5 uppercase">{stream.region}</td>
                    <td className={`px-8 py-5 text-right ${stream.status === 'OFFLINE' ? 'opacity-50' : 'text-content'}`}>{stream.bitrate}</td>
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Warning, Desktop, Cpu, HardDrive, Clock, ArrowCounterClockwise, Plus, Lightning } from '@phosphor-icons/react';

const ServerErrorPage = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toISOString().slice(11, 19));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString().slice(11, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const metrics = [
    { label: 'SERVER_STATUS', value: 'CRITICAL', icon: Desktop, color: 'text-red-500' },
    { label: 'CPU_LOAD', value: '99.9%', icon: Cpu, color: 'text-red-400' },
    { label: 'MEMORY', value: 'OVERFLOW', icon: HardDrive, color: 'text-red-400' },
    { label: 'TIMESTAMP_LOCAL', value: currentTime, icon: Clock, color: 'text-content' },
  ];

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background-dark relative" data-testid="server-error-page">
      {/* Grid Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-10"
        style={{ 
          backgroundImage: 'linear-gradient(#628141 1px, transparent 1px), linear-gradient(90deg, #628141 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      />

      {/* Scanline Effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-5"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }}
      />

      {/* Red Warning Pulse */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-red-500/5 animate-pulse" />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 relative z-10">
        <div className="max-w-4xl w-full space-y-12">
          {/* Large Error Display */}
          <div className="text-center space-y-6">
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-content">
              <span className="text-red-500">[</span>SYSTEM HALT<span className="text-red-500">]</span>
            </h1>
            <div className="flex items-center justify-center gap-3 text-red-500 mono-ui text-xl md:text-2xl font-bold">
              <Warning className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
              <span>ERROR_CODE: 500_INTERNAL_FAILURE</span>
            </div>
            <p className="text-forest max-w-lg mx-auto text-sm md:text-base font-medium mono-ui leading-relaxed lowercase">
              Critical system failure detected. The server encountered an unexpected condition that prevented it from fulfilling the request. Engineers have been alerted.
            </p>
          </div>

          {/* Technical Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-red-500/30 narvo-border border-red-500/50">
            {metrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={idx}
                  className={`p-6 bg-background-dark/95 space-y-2 hover:bg-red-500/10 transition-colors ${idx > 0 ? 'border-l border-red-500/30' : ''}`}
                >
                  <span className="mono-ui text-[8px] text-forest font-bold tracking-widest">{metric.label}</span>
                  <div className={`flex items-center gap-3 ${metric.color} font-display text-xl md:text-2xl font-bold`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="whitespace-nowrap">{metric.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <button 
              onClick={() => window.location.reload()}
              className="h-14 md:h-16 px-8 md:px-10 bg-primary text-background-dark font-bold mono-ui text-sm flex items-center justify-center gap-4 hover:bg-white transition-all shadow-xl group"
              data-testid="retry-btn"
            >
              <ArrowCounterClockwise className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-180 transition-transform duration-500" />
              <span>[RETRY CONNECTION]</span>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="h-14 md:h-16 px-8 md:px-10 narvo-border border-red-500/50 text-red-400 font-bold mono-ui text-sm flex items-center justify-center gap-4 hover:bg-red-500/20 transition-all"
              data-testid="home-btn"
            >
              <Lightning className="w-5 h-5 md:w-6 md:h-6" />
              <span>[RETURN TO BASE]</span>
            </button>
          </div>
        </div>

        {/* Corner Crosshairs */}
        <Plus className="absolute top-12 left-12 w-6 h-6 text-red-500/40 hidden md:block" />
        <Plus className="absolute top-12 right-12 w-6 h-6 text-red-500/40 hidden md:block" />
        <Plus className="absolute bottom-12 left-12 w-6 h-6 text-red-500/40 hidden md:block" />
        <Plus className="absolute bottom-12 right-12 w-6 h-6 text-red-500/40 hidden md:block" />
      </main>

      {/* Footer */}
      <footer className="h-12 narvo-border-t border-red-500/30 bg-background-dark/40 flex items-center justify-between px-8 mono-ui text-[9px] text-forest font-bold relative z-10">
        <span>NARVO_PROTOCOL: V2.6 // EMERGENCY_MODE</span>
        <span>SYSTEM_STATUS: <span className="text-red-500 animate-pulse">CRITICAL</span></span>
      </footer>
    </div>
  );
};

export default ServerErrorPage;

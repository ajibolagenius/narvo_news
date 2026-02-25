import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WarningOctagon, WifiSlash, Desktop, Timer, Clock, ArrowCounterClockwise, Plus } from '@phosphor-icons/react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const metrics = [
    { label: 'PACKET_LOSS', value: '100%', icon: WifiSlash, color: 'text-red-400' },
    { label: 'LAST_NODE', value: 'NGR_WEST_01', icon: Desktop, color: 'text-primary' },
    { label: 'LATENCY', value: '∞ MS', icon: Timer, color: 'text-content' },
    { label: 'TIMESTAMP_LOCAL', value: currentTime, icon: Clock, color: 'text-content' },
  ];

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background-dark relative" data-testid="not-found-page">
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

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 relative z-10">
        <div className="max-w-4xl w-full space-y-12">
          {/* Large Error Display */}
          <div className="text-center space-y-6">
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-content">
              <span className="text-primary">[</span>SIGNAL LOST<span className="text-primary">]</span>
            </h1>
            <div className="flex items-center justify-center gap-3 text-red-500 mono-ui text-xl md:text-2xl font-bold">
              <WarningOctagon className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
              <span>ERROR_CODE: 404_NOT_FOUND</span>
            </div>
            <p className="text-forest max-w-lg mx-auto text-sm md:text-base font-medium mono-ui leading-relaxed lowercase">
              Broadcast upline interrupted. The requested vector could not be located on the current grid. System standby mode active.
            </p>
          </div>

          {/* Technical Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-forest narvo-border">
            {metrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={idx}
                  className={`p-6 bg-background-dark/95 space-y-2 hover:bg-forest/10 transition-colors ${idx > 0 ? 'border-l border-forest' : ''}`}
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

          {/* Action Button */}
          <div className="flex justify-center pt-8">
            <button 
              onClick={() => navigate('/')}
              className="h-14 md:h-16 px-8 md:px-10 bg-primary text-background-dark font-bold mono-ui text-sm flex items-center gap-4 hover:bg-white transition-all shadow-xl group"
              data-testid="reinitialize-btn"
            >
              <ArrowCounterClockwise className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-180 transition-transform duration-500" />
              <span>[RE-INITIALIZE CONNECTION]</span>
            </button>
          </div>
        </div>

        {/* Corner Crosshairs */}
        <Plus className="absolute top-12 left-12 w-6 h-6 text-forest/40 hidden md:block" />
        <Plus className="absolute top-12 right-12 w-6 h-6 text-forest/40 hidden md:block" />
        <Plus className="absolute bottom-12 left-12 w-6 h-6 text-forest/40 hidden md:block" />
        <Plus className="absolute bottom-12 right-12 w-6 h-6 text-forest/40 hidden md:block" />
      </main>

      {/* Footer */}
      <footer className="h-12 narvo-border-t bg-background-dark/40 flex items-center justify-between px-8 mono-ui text-[9px] text-forest font-bold relative z-10">
        <span>NARVO_PROTOCOL: V2.6 // DIAGNOSTIC_MODE</span>
        <span>CONNECTION_STATUS: <span className="text-red-500">INTERRUPTED</span></span>
      </footer>
    </div>
  );
};

export default NotFoundPage;

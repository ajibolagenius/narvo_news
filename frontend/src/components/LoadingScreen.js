import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete, duration = 3000 }) => {
  const [status, setStatus] = useState('Initializing Narrative Engine...');

  useEffect(() => {
    const statuses = [
      'Initializing Narrative Engine...',
      'Connecting to Broadcast Network...',
      'Loading Regional Voices...',
      'Calibrating Signal...',
      'System Ready'
    ];
    let currentIndex = 0;
    const statusInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % statuses.length;
      setStatus(statuses[currentIndex]);
    }, duration / statuses.length);
    const timer = setTimeout(() => { if (onComplete) onComplete(); }, duration);
    return () => { clearInterval(statusInterval); clearTimeout(timer); };
  }, [duration, onComplete]);

  return (
    <div className="h-screen w-full flex flex-col justify-between relative overflow-hidden bg-background-dark" data-testid="loading-screen">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <div className="h-full w-full grid grid-cols-6 gap-0">
          {[...Array(6)].map((_, i) => <div key={i} className="border-r border-forest h-full" />)}
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <div className="h-full w-full grid grid-rows-6 gap-0">
          {[...Array(6)].map((_, i) => <div key={i} className="border-b border-forest w-full" />)}
        </div>
      </div>
      <div className="scanning-line z-0" />
      <header className="relative z-10 w-full p-6 flex justify-between items-start">
        <div className="mono-ui text-[12px] text-forest">
          <span className="block">NARVO_OS_BUILD</span>
          <span className="block opacity-60 mt-1">SECURE_CHANNEL // ENCRYPTED</span>
        </div>
        <div className="mono-ui text-[12px] text-right">
          <span className="block text-primary">SIGNAL_STATUS: OPTIMAL</span>
          <span className="block text-forest opacity-60 mt-1">LATENCY: 12MS</span>
        </div>
      </header>
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center">
        <div className="relative">
          <h1 className="font-display text-8xl md:text-9xl font-bold tracking-tighter text-content mb-12">NARVO</h1>
          <div className="absolute -top-6 -right-10">
            <div className="w-4 h-4 bg-primary animate-pulse" />
          </div>
        </div>
        <div className="w-64 md:w-96 relative h-16 flex items-center justify-center">
          <div className="absolute w-full h-[1px] bg-forest breathing-grid" />
          <div className="absolute w-[1px] h-4 bg-forest left-0 top-1/2 -translate-y-1/2 opacity-50" />
          <div className="absolute w-[1px] h-4 bg-forest right-0 top-1/2 -translate-y-1/2 opacity-50" />
          <div className="absolute left-0 h-[3px] bg-primary loading-bar" style={{ width: '20%', boxShadow: '0 0 10px rgba(235, 213, 171, 0.4)' }} />
        </div>
      </main>
      <footer className="relative z-10 w-full p-8 pb-12 flex flex-col items-center justify-end">
        <div className="mono-ui text-sm tracking-widest text-text-secondary uppercase">
          <span className="mr-2 text-primary">&gt;&gt;&gt;</span>
          <span className="blink-cursor">[{status}]</span>
        </div>
        <div className="mt-6 flex gap-1 items-end h-4">
          {[2, 3, 1, 4, 2, 1].map((h, i) => (
            <div key={i} className={`w-[2px] signal-bar ${i === 3 ? 'bg-primary' : 'bg-forest'}`} style={{ height: `${h * 4}px` }} />
          ))}
        </div>
      </footer>
    </div>
  );
};

export default LoadingScreen;

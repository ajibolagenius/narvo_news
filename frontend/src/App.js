import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// ===========================================
// LOADING SCREEN COMPONENT
// ===========================================
const LoadingScreen = ({ onComplete, duration = 3000 }) => {
  const [progress, setProgress] = useState(0);
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

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, duration / 50);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearInterval(statusInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  return (
    <div 
      className="h-screen w-full flex flex-col justify-between relative overflow-hidden"
      style={{ backgroundColor: '#1B211A' }}
      data-testid="loading-screen"
    >
      {/* Grid Overlay - Vertical Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <div className="h-full w-full grid grid-cols-6 gap-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border-r border-forest h-full" />
          ))}
        </div>
      </div>

      {/* Grid Overlay - Horizontal Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <div className="h-full w-full grid grid-rows-6 gap-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border-b border-forest w-full" />
          ))}
        </div>
      </div>

      {/* Scanning Line Effect */}
      <div className="scanning-line z-0" />

      {/* Header */}
      <header className="relative z-10 w-full p-6 flex justify-between items-start">
        <div className="mono-ui text-[10px] text-forest">
          <span className="block">NARVO_OS_BUILD</span>
          <span className="block opacity-60 mt-1">SECURE_CHANNEL // ENCRYPTED</span>
        </div>
        <div className="mono-ui text-[10px] text-right">
          <span className="block text-primary">SIGNAL_STATUS: OPTIMAL</span>
          <span className="block text-forest opacity-60 mt-1">LATENCY: 12MS</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center">
        {/* Logo with Pulse Indicator */}
        <div className="relative">
          <h1 className="font-display text-8xl md:text-9xl font-bold tracking-tighter text-white mb-12">
            NARVO
          </h1>
          {/* Live Indicator */}
          <div className="absolute -top-6 -right-10">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
          </div>
        </div>

        {/* Loading Bar Container */}
        <div className="w-64 md:w-96 relative h-16 flex items-center justify-center">
          {/* Center Line */}
          <div className="absolute w-full h-[1px] bg-forest breathing-grid" />
          
          {/* End Markers */}
          <div className="absolute w-[1px] h-4 bg-forest left-0 top-1/2 -translate-y-1/2 opacity-50" />
          <div className="absolute w-[1px] h-4 bg-forest right-0 top-1/2 -translate-y-1/2 opacity-50" />
          <div className="absolute w-[1px] h-2 bg-forest left-1/2 top-1/2 -translate-y-1/2 opacity-30" />

          {/* Animated Loading Bar */}
          <div 
            className="absolute left-0 h-[3px] bg-primary loading-bar"
            style={{ 
              width: '20%',
              boxShadow: '0 0 10px rgba(235, 213, 171, 0.4)'
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-8 pb-12 flex flex-col items-center justify-end">
        {/* Status Text */}
        <div className="mono-ui text-sm tracking-widest text-text-secondary uppercase">
          <span className="mr-2 text-primary">&gt;&gt;&gt;</span>
          <span className="blink-cursor">[{status}]</span>
        </div>

        {/* Signal Bars */}
        <div className="mt-6 flex gap-1 items-end h-4">
          <div className="w-[2px] bg-forest h-2 signal-bar" />
          <div className="w-[2px] bg-forest h-3 signal-bar" />
          <div className="w-[2px] bg-forest h-1 signal-bar" />
          <div className="w-[2px] bg-primary h-4 signal-bar" />
          <div className="w-[2px] bg-forest h-2 signal-bar" />
          <div className="w-[2px] bg-forest h-1 signal-bar" />
        </div>
      </footer>
    </div>
  );
};

// ===========================================
// AUDIO CONTEXT & PROVIDER
// ===========================================
const AudioContext = createContext();
export const useAudio = () => useContext(AudioContext);

const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    
    audio.addEventListener('timeupdate', () => setProgress(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      setIsLoading(false);
    });
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
    });
    audio.addEventListener('error', () => {
      setIsLoading(false);
      setIsPlaying(false);
    });
    
    setAudioElement(audio);
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playTrack = async (track) => {
    if (!audioElement) return;
    
    setIsLoading(true);
    setCurrentTrack(track);
    
    if (track.audio_url) {
      audioElement.src = track.audio_url;
      await audioElement.play();
      setIsPlaying(true);
    } else {
      try {
        const response = await fetch(`${API_URL}/api/tts/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: track.narrative || track.summary || track.title,
            voice_id: track.voice_id || 'nova'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          audioElement.src = data.audio_url;
          await audioElement.play();
          setIsPlaying(true);
          track.audio_url = data.audio_url;
        }
      } catch (error) {
        console.error('TTS error:', error);
        setIsLoading(false);
      }
    }
  };

  const togglePlay = () => {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time) => {
    if (audioElement) {
      audioElement.currentTime = time;
      setProgress(time);
    }
  };

  const setVolumeLevel = (level) => {
    setVolume(level);
    if (audioElement) audioElement.volume = level;
  };

  return (
    <AudioContext.Provider value={{
      currentTrack, isPlaying, progress, duration, volume, isLoading,
      playTrack, togglePlay, seek, setVolumeLevel
    }}>
      {children}
    </AudioContext.Provider>
  );
};

// ===========================================
// PHOSPHOR ICONS (SVG Components)
// ===========================================
const Icon = {
  Radio: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M104,168a12,12,0,1,1-12-12A12,12,0,0,1,104,168Zm60-12a12,12,0,1,0,12,12A12,12,0,0,0,164,156Zm68-44v96a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V112A16,16,0,0,1,40,96H196.69L82.34,50.34A8,8,0,1,1,93.66,39l131.3,54.72A16,16,0,0,1,232,112Zm-16,0H40v96H216Z"/>
    </svg>
  ),
  Play: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/>
    </svg>
  ),
  Pause: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"/>
    </svg>
  ),
  SkipBack: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M199.81,34a16,16,0,0,0-16.24.43L64,109.23V40a8,8,0,0,0-16,0V216a8,8,0,0,0,16,0V146.77l119.57,74.78A15.95,15.95,0,0,0,208,208.12V47.88A15.86,15.86,0,0,0,199.81,34Z"/>
    </svg>
  ),
  SkipForward: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M208,40V216a8,8,0,0,1-16,0V146.77L72.43,221.55A15.95,15.95,0,0,1,48,208.12V47.88A15.86,15.86,0,0,1,56.19,34a16,16,0,0,1,16.24.43L192,109.23V40a8,8,0,0,1,16,0Z"/>
    </svg>
  ),
  SpeakerHigh: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM32,96H72v64H32Zm112,111.64-56-43.55V91.91l56-43.55Zm54-106.08a40,40,0,0,1,0,52.88,8,8,0,0,1-12-10.58,24,24,0,0,0,0-31.72,8,8,0,0,1,12-10.58Zm32-22.12a8,8,0,0,1,0,11.31,104,104,0,0,1,0,126.5,8,8,0,0,1-12-10.62,88,88,0,0,0,0-105.26,8,8,0,0,1,12-10.62A8,8,0,0,1,230,79.44Z"/>
    </svg>
  ),
  SpeakerX: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM32,96H72v64H32Zm112,111.64-56-43.55V91.91l56-43.55ZM227.31,128l18.35-18.34a8,8,0,0,0-11.32-11.32L216,116.69l-18.34-18.35a8,8,0,0,0-11.32,11.32L204.69,128l-18.35,18.34a8,8,0,0,0,11.32,11.32L216,139.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z"/>
    </svg>
  ),
  MagnifyingGlass: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
    </svg>
  ),
  Gear: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"/>
    </svg>
  ),
  User: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/>
    </svg>
  ),
  SignOut: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z"/>
    </svg>
  ),
  GlobeHemisphereWest: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.62,87.62,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,166,49.1l-.36-.65A88.11,88.11,0,0,1,216,128ZM40,128a87.53,87.53,0,0,1,8.54-37.8l11.34,30.27a16,16,0,0,0,11.62,10l21.43,4.61L96.74,143a16.09,16.09,0,0,0,14.4,9h1.48l-7.23,38.61-16.54,14.57A16,16,0,0,0,84,218.61l0,.05A88.18,88.18,0,0,1,40,128Zm60.79,84.62,16.19-14.26a16,16,0,0,0,5.37-14.05l5.49-29.29,30.58,18.8L151.77,192a16,16,0,0,0-.21,12.84A87.68,87.68,0,0,1,100.79,212.62Z"/>
    </svg>
  ),
  Microphone: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"/>
    </svg>
  ),
  Archive: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM208,192H48V104H208ZM224,88H32V64H224V88Zm-72,48a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,136Z"/>
    </svg>
  ),
  Coffee: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,120,64Zm32,0a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,152,64Zm96,56v8a40,40,0,0,1-37.51,39.91,96.59,96.59,0,0,1-27,40.09H208a8,8,0,0,1,0,16H32a8,8,0,0,1,0-16H56.54A96.3,96.3,0,0,1,24,136V88a8,8,0,0,1,8-8H208A40,40,0,0,1,248,120ZM40,136a80.27,80.27,0,0,0,45.12,72h69.76A80.27,80.27,0,0,0,200,136V96H40Zm192-16a24,24,0,0,0-16-22.62V136a95.78,95.78,0,0,1-1.2,15A24,24,0,0,0,232,128Z"/>
    </svg>
  ),
  CaretRight: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/>
    </svg>
  ),
  Check: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
    </svg>
  ),
  ArrowsClockwise: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M197.67,186.37a8,8,0,0,1,0,11.29C196.58,198.73,170.82,224,128,224c-37.39,0-64-29.46-72-40.11V208a8,8,0,0,1-16,0V160a8,8,0,0,1,8-8H96a8,8,0,0,1,0,16H56.22C61.94,181.63,83.65,208,128,208c33.16,0,53.53-19.8,58.33-24.71A8,8,0,0,1,197.67,186.37ZM216,40a8,8,0,0,0-8,8V72.11C200,61.46,173.39,32,136,32c-42.82,0-68.58,25.27-69.66,26.34a8,8,0,0,0,11.32,11.32C78.47,68.8,98.84,48,132,48c44.35,0,66.06,26.37,71.78,40H164a8,8,0,0,0,0,16h48a8,8,0,0,0,8-8V48A8,8,0,0,0,216,40Z"/>
    </svg>
  ),
  List: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/>
    </svg>
  ),
  Sun: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"/>
    </svg>
  ),
  Building: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M232,224H208V32h8a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16h8V224H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM64,32H192V224H160V184a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v40H64Zm80,192H112V192h32ZM88,64a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,64Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,64ZM88,104a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,104Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,104ZM88,144a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H96A8,8,0,0,1,88,144Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,144Z"/>
    </svg>
  ),
  ChartLine: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31,40,179.31V200H224A8,8,0,0,1,232,208Z"/>
    </svg>
  ),
  Cpu: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Zm88,24a8,8,0,0,1-8,8H208v16a24,24,0,0,1-24,24H168v16a8,8,0,0,1-16,0V216H104v16a8,8,0,0,1-16,0V216H72a24,24,0,0,1-24-24V176H32a8,8,0,0,1,0-16H48V104H32a8,8,0,0,1,0-16H48V72A24,24,0,0,1,72,48H88V32a8,8,0,0,1,16,0V48h48V32a8,8,0,0,1,16,0V48h16a24,24,0,0,1,24,24V88h16a8,8,0,0,1,0,16H208v48h16A8,8,0,0,1,232,168ZM192,72a8,8,0,0,0-8-8H72a8,8,0,0,0-8,8V184a8,8,0,0,0,8,8H184a8,8,0,0,0,8-8Z"/>
    </svg>
  ),
  Trophy: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M232,64H208V48a8,8,0,0,0-8-8H56a8,8,0,0,0-8,8V64H24A16,16,0,0,0,8,80V96a40,40,0,0,0,40,40h3.65A80.13,80.13,0,0,0,120,191.61V216H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V191.58A80.14,80.14,0,0,0,204.37,136H208a40,40,0,0,0,40-40V80A16,16,0,0,0,232,64ZM48,120A24,24,0,0,1,24,96V80H48v32q0,4,.39,8H48Zm144-8V56H64v56a64,64,0,0,0,128,0Zm40-16a24,24,0,0,1-24,24h-.5a81.81,81.81,0,0,0,.5-8.9V80h24Z"/>
    </svg>
  ),
  Heart: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"/>
    </svg>
  ),
  Newspaper: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,160Z"/>
    </svg>
  ),
};

// ===========================================
// LANDING PAGE
// ===========================================
const LandingPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/metrics`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background-dark relative" data-testid="landing-page">
      {/* Grid Background */}
      <div className="grid-overlay">
        <div className="grid-cols-overlay">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border-r border-forest h-full" />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="swiss-border-b relative z-10">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <Icon.Radio className="w-8 h-8 text-primary" />
            <span className="font-display text-xl font-bold text-text-primary">NARVO</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="mono-ui text-[10px] text-forest">
              SYSTEM_STATUS: <span className="text-primary">ONLINE</span>
            </span>
            <button
              onClick={() => navigate('/auth')}
              className="btn-command text-xs"
              data-testid="login-btn"
            >
              [INIT_AUTH]
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10">
        <div className="grid lg:grid-cols-2">
          {/* Left Panel */}
          <div className="swiss-border-r swiss-border-b p-12 lg:p-16 flex flex-col justify-center min-h-[70vh]">
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight tracking-tight">
              [NARVO: THE LOCAL PULSE, REFINED.]
            </h1>
            <p className="text-text-secondary text-lg mb-8 leading-relaxed max-w-xl">
              Precision-engineered news broadcast platform. High-fidelity regional audio. 
              Broadcast-grade narrative synthesis powered by advanced AI.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="btn-command"
                data-testid="join-broadcast-btn"
              >
                [Join the Broadcast]
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-command-outline"
                data-testid="demo-btn"
              >
                [Oya, Play]
              </button>
            </div>
          </div>
          
          {/* Right Panel - Signal Visualization */}
          <div className="swiss-border-b p-8 lg:p-12 bg-surface">
            {/* Waveform Display */}
            <div className="swiss-border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="mono-ui text-[10px] text-text-dim">SIGNAL_WAVEFORM</span>
                <span className="mono-ui text-[10px] text-primary">LIVE</span>
              </div>
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-forest breathing-grid"
                    style={{ 
                      height: `${Math.random() * 80 + 20}%`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Metrics Grid */}
            {metrics && (
              <div className="grid grid-cols-2 gap-4">
                <div className="swiss-cell p-4">
                  <span className="mono-ui text-[10px] text-text-dim block mb-2">LISTENERS_TODAY</span>
                  <span className="font-display text-2xl text-text-primary">{metrics.listeners_today}</span>
                </div>
                <div className="swiss-cell p-4">
                  <span className="mono-ui text-[10px] text-text-dim block mb-2">SOURCES_ONLINE</span>
                  <span className="font-display text-2xl text-text-primary">{metrics.sources_online}</span>
                </div>
                <div className="swiss-cell p-4">
                  <span className="mono-ui text-[10px] text-text-dim block mb-2">SIGNAL_STRENGTH</span>
                  <span className="font-display text-2xl text-primary">{metrics.signal_strength}</span>
                </div>
                <div className="swiss-cell p-4">
                  <span className="mono-ui text-[10px] text-text-dim block mb-2">NETWORK_LOAD</span>
                  <span className="font-display text-2xl text-text-primary">{metrics.network_load}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10">
        <div className="grid lg:grid-cols-3">
          <div className="swiss-border-r swiss-border-b p-8">
            <Icon.Building className="w-8 h-8 text-text-secondary mb-4" />
            <h3 className="font-display text-lg text-text-primary mb-3">[THE STATION]</h3>
            <p className="text-text-dim text-sm leading-relaxed">
              Your personalized broadcast hub. Continuous news stream engineered for high-fidelity consumption.
            </p>
          </div>
          
          <div className="swiss-border-r swiss-border-b p-8">
            <Icon.Microphone className="w-8 h-8 text-text-secondary mb-4" />
            <h3 className="font-display text-lg text-text-primary mb-3">[REGIONAL VOICES]</h3>
            <p className="text-text-dim text-sm leading-relaxed">
              Authentic local accents. Pidgin, Yoruba, Hausa, Igbo. The voices of Africa, refined.
            </p>
          </div>
          
          <div className="swiss-border-b p-8">
            <Icon.Check className="w-8 h-8 text-text-secondary mb-4" />
            <h3 className="font-display text-lg text-text-primary mb-3">[TRUTH PROTOCOL]</h3>
            <p className="text-text-dim text-sm leading-relaxed">
              Every narrative tagged. Source verified. Transparency engineered into every broadcast.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="swiss-border-t relative z-10">
        <div className="p-6 flex items-center justify-between">
          <span className="mono-ui text-[10px] text-text-dim">
            © 2026 NARVO BROADCAST SYSTEMS
          </span>
          <span className="mono-ui text-[10px] text-text-dim">
            THE LOCAL PULSE, REFINED.
          </span>
        </div>
      </footer>
    </div>
  );
};

// ===========================================
// AUTH PAGE (Simplified placeholder)
// ===========================================
const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = { email, name: email.split('@')[0] };
    localStorage.setItem('narvo_user', JSON.stringify(user));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background-dark flex" data-testid="auth-page">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col w-1/2 swiss-border-r p-12 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <Icon.Radio className="text-primary w-10 h-10" />
            <span className="font-display text-2xl font-bold text-text-primary">NARVO</span>
          </div>
          <h2 className="font-display text-3xl text-text-primary mb-4">
            [ACCESS THE BROADCAST]
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Initialize your connection to the precision-engineered news network.
          </p>
        </div>
        
        <div className="swiss-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-primary animate-pulse" />
            <span className="mono-ui text-[10px] text-primary">SYSTEM_READY</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-forest breathing-grid"
                style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="swiss-cell p-8">
            <h3 className="font-display text-xl text-text-primary mb-6">
              [{isLogin ? 'LOGIN_CONSOLE' : 'REGISTER_CONSOLE'}]
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mono-ui text-[10px] text-text-dim block mb-2">EMAIL_ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  placeholder="user@narvo.io"
                  required
                  data-testid="email-input"
                />
              </div>
              
              <div className="mb-6">
                <label className="mono-ui text-[10px] text-text-dim block mb-2">ACCESS_KEY</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  placeholder="••••••••"
                  required
                  data-testid="password-input"
                />
              </div>
              
              <button type="submit" className="btn-command w-full mb-4" data-testid="auth-submit-btn">
                {isLogin ? '[AUTHENTICATE]' : '[REGISTER]'}
              </button>
            </form>
            
            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="mono-ui text-[10px] text-text-secondary hover:text-primary"
                data-testid="toggle-auth-mode"
              >
                {isLogin ? '[CREATE_NEW_ACCESS]' : '[EXISTING_USER_LOGIN]'}
              </button>
            </div>
          </div>
          
          <Link to="/" className="block text-center mono-ui text-[10px] text-text-dim mt-6 hover:text-primary">
            ← [BACK_TO_LANDING]
          </Link>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// DASHBOARD PAGE (Simplified)
// ===========================================
const DashboardPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying, isLoading: audioLoading } = useAudio();

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=10`)
      .then(res => res.json())
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const user = JSON.parse(localStorage.getItem('narvo_user') || '{}');

  return (
    <div className="min-h-screen bg-background-dark" data-testid="dashboard-page">
      {/* Header */}
      <header className="swiss-border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Icon.Radio className="text-primary w-6 h-6" />
            <span className="font-display text-lg font-bold text-text-primary">NARVO</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="mono-ui text-[10px] text-forest">
              STATUS: <span className="text-primary">ONLINE</span>
            </span>
            <Link to="/search" data-testid="search-btn">
              <Icon.MagnifyingGlass className="w-5 h-5 text-text-dim hover:text-primary" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 swiss-border-r min-h-screen hidden lg:block">
          <nav className="p-4">
            <span className="mono-ui text-[10px] text-text-dim block mb-4">NAVIGATION</span>
            
            <Link to="/briefing" className="flex items-center gap-3 p-3 swiss-border bg-primary/10 border-primary mb-2" data-testid="nav-briefing">
              <Icon.Coffee className="w-4 h-4 text-primary" />
              <span className="mono-ui text-xs text-primary">Morning Briefing</span>
            </Link>
            
            <Link to="/dashboard" className="flex items-center gap-3 p-3 swiss-border mb-2" data-testid="nav-stream">
              <Icon.Radio className="w-4 h-4 text-text-dim" />
              <span className="mono-ui text-xs text-text-dim">Primary Stream</span>
            </Link>
            
            <Link to="/voices" className="flex items-center gap-3 p-3 swiss-border mb-2" data-testid="nav-voices">
              <Icon.Microphone className="w-4 h-4 text-text-dim" />
              <span className="mono-ui text-xs text-text-dim">Voice Studio</span>
            </Link>
            
            <Link to="/settings" className="flex items-center gap-3 p-3 swiss-border" data-testid="nav-settings">
              <Icon.Gear className="w-4 h-4 text-text-dim" />
              <span className="mono-ui text-xs text-text-dim">Settings</span>
            </Link>
          </nav>
          
          {/* User */}
          <div className="absolute bottom-20 left-0 w-64 p-4 swiss-border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface swiss-border flex items-center justify-center">
                <Icon.User className="w-5 h-5 text-text-secondary" />
              </div>
              <div>
                <span className="mono-ui text-xs text-text-primary block">{user.name || 'Guest'}</span>
                <span className="mono-ui text-[10px] text-text-dim">PRO_MEMBER</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl text-text-primary mb-1">[Live Feed]</h2>
              <span className="mono-ui text-[10px] text-text-secondary">Welcome, Oga {user.name || 'Guest'}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="flex items-end gap-1 h-8 justify-center mb-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="w-2 bg-forest breathing-grid" style={{ height: `${Math.random() * 80 + 20}%` }} />
                  ))}
                </div>
                <span className="mono-ui text-xs text-text-secondary">[PROCESSING SIGNAL...]</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4" data-testid="news-feed">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="swiss-cell p-6 hover:border-text-secondary cursor-pointer transition-colors"
                  onClick={() => navigate(`/news/${item.id}`)}
                  data-testid={`news-card-${item.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="tag">{item.category?.toUpperCase()}</span>
                    <span className="mono-ui text-[10px] text-text-dim">{item.source}</span>
                  </div>
                  
                  <h3 className="font-display text-lg text-text-primary mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-text-dim text-sm mb-4 line-clamp-2">{item.summary}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {item.tags?.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); playTrack(item); }}
                      className="btn-command text-[10px] flex items-center gap-2"
                      disabled={audioLoading && currentTrack?.id === item.id}
                      data-testid={`play-btn-${item.id}`}
                    >
                      {currentTrack?.id === item.id && isPlaying ? (
                        <><Icon.Pause className="w-3 h-3" /> [PAUSE]</>
                      ) : (
                        <><Icon.Play className="w-3 h-3" /> [LISTEN]</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ===========================================
// PLACEHOLDER PAGES
// ===========================================
const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  useEffect(() => {
    fetch(`${API_URL}/api/news/${id}`)
      .then(res => res.json())
      .then(data => setNews(data))
      .catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  if (!news) return <LoadingScreen duration={2000} />;

  return (
    <div className="min-h-screen bg-background-dark" data-testid="news-detail-page">
      <header className="swiss-border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-text-dim hover:text-primary">
            ← [BACK]
          </button>
          <span className="mono-ui text-[10px] text-text-secondary">
            [TRUTH TAG: <span className="text-primary">{news.truth_score}%</span>]
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <span className="tag mb-4 inline-block">{news.category?.toUpperCase()}</span>
        <h1 className="font-display text-3xl text-text-primary mb-6">{news.title}</h1>
        
        <div className="swiss-cell p-6 mb-8">
          <button onClick={() => playTrack(news)} className="btn-command flex items-center gap-2">
            {currentTrack?.id === news.id && isPlaying ? (
              <><Icon.Pause className="w-4 h-4" /> [PAUSE BROADCAST]</>
            ) : (
              <><Icon.Play className="w-4 h-4" /> [OYA, PLAY]</>
            )}
          </button>
        </div>
        
        <div className="swiss-cell p-6">
          <h3 className="font-display text-lg text-text-primary mb-4">[The Full Gist]</h3>
          <p className="text-text-secondary leading-relaxed">{news.narrative || news.summary}</p>
        </div>
      </div>
    </div>
  );
};

const VoiceStudioPage = () => {
  const navigate = useNavigate();
  const [voices, setVoices] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/voices`)
      .then(res => res.json())
      .then(data => { setVoices(data); setSelected(data[0]); });
  }, []);

  return (
    <div className="min-h-screen bg-background-dark" data-testid="voice-studio-page">
      <header className="swiss-border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-text-dim hover:text-primary">← [BACK]</button>
          <span className="font-display text-lg text-text-primary">[Regional Voice Studio]</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {voices.map((voice) => (
            <div
              key={voice.id}
              className={`swiss-cell p-6 cursor-pointer ${selected?.id === voice.id ? 'border-primary' : ''}`}
              onClick={() => setSelected(voice)}
            >
              <h3 className="font-display text-lg text-text-primary mb-1">{voice.name}</h3>
              <span className="tag mb-3 inline-block">{voice.accent}</span>
              <p className="text-text-dim text-sm">{voice.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MorningBriefingPage = () => {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const generateBriefing = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/briefing/generate?voice_id=nova`);
      if (response.ok) setBriefing(await response.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { generateBriefing(); }, []);

  return (
    <div className="min-h-screen bg-background-dark" data-testid="briefing-page">
      <header className="swiss-border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-text-dim hover:text-primary">← [BACK]</button>
          <span className="font-display text-lg text-text-primary">[Morning Briefing]</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-20">
            <span className="mono-ui text-xs text-text-secondary">[GENERATING BRIEFING...]</span>
          </div>
        ) : briefing ? (
          <>
            <div className="swiss-cell p-6 mb-6">
              <h2 className="font-display text-xl text-text-primary mb-2">{briefing.title}</h2>
              <span className="tag">{briefing.duration_estimate}</span>
              <button
                onClick={() => playTrack({ id: briefing.id, title: briefing.title, audio_url: briefing.audio_url })}
                className="btn-command mt-4"
              >
                {currentTrack?.id === briefing.id && isPlaying ? '[PAUSE]' : '[PLAY BRIEFING]'}
              </button>
            </div>
            
            <div className="swiss-cell p-6">
              <h3 className="font-display text-lg text-text-primary mb-4">Stories Included</h3>
              {briefing.stories?.map((story, i) => (
                <div key={i} className="swiss-border p-4 mb-2">
                  <span className="mono-ui text-[10px] text-primary mr-2">{i + 1}.</span>
                  <span className="text-text-primary text-sm">{story.title}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <button onClick={generateBriefing} className="btn-command">[GENERATE BRIEFING]</button>
        )}
      </div>
    </div>
  );
};

const SearchPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background-dark" data-testid="search-page">
      <header className="swiss-border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-text-dim hover:text-primary">← [BACK]</button>
          <span className="font-display text-lg text-text-primary">[Search Center]</span>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6">
        <input type="text" placeholder="Search news..." className="w-full mb-6" />
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background-dark" data-testid="settings-page">
      <header className="swiss-border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="mono-ui text-xs text-text-dim hover:text-primary">← [BACK]</button>
          <span className="font-display text-lg text-text-primary">[System Settings]</span>
        </div>
      </header>
      <div className="max-w-2xl mx-auto p-6">
        <div className="swiss-cell p-6 mb-4">
          <span className="mono-ui text-[10px] text-text-dim block mb-4">DISPLAY</span>
          <div className="flex items-center justify-between">
            <span className="text-text-primary text-sm">Night Vision Mode</span>
            <div className="w-12 h-6 bg-primary" />
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem('narvo_user'); navigate('/'); }} className="btn-command-outline w-full">
          [END SESSION / LOG OUT]
        </button>
      </div>
    </div>
  );
};

// ===========================================
// AUDIO PLAYER
// ===========================================
const AudioPlayer = () => {
  const { currentTrack, isPlaying, progress, duration, togglePlay, seek, isLoading } = useAudio();
  
  if (!currentTrack) return null;

  const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 swiss-border-t bg-background-dark z-50" data-testid="audio-player">
      <div className="flex items-center gap-4 px-6 py-3">
        <div className="flex-1 min-w-0">
          <span className="mono-ui text-[10px] text-text-secondary block truncate">{currentTrack.source || 'NARVO'}</span>
          <span className="font-display text-sm text-text-primary block truncate">{currentTrack.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => seek(Math.max(0, progress - 10))} className="text-text-dim hover:text-primary">
            <Icon.SkipBack className="w-5 h-5" />
          </button>
          
          <button onClick={togglePlay} className="w-10 h-10 bg-primary flex items-center justify-center" disabled={isLoading}>
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-background-dark border-t-transparent animate-spin" />
            ) : isPlaying ? (
              <Icon.Pause className="w-5 h-5 text-background-dark" />
            ) : (
              <Icon.Play className="w-5 h-5 text-background-dark" />
            )}
          </button>
          
          <button onClick={() => seek(Math.min(duration, progress + 10))} className="text-text-dim hover:text-primary">
            <Icon.SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 w-48">
          <span className="mono-ui text-[10px] text-text-dim">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1"
          />
          <span className="mono-ui text-[10px] text-text-dim">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// MAIN APP
// ===========================================
function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} duration={3500} />;
  }

  return (
    <AudioProvider>
      <Router>
        <div className="pb-20">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/briefing" element={<MorningBriefingPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/voices" element={<VoiceStudioPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AudioPlayer />
        </div>
      </Router>
    </AudioProvider>
  );
}

export default App;

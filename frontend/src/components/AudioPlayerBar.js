import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Headphones, ChevronLeft, Play, Pause, ChevronRight, Volume2, List } from 'lucide-react';

const AudioPlayerBar = () => {
  const { currentTrack, isPlaying, progress, duration, togglePlay, seek, isLoading, volume, setVolumeLevel } = useAudio();

  const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <footer className="flex flex-col bg-background-dark border-t-2 border-primary z-20 shrink-0" data-testid="audio-player-bar">
      {/* News Ticker */}
      <div className="h-8 bg-primary text-background-dark flex items-center overflow-hidden marquee-container">
        <div className="marquee-content flex items-center gap-12 font-mono text-[10px] font-bold uppercase tracking-wider">
          <span>{'//'} Narvo Intelligence Update: Regional Manufacturing Hubs report 12% growth.</span>
          <span>{'//'} Signal Quality maintained at 100% across all sub-nodes.</span>
          <span>{'//'} Breaking: New localized dialect synthesis node active in Ghana.</span>
          <span>{'//'} Narvo Intelligence Update: Regional Manufacturing Hubs report 12% growth.</span>
          <span>{'//'} Signal Quality maintained at 100% across all sub-nodes.</span>
          <span>{'//'} Breaking: New localized dialect synthesis node active in Ghana.</span>
        </div>
      </div>

      {/* Controls Console */}
      <div className="h-20 flex items-center justify-between px-8 bg-background-dark narvo-border-t">
        {/* Track Info */}
        <div className="flex items-center gap-6 w-1/4">
          <div className="h-12 w-12 narvo-border flex items-center justify-center bg-surface group cursor-pointer hover:border-primary transition-colors">
            <Headphones className="text-primary w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-sm text-white uppercase tracking-tight line-clamp-1 truncate">
              {currentTrack?.title || 'No Track Selected'}
            </span>
            <span className="mono-ui text-[9px] text-forest truncate">
              {currentTrack?.source || 'NARVO // Standby'}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex-1 max-w-2xl flex flex-col items-center gap-2">
          <div className="flex items-center gap-8">
            <button onClick={() => seek(Math.max(0, progress - 15))} className="text-forest hover:text-white transition-colors" data-testid="player-prev">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-primary text-background-dark flex items-center justify-center hover:bg-white transition-all"
              disabled={isLoading || !currentTrack}
              data-testid="player-play-pause"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-background-dark border-t-transparent animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            <button onClick={() => seek(Math.min(duration, progress + 15))} className="text-forest hover:text-white transition-colors" data-testid="player-next">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full flex items-center gap-2">
            <span className="mono-ui text-[9px] text-forest w-8 text-right">{formatTime(progress)}</span>
            <div
              className="flex-1 h-1 bg-forest/20 relative cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seek(pct * duration);
              }}
            >
              <div className="absolute top-0 left-0 h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progressPct}%` }}
              />
            </div>
            <span className="mono-ui text-[9px] text-forest/50 w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Extras */}
        <div className="flex items-center justify-end gap-6 w-1/4">
          <div className="hidden sm:flex items-center gap-3">
            <Volume2 className="text-forest w-4 h-4" />
            <div className="w-20 h-1 bg-forest/20 relative cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setVolumeLevel((e.clientX - rect.left) / rect.width);
            }}>
              <div className="absolute top-0 left-0 h-full bg-forest" style={{ width: `${volume * 100}%` }} />
            </div>
          </div>
          <button className="text-forest hover:text-primary transition-colors"><List className="w-6 h-6" /></button>
        </div>
      </div>
    </footer>
  );
};

export default AudioPlayerBar;

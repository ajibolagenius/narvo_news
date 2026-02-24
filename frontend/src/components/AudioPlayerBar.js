import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Headphones, ChevronLeft, Play, Pause, ChevronRight, Volume2 } from 'lucide-react';

const AudioPlayerBar = () => {
  const { currentTrack, isPlaying, progress, duration, togglePlay, seek, isLoading, volume, setVolumeLevel } = useAudio();

  const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <footer className="hidden md:flex flex-col bg-background-dark border-t-2 border-primary z-20 shrink-0" data-testid="audio-player-bar">
      {/* Controls Console */}
      <div className="h-[72px] flex items-center justify-between px-6 bg-background-dark narvo-border-t">
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/4 min-w-0">
          <div className="h-11 w-11 narvo-border flex items-center justify-center bg-surface shrink-0">
            <Headphones className="text-primary w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-sm text-white uppercase tracking-tight truncate">
              {currentTrack?.title || 'No Track Selected'}
            </span>
            <span className="mono-ui text-[10px] text-forest truncate">
              {currentTrack?.source || 'NARVO // Standby'}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-6">
            <button onClick={() => seek(Math.max(0, progress - 15))} className="text-forest hover:text-white transition-colors" data-testid="player-prev">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 bg-primary text-background-dark flex items-center justify-center hover:bg-white transition-all"
              disabled={isLoading || !currentTrack}
              data-testid="player-play-pause"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-background-dark border-t-transparent animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <button onClick={() => seek(Math.min(duration, progress + 15))} className="text-forest hover:text-white transition-colors" data-testid="player-next">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full flex items-center gap-2">
            <span className="mono-ui text-[10px] text-forest w-8 text-right">{formatTime(progress)}</span>
            <div
              className="flex-1 h-1 bg-forest/20 relative cursor-pointer group"
              onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * duration); }}
            >
              <div className="absolute top-0 left-0 h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="mono-ui text-[10px] text-forest/50 w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-end gap-4 w-1/4">
          <div className="hidden lg:flex items-center gap-3">
            <Volume2 className="text-forest w-4 h-4" />
            <div className="w-20 h-1 bg-forest/20 relative cursor-pointer" onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setVolumeLevel((e.clientX - r.left) / r.width);
            }}>
              <div className="absolute top-0 left-0 h-full bg-forest" style={{ width: `${volume * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AudioPlayerBar;

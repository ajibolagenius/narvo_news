import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic, X, Trash2, GripVertical } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

const formatTime = (s) => {
  if (!s || isNaN(s)) return '00:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const AudioPlayerBar = () => {
  const { t } = useTranslation();
  const {
    currentTrack, isPlaying, isLoading, currentTime, duration,
    togglePlay, seek, playNext, playPrev,
    queue, queueIndex, removeFromQueue, clearQueue, playFromQueue,
  } = useAudio();
  const [showQueue, setShowQueue] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeRef = useRef(null);

  // Apply volume to any playing audio
  useEffect(() => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.volume = isMuted ? 0 : volume;
    });
  }, [volume, isMuted]);

  // Close volume slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target)) {
        setShowVolumeSlider(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(pct);
    if (pct > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <footer className="hidden md:flex flex-col bg-background-dark border-t-2 border-primary z-20 shrink-0 relative" data-testid="audio-player-bar">
      {/* Queue Panel */}
      {showQueue && (
        <div className="absolute bottom-full right-0 w-96 max-h-80 bg-background-dark narvo-border border-b-0 overflow-hidden flex flex-col z-50" data-testid="queue-panel">
          <div className="flex items-center justify-between px-4 py-3 narvo-border-b bg-surface/10">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-primary" />
              <span className="mono-ui text-[10px] text-white font-bold">QUEUE // {queue.length} TRACKS</span>
            </div>
            <div className="flex items-center gap-2">
              {queue.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="mono-ui text-[8px] text-forest hover:text-red-400 font-bold transition-colors"
                  data-testid="clear-queue-btn"
                >
                  CLEAR_ALL
                </button>
              )}
              <button onClick={() => setShowQueue(false)} className="p-1 hover:bg-surface/20 transition-colors">
                <X className="w-3.5 h-3.5 text-forest" />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto custom-scroll flex-1">
            {queue.length === 0 ? (
              <div className="p-8 text-center">
                <ListMusic className="w-8 h-8 text-forest/30 mx-auto mb-3" />
                <p className="mono-ui text-[10px] text-forest">{t('player.no_track')}</p>
                <p className="mono-ui text-[8px] text-forest/50 mt-1">Add stories to build your playlist</p>
              </div>
            ) : (
              queue.map((track, idx) => (
                <div
                  key={track.id || idx}
                  className={`flex items-center gap-3 px-4 py-3 transition-all group cursor-pointer ${
                    idx === queueIndex ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-surface/10 border-l-2 border-transparent'
                  }`}
                  onClick={() => playFromQueue(idx)}
                  data-testid={`queue-item-${idx}`}
                >
                  <GripVertical className="w-3 h-3 text-forest/30 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className={`mono-ui text-[10px] font-bold block truncate ${
                      idx === queueIndex ? 'text-primary' : 'text-white'
                    }`}>
                      {track.title || `Track ${idx + 1}`}
                    </span>
                    <span className="mono-ui text-[8px] text-forest block truncate">
                      {track.source || 'Unknown'} {idx === queueIndex && isPlaying ? '// NOW_PLAYING' : ''}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromQueue(track.id); }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 text-forest transition-all"
                    data-testid={`queue-remove-${idx}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Controls Console */}
      <div className="h-[72px] flex items-center justify-between px-6 bg-background-dark narvo-border-t">
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/4 min-w-0">
          {currentTrack ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-primary/20 narvo-border shrink-0 flex items-center justify-center">
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                ) : isPlaying ? (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map(i => <div key={i} className="w-1 bg-primary animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                ) : (
                  <Play className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <p className="mono-ui text-[10px] text-white font-bold truncate">{currentTrack.title || 'Unknown'}</p>
                <p className="mono-ui text-[8px] text-forest truncate">{currentTrack.source || t('player.standby')}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface/20 narvo-border shrink-0" />
              <span className="mono-ui text-[10px] text-forest">{t('player.standby')}</span>
            </div>
          )}
        </div>

        {/* Center Controls */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-md">
          <div className="flex items-center gap-4">
            <button
              onClick={playPrev}
              className="text-forest hover:text-white transition-colors disabled:opacity-30"
              disabled={queueIndex <= 0}
              data-testid="player-prev"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-10 h-10 bg-primary flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
              data-testid="player-play-pause"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-background-dark border-t-transparent animate-spin rounded-full" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-background-dark" />
              ) : (
                <Play className="w-5 h-5 text-background-dark ml-0.5" />
              )}
            </button>
            <button
              onClick={playNext}
              className="text-forest hover:text-white transition-colors disabled:opacity-30"
              disabled={queueIndex >= queue.length - 1}
              data-testid="player-next"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-3 w-full">
            <span className="mono-ui text-[9px] text-forest w-10 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1 bg-forest/30 cursor-pointer relative group" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}>
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%`, transform: 'translate(-50%, -50%)' }}
              />
            </div>
            <span className="mono-ui text-[9px] text-forest w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 w-1/4 justify-end">
          <Volume2 className="w-4 h-4 text-forest" />
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-2 transition-colors relative ${showQueue ? 'text-primary bg-primary/10' : 'text-forest hover:text-white'}`}
            data-testid="queue-toggle-btn"
          >
            <ListMusic className="w-5 h-5" />
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-background-dark mono-ui text-[8px] font-bold flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>
          <div className="mono-ui text-[8px] text-forest hidden lg:block">
            CODEC: AAC_256
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AudioPlayerBar;

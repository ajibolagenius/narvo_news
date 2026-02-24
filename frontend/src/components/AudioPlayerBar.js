import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, SpeakerHigh, SpeakerSlash, 
  Queue, X, Trash, DotsSixVertical, Repeat, Broadcast
} from '@phosphor-icons/react';
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
    currentTrack, isPlaying, isLoading, isTransitioning, currentTime, duration,
    togglePlay, seek, playNext, playPrev,
    queue, queueIndex, removeFromQueue, clearQueue, playFromQueue,
    volume, isMuted, setVolume, toggleMute, autoPlay, setAutoPlay,
  } = useAudio();
  const [showQueue, setShowQueue] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeRef = useRef(null);

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
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * duration);
  };

  return (
    <footer className="hidden md:flex flex-col bg-[var(--color-bg)] border-t-2 border-[var(--color-primary)] z-20 shrink-0 relative" data-testid="audio-player-bar">
      {/* Queue Panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 w-96 max-h-80 bg-[var(--color-bg)] border border-[var(--color-border)] border-b-0 overflow-hidden flex flex-col z-50"
            data-testid="queue-panel"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/10">
              <div className="flex items-center gap-2">
                <Queue weight="fill" className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="font-mono text-[10px] text-[var(--color-text-primary)] font-bold uppercase">QUEUE // {queue.length} TRACKS</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`p-1.5 transition-colors ${autoPlay ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
                  title={autoPlay ? 'Auto-play ON' : 'Auto-play OFF'}
                >
                  <Repeat weight={autoPlay ? 'fill' : 'regular'} className="w-4 h-4" />
                </button>
                {queue.length > 0 && (
                  <button onClick={clearQueue} className="p-1.5 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors" title="Clear Queue">
                    <Trash weight="bold" className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setShowQueue(false)} className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                  <X weight="bold" className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scroll">
              {queue.length === 0 ? (
                <div className="p-6 text-center">
                  <Queue className="w-8 h-8 text-[var(--color-text-dim)] mx-auto mb-2" />
                  <p className="font-mono text-[10px] text-[var(--color-text-dim)]">QUEUE_EMPTY</p>
                </div>
              ) : (
                queue.map((track, idx) => (
                  <div
                    key={track.id}
                    onClick={() => playFromQueue(idx)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-[var(--color-border)]/30 ${
                      idx === queueIndex ? 'bg-[var(--color-primary)]/5 border-l-2 border-l-[var(--color-primary)]' : 'hover:bg-[var(--color-surface)]/30'
                    }`}
                  >
                    <DotsSixVertical className="w-4 h-4 text-[var(--color-text-dim)] cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs truncate block ${idx === queueIndex ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                        {track.title}
                      </span>
                      <span className="font-mono text-[9px] text-[var(--color-text-dim)]">{track.source}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromQueue(track.id); }}
                      className="p-1 text-[var(--color-text-dim)] hover:text-red-500 transition-colors"
                    >
                      <X weight="bold" className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Player */}
      <div className="flex items-center h-16 px-4 gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-1/4 min-w-0">
          {currentTrack ? (
            <>
              <div className="w-10 h-10 bg-[var(--color-primary)]/20 border border-[var(--color-border)] shrink-0 flex items-center justify-center">
                {isLoading || isTransitioning ? (
                  <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent animate-spin rounded-full" />
                ) : isPlaying ? (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map(i => <div key={i} className="w-1 bg-[var(--color-primary)] animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                ) : (
                  <Play weight="fill" className="w-4 h-4 text-[var(--color-primary)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--color-text-primary)] truncate font-medium">{currentTrack.title}</p>
                <p className="font-mono text-[9px] text-[var(--color-text-secondary)] truncate uppercase">{currentTrack.source}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-dashed border-[var(--color-border)] flex items-center justify-center">
                <Broadcast className="w-4 h-4 text-[var(--color-text-dim)]" />
              </div>
              <span className="font-mono text-[10px] text-[var(--color-text-dim)]">NO_SIGNAL</span>
            </div>
          )}
        </div>

        {/* Center Controls */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <button onClick={playPrev} disabled={queueIndex <= 0} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 transition-colors">
              <SkipBack weight="fill" className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              disabled={isLoading || !currentTrack}
              className="w-10 h-10 bg-[var(--color-primary)] flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
              data-testid="player-play-pause"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[var(--color-bg)] border-t-transparent animate-spin rounded-full" />
              ) : isPlaying ? (
                <Pause weight="fill" className="w-5 h-5 text-[var(--color-bg)]" />
              ) : (
                <Play weight="fill" className="w-5 h-5 text-[var(--color-bg)] ml-0.5" />
              )}
            </button>
            <button onClick={playNext} disabled={queueIndex >= queue.length - 1} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 transition-colors">
              <SkipForward weight="fill" className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3 w-full max-w-md">
            <span className="font-mono text-[9px] text-[var(--color-text-dim)] w-10 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1 bg-[var(--color-surface)] cursor-pointer group" onClick={handleSeek}>
              <motion.div
                className="h-full bg-[var(--color-primary)] relative"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
            <span className="font-mono text-[9px] text-[var(--color-text-dim)] w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 w-1/4 justify-end">
          {/* Volume Control */}
          <div className="relative flex items-center gap-2" ref={volumeRef}>
            <button
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-1"
              data-testid="volume-btn"
            >
              {isMuted || volume === 0 ? (
                <SpeakerSlash weight="fill" className="w-5 h-5" />
              ) : (
                <SpeakerHigh weight="fill" className="w-5 h-5" />
              )}
            </button>
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-[var(--color-bg)] border border-[var(--color-border)]"
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <div className="w-24 h-1.5 bg-[var(--color-surface)] cursor-pointer relative" onClick={handleVolumeChange} data-testid="volume-slider">
                    <div className="h-full bg-[var(--color-primary)] transition-all" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                  </div>
                  <span className="font-mono text-[8px] text-[var(--color-text-secondary)] block text-center mt-1">
                    {isMuted ? 'MUTED' : `${Math.round(volume * 100)}%`}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-2 transition-colors relative ${showQueue ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            data-testid="queue-toggle-btn"
          >
            <Queue weight={showQueue ? 'fill' : 'regular'} className="w-5 h-5" />
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-primary)] text-[var(--color-bg)] font-mono text-[8px] font-bold flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>
          
          <div className="font-mono text-[8px] text-[var(--color-text-secondary)] hidden lg:block">
            {autoPlay && <span className="text-[var(--color-primary)]">●</span>} AUTO
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AudioPlayerBar;

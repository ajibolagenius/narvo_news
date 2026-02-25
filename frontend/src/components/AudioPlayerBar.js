import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, SpeakerHigh, SpeakerSlash,
  Queue, X, Trash, Repeat, Broadcast, CaretUp, CaretDown, Waveform
} from '@phosphor-icons/react';
import { useAudio } from '../contexts/AudioContext';

const fmt = (s) => {
  if (!s || isNaN(s)) return '00:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

/* ──────────────────────── DESKTOP PLAYER ──────────────────────── */
const DesktopPlayer = () => {
  const {
    currentTrack, isPlaying, isLoading, isTransitioning, currentTime, duration,
    togglePlay, seek, playNext, playPrev,
    queue, queueIndex, removeFromQueue, clearQueue, playFromQueue,
    volume, isMuted, setVolume, toggleMute, autoPlay, setAutoPlay,
  } = useAudio();
  const [showQueue, setShowQueue] = useState(false);
  const [showVol, setShowVol] = useState(false);
  const volRef = useRef(null);
  const progress = duration ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const h = (e) => { if (volRef.current && !volRef.current.contains(e.target)) setShowVol(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * duration);
  };

  return (
    <footer className="hidden md:block bg-[rgb(var(--color-bg))] border-t border-[rgb(var(--color-border))] z-20 shrink-0 relative" data-testid="audio-player-bar">
      {/* Thin progress line at top of player */}
      <div className="h-[2px] bg-[rgb(var(--color-surface))]">
        <div className="h-full bg-[rgb(var(--color-primary))] transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Queue Panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 w-96 max-h-80 bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border))] border-b-0 overflow-hidden flex flex-col z-50"
            data-testid="queue-panel"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/10">
              <div className="flex items-center gap-2">
                <Queue weight="fill" className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                <span className="font-mono text-[10px] text-[rgb(var(--color-text-primary))] font-bold uppercase">QUEUE // {queue.length} TRACKS</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAutoPlay(!autoPlay)} className={`p-1.5 transition-colors ${autoPlay ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-secondary))]'}`}>
                  <Repeat weight={autoPlay ? 'fill' : 'regular'} className="w-4 h-4" />
                </button>
                {queue.length > 0 && (
                  <button onClick={clearQueue} className="p-1.5 text-[rgb(var(--color-text-secondary))] hover:text-red-500 transition-colors"><Trash weight="bold" className="w-4 h-4" /></button>
                )}
                <button onClick={() => setShowQueue(false)} className="p-1.5 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"><X weight="bold" className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scroll">
              {queue.length === 0 ? (
                <div className="p-6 text-center">
                  <Queue className="w-8 h-8 text-[rgb(var(--color-text-dim))] mx-auto mb-2" />
                  <p className="font-mono text-[10px] text-[rgb(var(--color-text-dim))]">QUEUE_EMPTY</p>
                </div>
              ) : queue.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => playFromQueue(idx)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all border-b border-[rgb(var(--color-border))]/20 ${
                    idx === queueIndex ? 'bg-[rgb(var(--color-primary))]/8 border-l-2 border-l-[rgb(var(--color-primary))]' : 'hover:bg-[rgb(var(--color-surface))]/20'
                  }`}
                >
                  <span className="font-mono text-[9px] text-[rgb(var(--color-text-dim))] w-5">{String(idx + 1).padStart(2, '0')}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs truncate block ${idx === queueIndex ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-primary))]'}`}>{track.title}</span>
                    <span className="font-mono text-[8px] text-[rgb(var(--color-text-dim))]">{track.source}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFromQueue(track.id); }} className="p-1 text-[rgb(var(--color-text-dim))] hover:text-red-500"><X weight="bold" className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main bar */}
      <div className="flex items-center h-[60px] px-5 gap-5">
        {/* Track info — left */}
        <div className="flex items-center gap-3 w-[280px] min-w-0 shrink-0">
          {currentTrack ? (
            <>
              <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-border))] shrink-0 flex items-center justify-center relative overflow-hidden">
                {isLoading || isTransitioning ? (
                  <div className="w-4 h-4 border-2 border-[rgb(var(--color-primary))] border-t-transparent animate-spin rounded-full" />
                ) : isPlaying ? (
                  <div className="flex items-end gap-[2px] h-5">
                    {[1,2,3,4].map(i => (
                      <motion.div
                        key={i}
                        className="w-[3px] bg-[rgb(var(--color-primary))]"
                        animate={{ height: [4, 12 + i * 2, 6, 14, 4] }}
                        transition={{ repeat: Infinity, duration: 0.8 + i * 0.15, ease: 'easeInOut' }}
                      />
                    ))}
                  </div>
                ) : (
                  <Broadcast weight="bold" className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[rgb(var(--color-text-primary))] truncate font-medium leading-tight">{currentTrack.title}</p>
                <p className="font-mono text-[9px] text-[rgb(var(--color-text-dim))] truncate uppercase mt-0.5">{currentTrack.source}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-dashed border-[rgb(var(--color-border))] flex items-center justify-center">
                <Waveform className="w-4 h-4 text-[rgb(var(--color-text-dim))]" />
              </div>
              <span className="font-mono text-[10px] text-[rgb(var(--color-text-dim))]">NO_SIGNAL</span>
            </div>
          )}
        </div>

        {/* Center — controls + scrubber */}
        <div className="flex-1 flex flex-col items-center gap-1.5 max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={playPrev} disabled={queueIndex <= 0} className="p-1.5 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] disabled:opacity-30 transition-colors" data-testid="player-prev">
              <SkipBack weight="fill" className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              disabled={isLoading || !currentTrack}
              className="w-9 h-9 bg-[rgb(var(--color-primary))] flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50"
              data-testid="player-play-pause"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[rgb(var(--color-bg))] border-t-transparent animate-spin rounded-full" />
              ) : isPlaying ? (
                <Pause weight="fill" className="w-4 h-4 text-[rgb(var(--color-bg))]" />
              ) : (
                <Play weight="fill" className="w-4 h-4 text-[rgb(var(--color-bg))] ml-0.5" />
              )}
            </button>
            <button onClick={playNext} disabled={queueIndex >= queue.length - 1} className="p-1.5 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] disabled:opacity-30 transition-colors" data-testid="player-next">
              <SkipForward weight="fill" className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 w-full">
            <span className="font-mono text-[9px] text-[rgb(var(--color-text-dim))] w-9 text-right tabular-nums">{fmt(currentTime)}</span>
            <div className="flex-1 h-[6px] bg-[rgb(var(--color-surface))] cursor-pointer group relative" onClick={handleSeek} data-testid="player-progress">
              <div className="h-full bg-[rgb(var(--color-primary))] relative" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[rgb(var(--color-primary))] border border-[rgb(var(--color-bg))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="font-mono text-[9px] text-[rgb(var(--color-text-dim))] w-9 tabular-nums">{fmt(duration)}</span>
          </div>
        </div>

        {/* Right — volume + queue */}
        <div className="flex items-center gap-3 w-[200px] justify-end shrink-0">
          <div className="relative flex items-center" ref={volRef}>
            <button onClick={toggleMute} onMouseEnter={() => setShowVol(true)} className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] p-1.5" data-testid="volume-btn">
              {isMuted || volume === 0 ? <SpeakerSlash weight="fill" className="w-4 h-4" /> : <SpeakerHigh weight="fill" className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {showVol && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 80 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden ml-1"
                  onMouseLeave={() => setShowVol(false)}
                >
                  <div
                    className="w-20 h-1.5 bg-[rgb(var(--color-surface))] cursor-pointer"
                    onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setVolume(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); }}
                    data-testid="volume-slider"
                  >
                    <div className="h-full bg-[rgb(var(--color-primary))]" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-1.5 transition-colors relative ${showQueue ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'}`}
            data-testid="queue-toggle-btn"
          >
            <Queue weight={showQueue ? 'fill' : 'regular'} className="w-4 h-4" />
            {queue.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-bg))] font-mono text-[7px] font-bold flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>
          {autoPlay && <span className="font-mono text-[8px] text-[rgb(var(--color-primary))] hidden lg:block">AUTO</span>}
        </div>
      </div>
    </footer>
  );
};

/* ──────────────────────── MOBILE PLAYER ──────────────────────── */
const MobilePlayer = () => {
  const {
    currentTrack, isPlaying, isLoading, currentTime, duration,
    togglePlay, seek, playNext, playPrev,
    queue, queueIndex, volume, isMuted, setVolume, toggleMute,
  } = useAudio();
  const [expanded, setExpanded] = useState(false);
  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) return null;

  const handleSeekMobile = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * duration);
  };

  return (
    <>
      {/* Mini bar — sits above mobile bottom nav (bottom-14) */}
      <div
        className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-[rgb(var(--color-bg))] border-t border-[rgb(var(--color-border))]"
        data-testid="mobile-mini-player"
      >
        {/* Thin progress */}
        <div className="h-[2px] bg-[rgb(var(--color-surface))]">
          <div className="h-full bg-[rgb(var(--color-primary))] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-3 px-3 py-2" onClick={() => setExpanded(true)}>
          <div className="w-8 h-8 bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-border))] shrink-0 flex items-center justify-center">
            {isLoading ? (
              <div className="w-3 h-3 border-2 border-[rgb(var(--color-primary))] border-t-transparent animate-spin rounded-full" />
            ) : isPlaying ? (
              <div className="flex items-end gap-[2px] h-4">
                {[1,2,3].map(i => (
                  <motion.div key={i} className="w-[2px] bg-[rgb(var(--color-primary))]" animate={{ height: [3, 8 + i, 4, 10, 3] }} transition={{ repeat: Infinity, duration: 0.7 + i * 0.1 }} />
                ))}
              </div>
            ) : (
              <Broadcast weight="bold" className="w-3.5 h-3.5 text-[rgb(var(--color-primary))]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[rgb(var(--color-text-primary))] truncate font-medium">{currentTrack.title}</p>
            <p className="font-mono text-[8px] text-[rgb(var(--color-text-dim))] uppercase">{currentTrack.source}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="w-8 h-8 bg-[rgb(var(--color-primary))] flex items-center justify-center shrink-0"
            data-testid="mobile-mini-play"
          >
            {isPlaying ? <Pause weight="fill" className="w-4 h-4 text-[rgb(var(--color-bg))]" /> : <Play weight="fill" className="w-4 h-4 text-[rgb(var(--color-bg))] ml-0.5" />}
          </button>
          <CaretUp weight="bold" className="w-4 h-4 text-[rgb(var(--color-text-dim))] shrink-0" />
        </div>
      </div>

      {/* Expanded modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="md:hidden fixed inset-0 z-50 bg-[rgb(var(--color-bg))] flex flex-col"
            data-testid="mobile-player-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--color-border))]">
              <span className="font-mono text-[10px] text-[rgb(var(--color-primary))] font-bold tracking-[0.2em]">NOW_PLAYING</span>
              <button onClick={() => setExpanded(false)} className="p-2 text-[rgb(var(--color-text-secondary))]" data-testid="mobile-player-close">
                <CaretDown weight="bold" className="w-5 h-5" />
              </button>
            </div>

            {/* Art / Visualizer area */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
              <div className="w-48 h-48 bg-[rgb(var(--color-surface))]/10 border border-[rgb(var(--color-border))] flex items-center justify-center relative">
                {isPlaying ? (
                  <div className="flex items-end gap-1 h-20">
                    {[1,2,3,4,5,6,7].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 bg-[rgb(var(--color-primary))]"
                        animate={{ height: [8, 40 + Math.random() * 30, 12, 50 + Math.random() * 20, 8] }}
                        transition={{ repeat: Infinity, duration: 0.6 + i * 0.12, ease: 'easeInOut' }}
                      />
                    ))}
                  </div>
                ) : (
                  <Waveform weight="thin" className="w-20 h-20 text-[rgb(var(--color-text-dim))]" />
                )}
                <span className="absolute bottom-2 right-2 font-mono text-[8px] text-[rgb(var(--color-text-dim))]">
                  {currentTrack.category || 'BROADCAST'}
                </span>
              </div>

              {/* Track info */}
              <div className="text-center w-full max-w-xs">
                <h2 className="text-base text-[rgb(var(--color-text-primary))] font-bold leading-snug line-clamp-2">{currentTrack.title}</h2>
                <p className="font-mono text-[10px] text-[rgb(var(--color-text-dim))] uppercase mt-1.5">{currentTrack.source}</p>
              </div>
            </div>

            {/* Controls area */}
            <div className="px-6 pb-8 pt-4 border-t border-[rgb(var(--color-border))]/50 space-y-5">
              {/* Scrubber */}
              <div className="space-y-1.5">
                <div className="h-2 bg-[rgb(var(--color-surface))] cursor-pointer relative" onClick={handleSeekMobile} data-testid="mobile-progress">
                  <div className="h-full bg-[rgb(var(--color-primary))]" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[rgb(var(--color-primary))] border-2 border-[rgb(var(--color-bg))]" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] text-[rgb(var(--color-text-dim))] tabular-nums">{fmt(currentTime)}</span>
                  <span className="font-mono text-[9px] text-[rgb(var(--color-text-dim))] tabular-nums">{fmt(duration)}</span>
                </div>
              </div>

              {/* Main controls */}
              <div className="flex items-center justify-center gap-8">
                <button onClick={playPrev} disabled={queueIndex <= 0} className="p-2 text-[rgb(var(--color-text-secondary))] disabled:opacity-30" data-testid="mobile-prev">
                  <SkipBack weight="fill" className="w-6 h-6" />
                </button>
                <button
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-14 h-14 bg-[rgb(var(--color-primary))] flex items-center justify-center"
                  data-testid="mobile-play-pause"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-[rgb(var(--color-bg))] border-t-transparent animate-spin rounded-full" />
                  ) : isPlaying ? (
                    <Pause weight="fill" className="w-7 h-7 text-[rgb(var(--color-bg))]" />
                  ) : (
                    <Play weight="fill" className="w-7 h-7 text-[rgb(var(--color-bg))] ml-1" />
                  )}
                </button>
                <button onClick={playNext} disabled={queueIndex >= queue.length - 1} className="p-2 text-[rgb(var(--color-text-secondary))] disabled:opacity-30" data-testid="mobile-next">
                  <SkipForward weight="fill" className="w-6 h-6" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <button onClick={toggleMute} className="text-[rgb(var(--color-text-secondary))] p-1">
                  {isMuted || volume === 0 ? <SpeakerSlash weight="fill" className="w-4 h-4" /> : <SpeakerHigh weight="fill" className="w-4 h-4" />}
                </button>
                <div
                  className="flex-1 h-1.5 bg-[rgb(var(--color-surface))] cursor-pointer"
                  onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setVolume(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); }}
                  data-testid="mobile-volume"
                >
                  <div className="h-full bg-[rgb(var(--color-primary))]" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                </div>
                <span className="font-mono text-[8px] text-[rgb(var(--color-text-dim))] w-8">{isMuted ? 'MUTE' : `${Math.round(volume * 100)}%`}</span>
              </div>

              {/* Queue info */}
              {queue.length > 0 && (
                <div className="text-center">
                  <span className="font-mono text-[8px] text-[rgb(var(--color-text-dim))]">
                    QUEUE: {queueIndex + 1} / {queue.length}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ──────────────────────── COMBINED EXPORT ──────────────────────── */
const AudioPlayerBar = () => (
  <>
    <DesktopPlayer />
    <MobilePlayer />
  </>
);

export default AudioPlayerBar;

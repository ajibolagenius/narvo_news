import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const AudioContext = createContext({});

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      playNext();
    });
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line
  }, []);

  const playTrack = useCallback((track) => {
    if (!track?.url) return;
    const audio = audioRef.current;
    if (currentTrack?.url === track.url) {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
      return;
    }
    audio.src = track.url;
    audio.play().catch(() => {});
    setCurrentTrack(track);
    setDuration(0);
    setCurrentTime(0);
  }, [currentTrack]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio.src) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  const seek = useCallback((time) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const stopTrack = useCallback(() => {
    const audio = audioRef.current;
    audio.pause();
    audio.src = '';
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // Queue management
  const addToQueue = useCallback((track) => {
    setQueue(prev => {
      if (prev.some(t => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const removeFromQueue = useCallback((trackId) => {
    setQueue(prev => prev.filter(t => t.id !== trackId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) {
      const next = queue[nextIdx];
      setQueueIndex(nextIdx);
      if (next.url) {
        const audio = audioRef.current;
        audio.src = next.url;
        audio.play().catch(() => {});
        setCurrentTrack(next);
        setDuration(0);
        setCurrentTime(0);
      }
    }
  }, [queue, queueIndex]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      const prev = queue[prevIdx];
      setQueueIndex(prevIdx);
      if (prev.url) {
        const audio = audioRef.current;
        audio.src = prev.url;
        audio.play().catch(() => {});
        setCurrentTrack(prev);
        setDuration(0);
        setCurrentTime(0);
      }
    }
  }, [queue, queueIndex]);

  const playFromQueue = useCallback((index) => {
    if (index >= 0 && index < queue.length) {
      const track = queue[index];
      setQueueIndex(index);
      if (track.url) {
        const audio = audioRef.current;
        audio.src = track.url;
        audio.play().catch(() => {});
        setCurrentTrack(track);
        setDuration(0);
        setCurrentTime(0);
      }
    }
  }, [queue]);

  const reorderQueue = useCallback((fromIndex, toIndex) => {
    setQueue(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  // Play a track and set it as the current in queue context
  const playTrackAndQueue = useCallback((track, trackList) => {
    if (trackList && trackList.length > 0) {
      setQueue(trackList);
      const idx = trackList.findIndex(t => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    }
    playTrack(track);
  }, [playTrack]);

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      playTrack,
      playTrackAndQueue,
      togglePlay,
      seek,
      stopTrack,
      // Queue
      queue,
      queueIndex,
      addToQueue,
      removeFromQueue,
      clearQueue,
      playNext,
      playPrev,
      playFromQueue,
      reorderQueue,
    }}>
      {children}
    </AudioContext.Provider>
  );
};

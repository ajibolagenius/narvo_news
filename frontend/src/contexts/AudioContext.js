import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const AudioContext = createContext({});

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [error, setError] = useState(null);

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
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setError('Failed to play audio');
      setIsPlaying(false);
      setIsLoading(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line
  }, []);

  // Generate TTS audio for a track
  const generateTTS = useCallback(async (track) => {
    const textToSpeak = track.narrative || track.summary || track.title;
    if (!textToSpeak) return null;
    
    try {
      const response = await fetch(`${API_URL}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak.slice(0, 4000),
          voice_id: 'nova'
        })
      });
      
      if (!response.ok) throw new Error('TTS generation failed');
      
      const data = await response.json();
      return data.audio_url;
    } catch (err) {
      console.error('TTS error:', err);
      return null;
    }
  }, []);

  const playTrack = useCallback(async (track) => {
    if (!track) return;
    
    setError(null);
    const audio = audioRef.current;
    
    // Get existing URL or generate TTS
    let trackUrl = track.url || track.audio_url;
    
    // If same track, toggle play/pause
    if (currentTrack?.id === track.id && trackUrl) {
      if (audio.paused) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
      return;
    }
    
    // If no audio URL, generate TTS
    if (!trackUrl) {
      setIsLoading(true);
      setCurrentTrack({ ...track, title: track.title, source: track.source });
      
      trackUrl = await generateTTS(track);
      
      if (!trackUrl) {
        setError('Failed to generate audio');
        setIsLoading(false);
        return;
      }
    }
    
    // Play the audio
    audio.src = trackUrl;
    audio.play().catch((err) => {
      console.error('Play error:', err);
      setError('Failed to play audio');
    });
    
    setCurrentTrack({ ...track, url: trackUrl });
    setDuration(0);
    setCurrentTime(0);
    setIsLoading(false);
  }, [currentTrack, generateTTS]);

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
    setError(null);
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

  const playNext = useCallback(async () => {
    if (queue.length === 0) return;
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) {
      const next = queue[nextIdx];
      setQueueIndex(nextIdx);
      await playTrack(next);
    }
  }, [queue, queueIndex, playTrack]);

  const playPrev = useCallback(async () => {
    if (queue.length === 0) return;
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      const prev = queue[prevIdx];
      setQueueIndex(prevIdx);
      await playTrack(prev);
    }
  }, [queue, queueIndex, playTrack]);

  const playFromQueue = useCallback(async (index) => {
    if (index >= 0 && index < queue.length) {
      const track = queue[index];
      setQueueIndex(index);
      await playTrack(track);
    }
  }, [queue, playTrack]);

  const reorderQueue = useCallback((fromIndex, toIndex) => {
    setQueue(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  // Play a track and set it as the current in queue context
  const playTrackAndQueue = useCallback(async (track, trackList) => {
    if (trackList && trackList.length > 0) {
      setQueue(trackList);
      const idx = trackList.findIndex(t => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    }
    await playTrack(track);
  }, [playTrack]);

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      isLoading,
      currentTime,
      duration,
      error,
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

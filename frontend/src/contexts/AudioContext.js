import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const AudioContext = createContext({});

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [autoPlay, setAutoPlay] = useState(true);
  const [error, setError] = useState(null);
  const [broadcastLanguage, setBroadcastLanguage] = useState('en');

  // Fetch user's language preference on mount
  useEffect(() => {
    const fetchLanguagePreference = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/guest`);
        if (response.ok) {
          const data = await response.json();
          if (data.broadcast_language) {
            setBroadcastLanguage(data.broadcast_language);
          }
        }
      } catch (err) {
        console.log('Using default language: en');
      }
    };
    fetchLanguagePreference();
  }, []);

  // Update Media Session metadata for lock screen/background playback
  const updateMediaSession = useCallback((track) => {
    if (!('mediaSession' in navigator) || !track) return;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Narvo News',
      artist: track.source || 'Narvo',
      album: 'Narvo Broadcast',
      artwork: [
        { src: track.image_url || '/logo192.png', sizes: '192x192', type: 'image/png' },
        { src: track.image_url || '/logo512.png', sizes: '512x512', type: 'image/png' }
      ]
    });
  }, []);

  // Setup Media Session action handlers for background control
  const setupMediaSessionHandlers = useCallback(() => {
    if (!('mediaSession' in navigator)) return;
    
    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play().catch(() => {});
    });
    
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
    });
    
    navigator.mediaSession.setActionHandler('stop', () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    });
    
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 10;
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - skipTime);
      }
    });
    
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 10;
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(
          audioRef.current.duration || 0,
          audioRef.current.currentTime + skipTime
        );
      }
    });
    
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      // Will be connected to playPrev
    });
    
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      // Will be connected to playNext
    });
  }, []);

  // Smooth fade out for broadcast transitions
  const fadeOut = useCallback((callback) => {
    const audio = audioRef.current;
    if (!audio) return callback?.();
    
    setIsTransitioning(true);
    const startVolume = audio.volume;
    const steps = 10;
    let step = 0;
    
    clearInterval(fadeIntervalRef.current);
    fadeIntervalRef.current = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVolume * (1 - step / steps));
      if (step >= steps) {
        clearInterval(fadeIntervalRef.current);
        callback?.();
        // Restore volume for next track
        setTimeout(() => {
          audio.volume = isMuted ? 0 : volume;
          setIsTransitioning(false);
        }, 100);
      }
    }, 50);
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    // Enable background playback
    audio.preload = 'auto';
    audioRef.current = audio;
    
    // Setup Media Session handlers for background control
    setupMediaSessionHandlers();
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      // Update Media Session position state
      if ('mediaSession' in navigator && audio.duration) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: audio.currentTime
        });
      }
    });
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      // Auto-play next with smooth transition
      if (autoPlay) {
        playNextSmooth();
      }
    });
    audio.addEventListener('play', () => {
      setIsPlaying(true);
      // Update Media Session playback state
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    });
    audio.addEventListener('pause', () => {
      setIsPlaying(false);
      // Update Media Session playback state
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    });
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setError('Failed to play audio');
      setIsPlaying(false);
      setIsLoading(false);
    });

    return () => {
      clearInterval(fadeIntervalRef.current);
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line
  }, []);

  // Volume control
  const setVolume = useCallback((newVolume) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : vol;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.volume = newMuted ? 0 : volume;
      }
      return newMuted;
    });
  }, [volume]);

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

  // Queue management (defined before playTrack so it's available)
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

  // Reorder queue items (drag-and-drop support)
  const reorderQueue = useCallback((fromIndex, toIndex) => {
    // Don't allow reordering the currently playing item
    if (fromIndex === queueIndex) return;
    
    setQueue(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      
      // Update queueIndex if needed
      if (fromIndex < queueIndex && toIndex >= queueIndex) {
        setQueueIndex(qi => qi - 1);
      } else if (fromIndex > queueIndex && toIndex <= queueIndex) {
        setQueueIndex(qi => qi + 1);
      }
      
      return updated;
    });
  }, [queueIndex]);

  const playTrack = useCallback(async (track, forcePlay = false) => {
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
    
    // If something is playing and not forcing, add to queue instead
    if (isPlaying && !forcePlay && currentTrack) {
      addToQueue(track);
      return { queued: true };
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
    
    const finalTrack = { ...track, url: trackUrl };
    setCurrentTrack(finalTrack);
    setDuration(0);
    setCurrentTime(0);
    setIsLoading(false);
    
    // Update Media Session for background/lock screen controls
    updateMediaSession(finalTrack);
  }, [currentTrack, isPlaying, generateTTS, addToQueue, updateMediaSession]);

  // Force play - always plays immediately
  const forcePlayTrack = useCallback(async (track) => {
    return playTrack(track, true);
  }, [playTrack]);

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

  const playNext = useCallback(async () => {
    if (queue.length === 0) return;
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) {
      const next = queue[nextIdx];
      setQueueIndex(nextIdx);
      await playTrack(next, true); // Force play
    }
  }, [queue, queueIndex, playTrack]);

  // Smooth transition to next track (broadcast-style)
  const playNextSmooth = useCallback(async () => {
    if (queue.length === 0) return;
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) {
      fadeOut(async () => {
        const next = queue[nextIdx];
        setQueueIndex(nextIdx);
        await playTrack(next, true); // Force play
      });
    }
  }, [queue, queueIndex, playTrack, fadeOut]);

  const playPrev = useCallback(async () => {
    if (queue.length === 0) return;
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      const prev = queue[prevIdx];
      setQueueIndex(prevIdx);
      await playTrack(prev, true); // Force play
    }
  }, [queue, queueIndex, playTrack]);

  // Update Media Session handlers when queue changes
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    
    navigator.mediaSession.setActionHandler('previoustrack', queue.length > 0 && queueIndex > 0 
      ? () => playPrev() 
      : null
    );
    
    navigator.mediaSession.setActionHandler('nexttrack', queue.length > 0 && queueIndex < queue.length - 1 
      ? () => playNext() 
      : null
    );
  }, [queue, queueIndex, playNext, playPrev]);

  const playFromQueue = useCallback(async (index) => {
    if (index >= 0 && index < queue.length) {
      const track = queue[index];
      setQueueIndex(index);
      await playTrack(track, true); // Force play
    }
  }, [queue, playTrack]);

  // Play a track and set it as the current in queue context
  const playTrackAndQueue = useCallback(async (track, trackList) => {
    if (trackList && trackList.length > 0) {
      setQueue(trackList);
      const idx = trackList.findIndex(t => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    }
    await playTrack(track, true); // Force play
  }, [playTrack]);

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      isLoading,
      isTransitioning,
      currentTime,
      duration,
      error,
      volume,
      isMuted,
      autoPlay,
      setVolume,
      toggleMute,
      setAutoPlay,
      playTrack,
      forcePlayTrack,
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

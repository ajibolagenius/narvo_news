import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
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
    audio.addEventListener('loadedmetadata', () => { setDuration(audio.duration); setIsLoading(false); });
    audio.addEventListener('ended', () => { setIsPlaying(false); setProgress(0); });
    audio.addEventListener('error', () => { setIsLoading(false); setIsPlaying(false); });
    setAudioElement(audio);
    return () => { audio.pause(); audio.src = ''; };
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
          body: JSON.stringify({ text: track.narrative || track.summary || track.title, voice_id: track.voice_id || 'nova' })
        });
        if (response.ok) {
          const data = await response.json();
          audioElement.src = data.audio_url;
          await audioElement.play();
          setIsPlaying(true);
          track.audio_url = data.audio_url;
        }
      } catch (error) { console.error('TTS error:', error); setIsLoading(false); }
    }
  };

  const togglePlay = () => {
    if (!audioElement) return;
    if (isPlaying) audioElement.pause(); else audioElement.play();
    setIsPlaying(!isPlaying);
  };

  const seek = (time) => { if (audioElement) { audioElement.currentTime = time; setProgress(time); } };
  const setVolumeLevel = (level) => { setVolume(level); if (audioElement) audioElement.volume = level; };

  return (
    <AudioContext.Provider value={{ currentTrack, isPlaying, progress, duration, volume, isLoading, playTrack, togglePlay, seek, setVolumeLevel }}>
      {children}
    </AudioContext.Provider>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Play, PlayCircle, Pause, Radio, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../contexts/AudioContext';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Podcast episodes - would come from API in production
const PODCAST_EPISODES = [
  { id: 'ep402', episode: 'EP. 402', title: 'The Geopolitical Shift: Arctic Routes', duration: '45:00', description: 'UNDERSTANDING_THE_OPENING_TRADE_ROUTES_INCIDENT_NORTH_POLE_ENVIRONMENTAL_IMPACT_REPORT_v4.' },
  { id: 'ep089', episode: 'EP. 089', title: 'Tech Horizons: Quantum Synthesis', duration: '22:15', description: 'EXCLUSIVE_BREAKTHROUGH_ZURICH_LABS_NEURAL_INTERFACE_READY_FOR_HUMAN_TRIALS_PHASE_1.' },
  { id: 'ep012', episode: 'EP. 012', title: 'Urban Architecture: Megacities', duration: '60:00', description: 'REIMAGINING_DENSE_METROPOLITAN_SPACES_NIGERIA_2050_INFRASTRUCTURE_PLANNING_DATA.' },
  { id: 'ep201', episode: 'EP. 201', title: 'Soundscapes: Amazon Rainforest', duration: '33:45', description: 'BINAURAL_FIELD_RECORDINGS_BIODIVERSITY_METRICS_AUDIO_SAMPLE_SET_A.' },
];

const DiscoverPage = () => {
  const { t } = useTranslation();
  const [featuredNews, setFeaturedNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [podcastSort, setPodcastSort] = useState('latest');
  const { playTrack } = useAudio();
  
  // Radio state
  const [radioStations, setRadioStations] = useState([]);
  const [radioLoading, setRadioLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('NG');
  const [countries, setCountries] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [radioVolume, setRadioVolume] = useState(0.7);
  const audioRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) setFeaturedNews(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
      
    // Fetch radio countries
    fetch(`${API_URL}/api/radio/countries`)
      .then(res => res.json())
      .then(setCountries)
      .catch(console.error);
  }, []);
  
  // Fetch radio stations when country changes
  useEffect(() => {
    setRadioLoading(true);
    fetch(`${API_URL}/api/radio/stations?country=${selectedCountry}&limit=10`)
      .then(res => res.json())
      .then(data => {
        setRadioStations(data);
        if (data.length > 0 && !currentStation) {
          setCurrentStation(data[0]);
        }
        setRadioLoading(false);
      })
      .catch(() => setRadioLoading(false));
  }, [selectedCountry, currentStation]);

  const handlePlayFeatured = () => {
    if (featuredNews) {
      playTrack(featuredNews);
    }
  };

  const handlePlayPodcast = (podcast) => {
    playTrack({ id: podcast.id, title: podcast.title, summary: podcast.description });
  };
  
  const playRadio = (station) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentStation(station);
    setIsRadioPlaying(true);
    
    if (audioRef.current) {
      audioRef.current.src = station.url_resolved || station.url;
      audioRef.current.volume = radioVolume;
      audioRef.current.play().catch(e => {
        console.error('Radio play error:', e);
        setIsRadioPlaying(false);
      });
    }
  };
  
  const toggleRadio = () => {
    if (!audioRef.current || !currentStation) return;
    
    if (isRadioPlaying) {
      audioRef.current.pause();
      setIsRadioPlaying(false);
    } else {
      audioRef.current.src = currentStation.url_resolved || currentStation.url;
      audioRef.current.volume = radioVolume;
      audioRef.current.play().catch(e => {
        console.error('Radio play error:', e);
        setIsRadioPlaying(false);
      });
      setIsRadioPlaying(true);
    }
  };
  
  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setRadioVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-background-dark relative" data-testid="discover-page">
      <div className="flex-1 overflow-y-auto custom-scroll">
        {/* Featured Matrix Hero */}
        <section className="h-[300px] md:h-[450px] narvo-border-b relative group overflow-hidden shrink-0">
          {loading ? (
            <div className="absolute inset-0 bg-surface/20 animate-pulse" />
          ) : (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1600')" }}
              />
              <div className="absolute inset-0 bg-background-dark/40 mix-blend-multiply" />
            </>
          )}

          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent p-6 md:p-12">
            <div className="max-w-4xl space-y-4 md:space-y-6">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="bg-primary text-background-dark px-2 md:px-3 py-1 mono-ui text-[9px] md:text-[10px] font-bold">{t('discover.live_broadcast')}</span>
                <span className="mono-ui text-[9px] md:text-[10px] text-primary">SIGNAL_STRONG // ARC_NODE_01</span>
              </div>
              {loading ? (
                <>
                  <Skeleton variant="text" className="w-3/4 h-12 md:h-16" />
                  <Skeleton variant="text" className="w-1/2 h-4" />
                </>
              ) : (
                <>
                  <h2 className="font-display text-3xl md:text-6xl font-bold uppercase tracking-tighter text-white leading-none">
                    {featuredNews?.title?.split(' ').slice(0, 3).join(' ')} <span className="text-primary">Shift.</span>
                  </h2>
                  <p className="text-xs md:text-sm text-forest font-body max-w-2xl leading-relaxed hidden sm:block">
                    ANALYSIS_DEEP_DIVE: {featuredNews?.summary?.slice(0, 120)}...
                  </p>
                </>
              )}
              <div className="flex items-center gap-4 md:gap-6 pt-2 md:pt-4">
                <button 
                  onClick={handlePlayFeatured}
                  className="flex items-center gap-2 md:gap-3 bg-white text-background-dark px-4 md:px-8 py-2 md:py-4 mono-ui text-[10px] md:text-[12px] font-bold hover:bg-primary transition-colors"
                  data-testid="start-transmission-btn"
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
                  <span>[ {t('discover.start_transmission')} ]</span>
                </button>
                <div className="hidden sm:flex gap-2 md:gap-4">
                  <div className="text-primary mono-ui text-[9px] md:text-[10px] bg-background-dark narvo-border px-2 md:px-3 py-1">CAM_01</div>
                  <div className="text-primary mono-ui text-[9px] md:text-[10px] bg-background-dark narvo-border px-2 md:px-3 py-1 animate-pulse">REC ●</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Podcast Matrix */}
          <div className="lg:col-span-2 lg:narvo-border-r h-full">
            <div className="flex items-center justify-between p-4 md:p-8 narvo-border-b bg-surface/10 sticky top-0 z-10 backdrop-blur-md">
              <h3 className="font-display text-lg md:text-2xl font-bold uppercase text-white tracking-tight">{t('discover.deep_dive_podcasts')}</h3>
              <div className="flex items-center gap-1 md:gap-2 p-1 narvo-border bg-background-dark">
                <button 
                  onClick={() => setPodcastSort('latest')}
                  className={`px-2 md:px-4 py-1 mono-ui text-[9px] md:text-[10px] font-bold ${podcastSort === 'latest' ? 'bg-primary text-background-dark' : 'text-forest hover:text-white'}`}
                >
                  {t('discover.latest')}
                </button>
                <button 
                  onClick={() => setPodcastSort('popular')}
                  className={`px-2 md:px-4 py-1 mono-ui text-[9px] md:text-[10px] ${podcastSort === 'popular' ? 'bg-primary text-background-dark font-bold' : 'text-forest hover:text-white'}`}
                >
                  {t('discover.popular')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-forest/20">
              {PODCAST_EPISODES.map((podcast) => (
                <article 
                  key={podcast.id}
                  className="bg-background-dark p-4 md:p-8 flex flex-col gap-4 md:gap-6 hover:bg-surface/40 transition-colors group cursor-pointer border border-transparent hover:border-forest/50"
                  data-testid={`podcast-${podcast.id}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="mono-ui text-[8px] md:text-[9px] text-primary border border-primary/30 px-1.5 md:px-2 py-0.5 bg-primary/10 font-bold">
                      {podcast.episode}
                    </span>
                    <span className="mono-ui text-[8px] md:text-[9px] text-forest">{podcast.duration}</span>
                  </div>
                  <h4 className="font-display text-base md:text-xl font-bold uppercase tracking-tight text-white leading-tight group-hover:text-primary transition-colors">
                    {podcast.title}
                  </h4>
                  <p className="text-[10px] md:text-xs text-forest font-mono leading-relaxed opacity-70 line-clamp-3">
                    {podcast.description}
                  </p>
                  <button 
                    onClick={() => handlePlayPodcast(podcast)}
                    className="mt-auto pt-4 md:pt-6 flex items-center gap-2 md:gap-3 text-primary mono-ui text-[9px] md:text-[10px] font-bold hover:text-white transition-colors"
                    data-testid={`play-podcast-${podcast.id}`}
                  >
                    <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
                    <span>[ LISTEN_CMD ]</span>
                  </button>
                </article>
              ))}
            </div>
          </div>

          {/* Radio Garden Panel */}
          <div className="lg:col-span-1 flex flex-col h-full bg-surface/5">
            {/* Hidden audio element for radio playback */}
            <audio ref={audioRef} className="hidden" />
            
            <div className="p-4 md:p-8 narvo-border-b bg-background-dark sticky top-0 z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg md:text-2xl font-bold uppercase text-white tracking-tight">{t('discover.radio_garden')}</h3>
                <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] mono-ui text-primary font-bold bg-primary/10 px-1.5 md:px-2 py-0.5 narvo-border">
                  <span className={`w-1.5 h-1.5 ${isRadioPlaying ? 'bg-primary animate-pulse' : 'bg-forest'}`} />
                  {isRadioPlaying ? 'LIVE' : 'STANDBY'}
                </div>
              </div>
              <p className="mono-ui text-[9px] md:text-[10px] text-forest">AFRICAN_BROADCAST_RELAY_v2.1</p>
            </div>

            {/* Country Selector */}
            <div className="p-4 narvo-border-b flex flex-wrap gap-2">
              {countries.slice(0, 6).map(c => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code)}
                  className={`px-2 py-1 mono-ui text-[8px] md:text-[9px] font-bold transition-all ${
                    selectedCountry === c.code 
                      ? 'bg-primary text-background-dark' 
                      : 'narvo-border text-forest hover:text-white hover:border-white'
                  }`}
                  data-testid={`radio-country-${c.code}`}
                >
                  {c.flag} {c.code}
                </button>
              ))}
            </div>

            {/* Station List */}
            <div className="flex-1 overflow-y-auto custom-scroll">
              {radioLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-3 narvo-border bg-surface/10">
                      <Skeleton variant="text" className="w-32 h-4 mb-2" />
                      <Skeleton variant="text" className="w-24 h-3" />
                    </div>
                  ))}
                </div>
              ) : radioStations.length === 0 ? (
                <div className="p-4 flex flex-col items-center justify-center min-h-[200px]">
                  <div className="narvo-border bg-surface/10 p-6 text-center">
                    <Radio className="w-8 h-8 text-forest mx-auto mb-3 opacity-50" />
                    <h4 className="font-display text-sm font-bold text-white uppercase mb-2">NO STATIONS FOUND</h4>
                    <p className="mono-ui text-[9px] text-forest">Try selecting another country.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {radioStations.map(station => (
                    <button
                      key={station.id}
                      onClick={() => playRadio(station)}
                      className={`w-full p-3 narvo-border text-left transition-all group ${
                        currentStation?.id === station.id && isRadioPlaying
                          ? 'bg-primary/10 border-primary'
                          : 'bg-surface/10 hover:bg-surface/30 hover:border-forest'
                      }`}
                      data-testid={`radio-station-${station.id}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-display text-xs md:text-sm font-bold uppercase truncate ${
                          currentStation?.id === station.id && isRadioPlaying ? 'text-primary' : 'text-white'
                        }`}>
                          {station.name}
                        </span>
                        {currentStation?.id === station.id && isRadioPlaying && (
                          <Radio className="w-3 h-3 text-primary animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mono-ui text-[8px] text-forest">
                        <span>{station.country}</span>
                        {station.bitrate > 0 && <span>• {station.bitrate}kbps</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current Playing Station */}
            <div className="p-4 md:p-6 bg-background-dark/90 backdrop-blur-md narvo-border-t">
              <div className="flex items-center justify-between mb-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold block">{t('discover.now_playing')}</span>
                  <p className="mono-ui text-[10px] md:text-xs text-white font-bold uppercase truncate">
                    {currentStation?.name || t('discover.select_station')}
                  </p>
                  <p className="mono-ui text-[8px] text-forest">
                    {currentStation?.country || '--'} {currentStation?.bitrate ? `// ${currentStation.bitrate}kbps` : ''}
                  </p>
                </div>
                <button 
                  onClick={toggleRadio}
                  disabled={!currentStation}
                  className={`w-12 h-12 md:w-14 md:h-14 narvo-border flex items-center justify-center transition-colors ${
                    currentStation 
                      ? 'bg-primary text-background-dark hover:bg-white' 
                      : 'bg-surface/20 text-forest cursor-not-allowed'
                  }`}
                  data-testid="radio-play-btn"
                >
                  {isRadioPlaying ? (
                    <Pause className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <Play className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                  )}
                </button>
              </div>
              
              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <SpeakerSlash className="w-4 h-4 text-forest" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={radioVolume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1 bg-forest/30 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary"
                  data-testid="radio-volume"
                />
                <SpeakerHigh className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DiscoverPage;

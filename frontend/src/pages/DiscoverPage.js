import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, PlayCircle, Pause } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Radio stations data
const RADIO_STATIONS = [
  { id: 'lagos', name: 'Lagos, NGA', station: 'COOL_FM 96.9', freq: '96.9', top: '33%', left: '25%' },
  { id: 'berlin', name: 'Berlin, DE', station: 'METROPOL FM', freq: '98.4', top: '45%', right: '33%' },
  { id: 'zurich', name: 'Zurich, CH', station: 'Alternative Radio', freq: '98.4', active: true },
];

// Podcast episodes - would come from API in production
const PODCAST_EPISODES = [
  { id: 'ep402', episode: 'EP. 402', title: 'The Geopolitical Shift: Arctic Routes', duration: '45:00', description: 'UNDERSTANDING_THE_OPENING_TRADE_ROUTES_INCIDENT_NORTH_POLE_ENVIRONMENTAL_IMPACT_REPORT_v4.' },
  { id: 'ep089', episode: 'EP. 089', title: 'Tech Horizons: Quantum Synthesis', duration: '22:15', description: 'EXCLUSIVE_BREAKTHROUGH_ZURICH_LABS_NEURAL_INTERFACE_READY_FOR_HUMAN_TRIALS_PHASE_1.' },
  { id: 'ep012', episode: 'EP. 012', title: 'Urban Architecture: Megacities', duration: '60:00', description: 'REIMAGINING_DENSE_METROPOLITAN_SPACES_NIGERIA_2050_INFRASTRUCTURE_PLANNING_DATA.' },
  { id: 'ep201', episode: 'EP. 201', title: 'Soundscapes: Amazon Rainforest', duration: '33:45', description: 'BINAURAL_FIELD_RECORDINGS_BIODIVERSITY_METRICS_AUDIO_SAMPLE_SET_A.' },
];

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [featuredNews, setFeaturedNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [podcastSort, setPodcastSort] = useState('latest');
  const [email, setEmail] = useState('');
  const { playTrack, currentTrack, isPlaying } = useAudio();

  useEffect(() => {
    fetch(`${API_URL}/api/news?limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) setFeaturedNews(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handlePlayFeatured = () => {
    if (featuredNews) {
      playTrack(featuredNews);
    }
  };

  const handlePlayPodcast = (podcast) => {
    playTrack({ id: podcast.id, title: podcast.title, summary: podcast.description });
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
                <span className="bg-primary text-background-dark px-2 md:px-3 py-1 mono-ui text-[9px] md:text-[10px] font-bold">LIVE_BROADCAST</span>
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
                  <span>[ START_TRANSMISSION ]</span>
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
              <h3 className="font-display text-lg md:text-2xl font-bold uppercase text-white tracking-tight">Deep Dive Podcasts</h3>
              <div className="flex items-center gap-1 md:gap-2 p-1 narvo-border bg-background-dark">
                <button 
                  onClick={() => setPodcastSort('latest')}
                  className={`px-2 md:px-4 py-1 mono-ui text-[9px] md:text-[10px] font-bold ${podcastSort === 'latest' ? 'bg-primary text-background-dark' : 'text-forest hover:text-white'}`}
                >
                  LATEST
                </button>
                <button 
                  onClick={() => setPodcastSort('popular')}
                  className={`px-2 md:px-4 py-1 mono-ui text-[9px] md:text-[10px] ${podcastSort === 'popular' ? 'bg-primary text-background-dark font-bold' : 'text-forest hover:text-white'}`}
                >
                  POPULAR
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
            <div className="p-4 md:p-8 narvo-border-b bg-background-dark sticky top-0 z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg md:text-2xl font-bold uppercase text-white tracking-tight">Radio Garden</h3>
                <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] mono-ui text-primary font-bold bg-primary/10 px-1.5 md:px-2 py-0.5 narvo-border">
                  <span className="w-1.5 h-1.5 bg-primary animate-pulse" />
                  GLOBAL_LIVE
                </div>
              </div>
              <p className="mono-ui text-[9px] md:text-[10px] text-forest">BROADCAST_RELAY_v2.1</p>
            </div>

            <div className="flex-1 relative overflow-hidden group min-h-[300px] md:min-h-[400px]">
              <div 
                className="absolute inset-0 bg-cover bg-center grayscale contrast-150 opacity-15"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800')" }}
              />
              <div 
                className="absolute inset-0 opacity-10" 
                style={{ backgroundImage: 'linear-gradient(#628141 1px, transparent 1px), linear-gradient(90deg, #628141 1px, transparent 1px)', backgroundSize: '30px 30px' }}
              />

              {/* Interactive Map Points */}
              <div className="absolute top-1/3 left-1/4 group/point cursor-pointer z-10">
                <div className="w-3 h-3 bg-primary narvo-border shadow-[0_0_10px_rgba(235,213,171,0.5)]" />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-background-dark narvo-border p-3 md:p-4 opacity-0 group-hover/point:opacity-100 transition-opacity whitespace-nowrap z-20">
                  <span className="font-display text-white text-xs md:text-sm block font-bold mb-1 uppercase">Lagos, NGA</span>
                  <span className="mono-ui text-primary text-[9px] md:text-[10px] block">COOL_FM 96.9</span>
                </div>
              </div>

              <div className="absolute bottom-1/2 right-1/3 group/point cursor-pointer z-10">
                <div className="w-3 h-3 bg-white narvo-border border-forest shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-background-dark narvo-border p-3 md:p-4 opacity-0 group-hover/point:opacity-100 transition-opacity whitespace-nowrap z-20">
                  <span className="font-display text-white text-xs md:text-sm block font-bold mb-1 uppercase">Berlin, DE</span>
                  <span className="mono-ui text-primary text-[9px] md:text-[10px] block">METROPOL FM</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-background-dark/90 backdrop-blur-md narvo-border-t z-30">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">CURRENT_FREQUENCY</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl md:text-4xl font-bold text-white leading-none">98.4</span>
                      <span className="mono-ui text-primary text-[10px] md:text-xs font-bold">MHZ</span>
                    </div>
                    <p className="mono-ui text-[9px] md:text-[10px] text-white/50 pt-1 md:pt-2 font-bold uppercase">Zurich Alternative Radio</p>
                  </div>
                  <button 
                    className="w-12 h-12 md:w-16 md:h-16 narvo-border bg-primary text-background-dark flex items-center justify-center hover:bg-white transition-colors group"
                    data-testid="radio-play-btn"
                  >
                    <Play className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats & Tools */}
        <div className="narvo-border-t grid grid-cols-2 lg:grid-cols-4 bg-background-dark shrink-0">
          <div className="p-4 md:p-6 narvo-border-r space-y-3 md:space-y-4">
            <span className="mono-ui text-[8px] md:text-[9px] text-primary font-bold">SIGNAL_ANALYSIS</span>
            <div className="flex items-end gap-1 h-16 md:h-20">
              <div className="bg-forest/30 w-full h-[40%]" />
              <div className="bg-forest/50 w-full h-[70%]" />
              <div className="bg-primary/70 w-full h-[90%]" />
              <div className="bg-primary w-full h-[60%]" />
              <div className="bg-forest/50 w-full h-[30%]" />
            </div>
          </div>
          <div className="p-4 md:p-6 narvo-border-r flex flex-col justify-between">
            <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold">SYSTEM_LOG</span>
            <div className="mono-ui text-[8px] md:text-[9px] text-white/70 space-y-1 md:space-y-2">
              <p className="text-primary">&gt; BROADCAST_STABLE</p>
              <p>&gt; BITRATE: 320 KBPS</p>
              <p>&gt; BUFFER: 100%</p>
            </div>
          </div>
          <div className="p-4 md:p-6 col-span-2 flex flex-col gap-3 md:gap-4">
            <span className="mono-ui text-[8px] md:text-[9px] text-primary font-bold">NEWSLETTER_SUBSCRIPTION</span>
            <div className="flex gap-2 h-9 md:h-10">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-surface/30 narvo-border px-3 md:px-4 mono-ui text-[9px] md:text-[10px] text-white placeholder-forest focus:outline-none focus:border-primary"
                placeholder="ENTER_SIGNAL_IDENTIFIER..."
                data-testid="newsletter-input"
              />
              <button className="bg-primary text-background-dark px-4 md:px-6 mono-ui text-[10px] md:text-[11px] font-bold hover:bg-white transition-colors">
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DiscoverPage;

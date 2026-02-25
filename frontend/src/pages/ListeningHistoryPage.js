import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, Waveform } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import Skeleton from '../components/Skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ListeningHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { playTrack } = useAudio();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = user?.id || 'guest';
    fetch(`${API_URL}/api/listening-history/${userId}?limit=30`)
      .then(r => r.json())
      .then(data => { setHistory(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?.id]);

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'JUST_NOW';
    if (diff < 3600) return `${Math.floor(diff / 60)}M_AGO`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}H_AGO`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}D_AGO`;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const groupByDate = (items) => {
    const groups = {};
    items.forEach(item => {
      const d = new Date(item.played_at);
      const key = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  };

  const grouped = groupByDate(history);

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll bg-background-dark min-h-0" data-testid="listening-history-page">
      <div className="p-4 md:p-8 lg:p-10 pb-20 md:pb-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8 narvo-border-b pb-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-content uppercase tracking-tight">
              LISTENING_HISTORY
            </h1>
            <p className="mono-ui text-[8px] md:text-[9px] text-forest font-bold mt-1">
              RECENTLY_PLAYED_BROADCASTS // TIMELINE
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest" />
            <span className="mono-ui text-[8px] text-forest">{history.length}_ENTRIES</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="narvo-border p-4 flex items-center gap-4">
                <Skeleton variant="text" className="w-10 h-10" />
                <div className="flex-1">
                  <Skeleton variant="text" className="w-48 h-4 mb-2" />
                  <Skeleton variant="text" className="w-32 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="narvo-border bg-surface/10 p-8 md:p-12 text-center">
            <Waveform className="w-12 h-12 text-forest/30 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-content uppercase mb-2">NO_HISTORY_YET</h3>
            <p className="mono-ui text-[9px] text-forest">Play a broadcast to see it appear here.</p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="w-2 h-2 bg-primary" />
                  <span className="mono-ui text-[9px] md:text-[10px] text-forest font-bold tracking-widest">
                    {dateLabel.toUpperCase()}
                  </span>
                  <div className="flex-1 h-px bg-forest/20" />
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={`${item.track_id}-${idx}`}
                      className="narvo-border p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:bg-surface/20 hover:border-forest transition-colors group cursor-pointer"
                      onClick={() => {
                        if (item.track_id) {
                          playTrack({ id: item.track_id, title: item.title, source: item.source });
                        }
                      }}
                      data-testid={`history-item-${idx}`}
                    >
                      {/* Play icon */}
                      <div className="w-9 h-9 md:w-10 md:h-10 narvo-border flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors">
                        <Play className="w-4 h-4 text-forest group-hover:text-background-dark" fill="currentColor" />
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-content text-xs md:text-sm font-display font-bold truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.source && (
                            <span className="mono-ui text-[7px] md:text-[8px] text-forest font-bold truncate">{item.source}</span>
                          )}
                          {item.category && (
                            <>
                              <span className="text-forest/30">/</span>
                              <span className="mono-ui text-[7px] md:text-[8px] text-primary">{item.category.toUpperCase()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <span className="mono-ui text-[7px] md:text-[8px] text-forest/50 shrink-0">
                        {formatTime(item.played_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ListeningHistoryPage;

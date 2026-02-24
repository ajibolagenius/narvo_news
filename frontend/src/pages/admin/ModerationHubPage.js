import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SquaresFour, List, Warning, CheckCircle, Question, DotsThree, CheckSquare, Flag, ArrowClockwise } from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ModerationHubPage = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');
  const [moderationItems, setModerationItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/moderation`),
        fetch(`${API_URL}/api/admin/stats`)
      ]);
      
      const [itemsData, statsData] = await Promise.all([
        itemsRes.json(),
        statsRes.json()
      ]);
      
      setModerationItems(itemsData);
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch moderation data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DISPUTED': return Warning;
      case 'VERIFIED': return CheckCircle;
      case 'UNVERIFIED': return Question;
      default: return Question;
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'DISPUTED':
        return { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500' };
      case 'VERIFIED':
        return { text: 'text-primary', bg: 'bg-primary', border: 'border-primary' };
      case 'UNVERIFIED':
      default:
        return { text: 'text-forest', bg: 'bg-forest', border: 'border-forest' };
    }
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background-dark" data-testid="moderation-hub-page">
      {/* Header */}
      <div className="px-8 py-6 narvo-border-b flex justify-between items-center bg-black/20 shrink-0">
        <div className="flex items-baseline gap-4">
          <h2 className="font-display text-2xl font-bold text-white uppercase tracking-tight">Incoming_Matrix</h2>
          <span className="mono-ui text-[9px] text-forest font-bold border border-forest px-2 py-0.5">LIVE_WATCH</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchData}
            className="w-10 h-10 narvo-border flex items-center justify-center text-forest hover:text-white transition-all"
            title="Refresh"
          >
            <ArrowClockwise className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`w-10 h-10 narvo-border flex items-center justify-center transition-all ${viewMode === 'grid' ? 'text-primary bg-forest/20' : 'text-forest hover:text-white'}`}
          >
            <SquaresFour className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`w-10 h-10 narvo-border flex items-center justify-center transition-all ${viewMode === 'list' ? 'text-primary bg-forest/20' : 'text-forest hover:text-white'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scroll p-8">
        <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
          {moderationItems.map((item, idx) => {
            const StatusIcon = getStatusIcon(item.status);
            const statusClasses = getStatusClasses(item.status);
            
            return (
              <article 
                key={idx}
                className={`narvo-border bg-surface/30 p-6 flex flex-col gap-6 relative group hover:border-primary transition-all`}
                data-testid={`moderation-card-${item.id}`}
              >
                {/* Status Bar */}
                <div className={`absolute top-0 left-0 w-1 h-full ${statusClasses.bg}`} />
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-forest/20 pb-4">
                  <div className="space-y-1">
                    <span className={`mono-ui text-[9px] font-bold flex items-center gap-1 ${statusClasses.text}`}>
                      <StatusIcon className="w-3 h-3" />
                      {item.status === 'DISPUTED' && '⚠ ALERT: '}
                      {item.status === 'VERIFIED' && '✔ '}
                      {item.status === 'UNVERIFIED' && '? '}
                      {item.status}
                    </span>
                    <p className="mono-ui text-[8px] text-forest font-bold">ID: {item.id} {'//'} {item.source}</p>
                  </div>
                  <span className="mono-ui text-[9px] text-forest font-bold">{item.timestamp}</span>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <h3 className="font-display text-xl font-bold text-white uppercase leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  {item.has_image && (
                    <div className="aspect-video narvo-border bg-black/40 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="mono-ui text-[9px] text-forest font-bold">MEDIA_PREVIEW</span>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-[11px] text-forest font-medium leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, tagIdx) => (
                      <span key={tagIdx} className="px-2 py-0.5 narvo-border text-forest mono-ui text-[8px] font-bold">
                        {tag}
                      </span>
                    ))}
                    <span className={`px-2 py-0.5 narvo-border ${statusClasses.text} ${statusClasses.border} mono-ui text-[8px] font-bold`}>
                      AI_CONF: {item.confidence}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 narvo-border-t">
                  {item.status === 'VERIFIED' ? (
                    <button className="w-full py-4 bg-primary mono-ui text-[10px] font-bold text-background-dark hover:bg-white transition-all uppercase flex items-center justify-center gap-3">
                      <CheckSquare className="w-4 h-4" />
                      PUBLISH_CONFIRMATION
                    </button>
                  ) : item.status === 'DISPUTED' ? (
                    <>
                      <button className="flex-1 py-3 narvo-border mono-ui text-[10px] font-bold text-white hover:bg-red-500 hover:border-red-500 transition-all uppercase flex items-center justify-center gap-2">
                        <Flag className="w-4 h-4" />
                        FLAG
                      </button>
                      <button className="flex-1 py-3 narvo-border mono-ui text-[10px] font-bold text-white hover:bg-forest transition-all uppercase">
                        IGNORE
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex-1 py-3 narvo-border mono-ui text-[10px] font-bold text-white hover:bg-forest transition-all uppercase">
                        ASSIGN
                      </button>
                      <button className="w-12 narvo-border flex items-center justify-center hover:bg-forest text-white transition-all">
                        <DotsThree className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="h-12 narvo-border-t bg-black/40 flex items-center justify-between px-8 mono-ui text-[9px] text-forest font-bold shrink-0">
        <div className="flex items-center gap-6">
          <span>QUEUE_TOTAL: <span className="text-white">{stats?.queue_total || 0}</span></span>
          <span>DISPUTED: <span className="text-red-500">{stats?.disputed || 0}</span></span>
          <span>VERIFIED: <span className="text-primary">{stats?.verified || 0}</span></span>
          <span>PENDING: <span className="text-forest">{stats?.pending || 0}</span></span>
        </div>
        <span>DUBAWA_API: <span className="text-primary">{stats?.dubawa_status || 'CHECKING'}</span> {'//'} LAST_SYNC: {stats?.last_sync || '--'}</span>
      </div>
    </main>
  );
};

export default ModerationHubPage;

import React, { useState } from 'react';
import { LayoutGrid, List, AlertTriangle, CheckCircle, HelpCircle, MoreHorizontal, CheckSquare, Flag } from 'lucide-react';

const ModerationHubPage = () => {
  const [viewMode, setViewMode] = useState('grid');

  const moderationItems = [
    {
      id: '#8821X',
      source: 'TW_X',
      status: 'DISPUTED',
      statusIcon: AlertTriangle,
      statusColor: 'red',
      title: 'Contested results in District 9 due to "irregularities"',
      description: 'Reports emerging from multiple accounts regarding polling station closures. Official commission silent. High velocity signal detected.',
      tags: ['#ELECTION2024'],
      confidence: '98%',
      time: '14:02 UTC',
    },
    {
      id: '#9942A',
      source: 'DIRECT',
      status: 'VERIFIED',
      statusIcon: CheckCircle,
      statusColor: 'primary',
      title: 'Dam levels stabilize after weekend rainfall cycle',
      description: 'Water authority confirms reservoir capacity returning to normal levels following seasonal precipitation.',
      tags: ['#INFRASTRUCTURE'],
      confidence: '99%',
      time: '13:58 UTC',
      hasImage: true,
    },
    {
      id: '#1102Z',
      source: 'FB_WATCH',
      status: 'UNVERIFIED',
      statusIcon: HelpCircle,
      statusColor: 'forest',
      title: 'Protest footage confirmed potential deepfake scan',
      description: 'Inconsistencies detected in background lighting and shadow vectors. Forensics team reassignment recommended.',
      tags: ['#DEEP_GEN', '#AI_SCAN'],
      confidence: '67%',
      time: '13:45 UTC',
      muted: true,
    },
    {
      id: '#5543B',
      source: 'REUTERS',
      status: 'VERIFIED',
      statusIcon: CheckCircle,
      statusColor: 'primary',
      title: 'Central Bank announces new monetary policy framework',
      description: 'Inflation targeting measures and interest rate adjustments effective next quarter.',
      tags: ['#ECONOMY', '#POLICY'],
      confidence: '100%',
      time: '13:30 UTC',
    },
    {
      id: '#7721C',
      source: 'LOCAL_NET',
      status: 'DISPUTED',
      statusIcon: AlertTriangle,
      statusColor: 'red',
      title: 'Viral health claims require fact-check verification',
      description: 'Multiple sources spreading unverified medical information. Cross-reference with health authority databases required.',
      tags: ['#HEALTH', '#MISINFO'],
      confidence: '45%',
      time: '13:15 UTC',
    },
  ];

  const getStatusClasses = (color) => {
    const classes = {
      red: { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500' },
      primary: { text: 'text-primary', bg: 'bg-primary', border: 'border-primary' },
      forest: { text: 'text-forest', bg: 'bg-forest', border: 'border-forest' },
    };
    return classes[color] || classes.forest;
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
            onClick={() => setViewMode('grid')}
            className={`w-10 h-10 narvo-border flex items-center justify-center transition-all ${viewMode === 'grid' ? 'text-primary bg-forest/20' : 'text-forest hover:text-white'}`}
          >
            <LayoutGrid className="w-5 h-5" />
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
            const StatusIcon = item.statusIcon;
            const statusClasses = getStatusClasses(item.statusColor);
            
            return (
              <article 
                key={idx}
                className={`narvo-border bg-surface/30 p-6 flex flex-col gap-6 relative group hover:border-primary transition-all ${item.muted ? 'opacity-70 hover:opacity-100' : ''}`}
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
                  <span className="mono-ui text-[9px] text-forest font-bold">{item.time}</span>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <h3 className="font-display text-xl font-bold text-white uppercase leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  {item.hasImage && (
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
                        <MoreHorizontal className="w-5 h-5" />
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
          <span>QUEUE_TOTAL: <span className="text-white">47</span></span>
          <span>DISPUTED: <span className="text-red-500">12</span></span>
          <span>VERIFIED: <span className="text-primary">28</span></span>
          <span>PENDING: <span className="text-forest">7</span></span>
        </div>
        <span>DUBAWA_API: <span className="text-primary">CONNECTED</span> {'//'} LAST_SYNC: 2MIN_AGO</span>
      </div>
    </main>
  );
};

export default ModerationHubPage;

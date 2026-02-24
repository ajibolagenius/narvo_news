import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Planet, ArrowCounterClockwise, GearSix, Broadcast, Plug, WarningCircle, WifiSlash, Funnel } from '@phosphor-icons/react';

const EmptyState = ({ 
  title = 'TRANSMISSION HALTED',
  message = 'The news feed matrix is currently empty. We are unable to establish a secure connection to the broadcast server.',
  errorCode = '0x4F_NULL',
  showSlots = true,
  onRefresh,
  onDiagnostics,
  variant = 'default' // 'default', 'search', 'saved', 'offline'
}) => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleDiagnostics = () => {
    if (onDiagnostics) {
      onDiagnostics();
    } else {
      navigate('/settings');
    }
  };

  const slots = [
    { id: 'SLOT_01', icon: RadioTower, opacity: 'opacity-40' },
    { id: 'SLOT_02', icon: Unplug, opacity: 'opacity-30' },
    { id: 'SLOT_03', icon: AlertCircle, opacity: 'opacity-20' },
    { id: 'SLOT_04', icon: WifiOff, opacity: 'opacity-10' },
  ];

  const variantConfig = {
    default: {
      title: 'TRANSMISSION HALTED',
      message: 'The news feed matrix is currently empty. We are unable to establish a secure connection to the broadcast server.',
      errorCode: '0x4F_NULL',
      primaryAction: 'INITIATE REFRESH',
      secondaryAction: 'SYSTEM DIAGNOSTICS',
    },
    search: {
      title: 'NO RESULTS FOUND',
      message: 'Your search query returned zero matches. Try adjusting your filters or using different keywords.',
      errorCode: '0x00_EMPTY_SET',
      primaryAction: 'CLEAR FILTERS',
      secondaryAction: 'BROWSE ALL',
    },
    saved: {
      title: 'ARCHIVE EMPTY',
      message: 'You have not saved any stories yet. Bookmark articles from the feed to access them offline.',
      errorCode: '0x00_NO_SAVES',
      primaryAction: 'GO TO FEED',
      secondaryAction: 'BROWSE TRENDING',
    },
    offline: {
      title: 'NO CACHED DATA',
      message: 'No offline content is available. Download stories while online to access them later.',
      errorCode: '0x00_CACHE_EMPTY',
      primaryAction: 'GO ONLINE',
      secondaryAction: 'MANAGE STORAGE',
    },
  };

  const config = variantConfig[variant] || variantConfig.default;

  return (
    <div className="relative flex-1 flex flex-col p-8 gap-8" data-testid="empty-state">
      {/* Matrix Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: 'linear-gradient(#628141 1px, transparent 1px), linear-gradient(90deg, #628141 1px, transparent 1px)', 
          backgroundSize: '60px 60px' 
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-end pb-4 narvo-border-b relative z-10">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">GLOBAL FEED MATRIX</h2>
          <p className="mono-ui text-[10px] text-forest font-bold mt-1">SECTOR_7 {'//'} NULL_TRANSMISSION</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 md:px-6 py-3 narvo-border mono-ui text-[10px] font-bold text-forest hover:text-white transition-all flex items-center gap-2 uppercase">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">FILTER</span>
          </button>
          <button 
            onClick={handleRefresh}
            className="px-4 md:px-6 py-3 bg-primary mono-ui text-[10px] font-bold text-background-dark hover:bg-white transition-all flex items-center gap-2 uppercase"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">RECONNECT</span>
          </button>
        </div>
      </div>

      {/* Slot Grid */}
      {showSlots && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 flex-1 relative z-10">
          {slots.map((slot, idx) => {
            const Icon = slot.icon;
            return (
              <div 
                key={idx}
                className={`narvo-border border-dashed p-4 md:p-6 flex flex-col justify-between bg-black/20 ${slot.opacity} hover:opacity-100 transition-opacity min-h-[120px] md:min-h-[150px]`}
              >
                <div className="flex justify-between items-start">
                  <span className="mono-ui text-[8px] text-forest font-bold tracking-widest">{slot.id}</span>
                  <Icon className="w-5 h-5 text-forest" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <span className="mono-ui text-[8px] md:text-[9px] text-forest font-bold text-center">NO_SIGNAL_DETECTED</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Central Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="bg-background-dark narvo-border p-8 md:p-12 max-w-lg w-full mx-4 text-center shadow-2xl pointer-events-auto backdrop-blur-md">
          {/* Icon */}
          <div className="mb-6 md:mb-8 flex justify-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-surface narvo-border border-dashed flex items-center justify-center relative">
              <div className="absolute inset-0 border border-primary/20 animate-ping" />
              <Satellite className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            </div>
          </div>

          {/* Title & Message */}
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-tighter">
            {title || config.title}
          </h3>
          <p className="text-forest text-sm mono-ui leading-relaxed mb-8 md:mb-10 lowercase">
            {message || config.message}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleRefresh}
              className="h-12 md:h-14 px-6 md:px-8 bg-primary text-background-dark font-bold mono-ui text-[10px] md:text-[11px] hover:bg-white transition-all flex items-center justify-center gap-3"
              data-testid="empty-state-refresh-btn"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              {config.primaryAction}
            </button>
            <button 
              onClick={handleDiagnostics}
              className="h-12 md:h-14 px-6 md:px-8 narvo-border text-primary font-bold mono-ui text-[10px] md:text-[11px] hover:bg-primary hover:text-background-dark transition-all"
              data-testid="empty-state-diagnostics-btn"
            >
              {config.secondaryAction}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 md:mt-10 pt-6 narvo-border-t flex justify-between items-center text-[8px] md:text-[9px] mono-ui font-bold text-forest">
            <span>ERR_CODE: {errorCode || config.errorCode}</span>
            <span>NARVO_SYS_V2.6</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;

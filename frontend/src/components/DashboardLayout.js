import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import AudioPlayerBar from './AudioPlayerBar';
import { BreakingNewsBanner } from './BreakingNews';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('narvo_sidebar');
    // Default to open (true) - user preference takes priority if saved
    if (saved !== null) return saved === 'true';
    return true; // Default open
  });

  useEffect(() => {
    localStorage.setItem('narvo_sidebar', String(sidebarOpen));
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(p => !p);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[var(--color-bg)]" data-testid="dashboard-layout">
      <DashboardHeader onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <BreakingNewsBanner />
      <div className="flex-1 flex overflow-hidden relative">
        <DashboardSidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onToggle={toggleSidebar}
        />
        <Outlet />
      </div>
      <AudioPlayerBar />
      {/* Mobile Bottom Nav */}
      <DashboardSidebar mobile />
    </div>
  );
};

export default DashboardLayout;

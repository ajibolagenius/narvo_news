import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import AudioPlayerBar from './AudioPlayerBar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('narvo_sidebar');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('narvo_sidebar', String(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background-dark" data-testid="dashboard-layout">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(p => !p)} />
      <div className="flex-1 flex overflow-hidden relative">
        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Outlet />
      </div>
      <AudioPlayerBar />
      {/* Mobile Bottom Nav */}
      <DashboardSidebar mobile />
    </div>
  );
};

export default DashboardLayout;

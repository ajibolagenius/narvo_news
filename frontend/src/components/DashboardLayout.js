import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import AudioPlayerBar from './AudioPlayerBar';

const DashboardLayout = () => {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background-dark" data-testid="dashboard-layout">
      <DashboardHeader />
      <div className="flex-1 flex overflow-hidden">
        <DashboardSidebar />
        <Outlet />
      </div>
      <AudioPlayerBar />
    </div>
  );
};

export default DashboardLayout;

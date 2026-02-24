import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Clock, WifiHigh, Shield } from '@phosphor-icons/react';

const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background-dark" data-testid="admin-layout">
      {/* Admin Header */}
      <header className="h-14 narvo-border-b bg-black/40 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Clock className="w-6 h-6 text-primary" />
            <span className="font-display text-xl font-bold text-content tracking-tight">NARVO</span>
          </button>
          <div className="h-6 w-px bg-forest/30" />
          <span className="mono-ui text-xs text-red-500 font-bold tracking-widest">ADMIN_CONSOLE</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 mono-ui text-[9px] font-bold">
            <div className="flex items-center gap-2 text-forest">
              <WifiHigh className="w-4 h-4" />
              <span>SIGNAL: <span className="text-primary">100%</span></span>
            </div>
            <div className="flex items-center gap-2 text-forest">
              <Shield className="w-4 h-4" />
              <span>AUTH: <span className="text-primary">LEVEL_5</span></span>
            </div>
          </div>
          <div className="mono-ui text-[10px] text-forest font-bold">
            UTC: {new Date().toISOString().slice(11, 19)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar />
        <Outlet />
      </div>

      {/* Admin Footer */}
      <footer className="h-10 narvo-border-t bg-black/40 flex items-center justify-between px-6 mono-ui text-[8px] text-forest font-bold">
        <span>ADMIN_PROTOCOL: V2.4 // RESTRICTED_ACCESS</span>
        <span>ENCRYPTION: AES-256-GCM // SESSION_ACTIVE</span>
      </footer>
    </div>
  );
};

export default AdminLayout;

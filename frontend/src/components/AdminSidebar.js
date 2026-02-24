import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, FileText, Mic, ShieldCheck, ChevronLeft, Radio } from 'lucide-react';

const adminNavItems = [
  { icon: Activity, label: 'Operation Hub', path: '/admin/operations' },
  { icon: FileText, label: 'Curation Console', path: '/admin/curation' },
  { icon: Mic, label: 'Voice Management', path: '/admin/voices' },
  { icon: ShieldCheck, label: 'Moderation Zone', path: '/admin/moderation' },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 narvo-border-r bg-black/40 flex flex-col shrink-0" data-testid="admin-sidebar">
      {/* Admin Header */}
      <div className="p-6 narvo-border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 narvo-border border-red-500/50 flex items-center justify-center">
            <Radio className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white uppercase">Admin</h2>
            <span className="mono-ui text-[8px] text-red-500 font-bold">CONTROL_CENTER</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2 narvo-border text-forest mono-ui text-[9px] font-bold hover:text-white hover:bg-forest/20 transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          BACK_TO_APP
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <span className="mono-ui text-[8px] text-forest/50 font-bold tracking-widest px-3 mb-2 block">
          MODULES
        </span>
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 transition-all text-left
                ${isActive 
                  ? 'bg-primary/10 text-primary narvo-border border-primary/50' 
                  : 'text-forest hover:text-white hover:bg-surface/20 narvo-border border-transparent'
                }
              `}
              data-testid={`admin-nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="mono-ui text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Status Footer */}
      <div className="p-4 narvo-border-t bg-black/20">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="mono-ui text-[8px] text-forest font-bold">SYSTEM_STATUS</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary animate-pulse rounded-full" />
              <span className="mono-ui text-[8px] text-primary font-bold">ONLINE</span>
            </div>
          </div>
          <div className="space-y-2 mono-ui text-[8px] text-forest">
            <div className="flex justify-between">
              <span>UPTIME</span>
              <span className="text-white">99.98%</span>
            </div>
            <div className="flex justify-between">
              <span>API_HEALTH</span>
              <span className="text-primary">NOMINAL</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

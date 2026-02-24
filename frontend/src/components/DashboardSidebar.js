import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, Activity, Bookmark, Search, Compass, WifiOff, Settings, User, Mic, Monitor, Accessibility, ChevronDown, Shield } from 'lucide-react';

const getNavItems = (t) => [
  { icon: LayoutGrid, label: t('nav.feed'), path: '/dashboard' },
  { icon: Compass, label: t('nav.discover'), path: '/discover' },
  { icon: Search, label: t('nav.search'), path: '/search' },
  { icon: Bookmark, label: t('nav.saved'), path: '/saved' },
  { icon: Activity, label: t('nav.briefing'), path: '/briefing' },
  { icon: WifiOff, label: t('nav.offline'), path: '/offline' },
];

const settingsSubNav = [
  { icon: User, label: 'Account', path: '/account' },
  { icon: Mic, label: 'Voices', path: '/voices' },
  { icon: Monitor, label: 'System', path: '/system' },
  { icon: Accessibility, label: 'Access', path: '/accessibility' },
];

const DashboardSidebar = ({ open, onClose, mobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const navItems = getNavItems(t);
  const [settingsExpanded, setSettingsExpanded] = useState(
    settingsSubNav.some(item => location.pathname === item.path) || location.pathname === '/settings'
  );

  const isSettingsActive = settingsSubNav.some(item => location.pathname === item.path) || location.pathname === '/settings';

  // Mobile bottom tab bar
  if (mobile) {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-background-dark narvo-border-t flex items-center justify-around z-30" data-testid="mobile-bottom-nav">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 transition-colors ${isActive ? 'text-primary' : 'text-forest'}`}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5" />
              <span className="mono-ui text-[8px] uppercase">{item.label}</span>
            </button>
          );
        })}
        <button 
          onClick={() => navigate('/account')} 
          className={`flex flex-col items-center gap-0.5 ${isSettingsActive ? 'text-primary' : 'text-forest'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="mono-ui text-[8px] uppercase">More</span>
        </button>
      </nav>
    );
  }

  // Desktop sidebar (collapsible)
  return (
    <>
      {/* Backdrop on mobile for expanded sidebar */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-20" onClick={onClose} />
      )}

      <aside
        className={`
          hidden md:flex flex-col narvo-border-r bg-background-dark z-10 shrink-0 transition-all duration-300
          ${open ? 'w-52' : 'w-16'}
        `}
        data-testid="dashboard-sidebar"
      >
        <div className="flex-1 flex flex-col py-4 gap-1 overflow-y-auto custom-scroll">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex items-center gap-3 transition-all mx-2 group
                  ${open ? 'px-4 py-3' : 'px-0 py-3 justify-center'}
                  ${isActive ? 'text-primary bg-primary/5 narvo-border' : 'text-forest hover:text-primary hover:bg-surface/30'}
                `}
                title={item.label}
                data-testid={`sidebar-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {open && <span className="mono-ui text-xs font-bold uppercase tracking-wider truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Settings Section */}
        <div className="narvo-border-t py-3 flex flex-col gap-1">
          <div className="flex items-center mx-2">
            <button
              onClick={() => navigate('/settings')}
              className={`flex items-center gap-3 transition-all flex-1 ${isSettingsActive ? 'text-primary bg-primary/5 narvo-border' : 'text-forest hover:text-primary hover:bg-surface/30'} ${open ? 'px-4 py-3' : 'py-3 justify-center'}`}
              title="Settings Hub"
            >
              <Settings className="w-5 h-5 shrink-0" />
              {open && <span className="mono-ui text-xs uppercase tracking-wider">{t('nav.settings')}</span>}
            </button>
            {open && (
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className="p-3 text-forest hover:text-primary transition-colors"
                title={settingsExpanded ? "Collapse" : "Expand"}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${settingsExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          
          {/* Settings Sub-nav (only when expanded) */}
          {open && settingsExpanded && (
            <div className="ml-4 space-y-1 mt-1">
              {settingsSubNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`
                      flex items-center gap-3 px-4 py-2 mx-2 transition-all w-full text-left
                      ${isActive ? 'text-primary' : 'text-forest/70 hover:text-primary'}
                    `}
                    data-testid={`sidebar-${item.label.toLowerCase()}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="mono-ui text-[10px] font-bold uppercase tracking-wider truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Section */}
        <div className="narvo-border-t py-3">
          <button
            onClick={() => navigate('/admin/operations')}
            className={`flex items-center gap-3 transition-all mx-2 ${location.pathname.startsWith('/admin') ? 'text-red-500 bg-red-500/10 narvo-border border-red-500/50' : 'text-forest hover:text-red-500 hover:bg-red-500/5'} ${open ? 'px-4 py-3' : 'py-3 justify-center'}`}
            title="Admin Console"
            data-testid="sidebar-admin"
          >
            <Shield className="w-5 h-5 shrink-0" />
            {open && <span className="mono-ui text-xs uppercase tracking-wider">{t('nav.admin')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;

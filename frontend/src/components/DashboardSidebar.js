import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Activity, FolderOpen, Globe, Settings, Bell, Bookmark } from 'lucide-react';

const navItems = [
  { icon: LayoutGrid, title: 'Primary Stream', path: '/dashboard' },
  { icon: Activity, title: 'Morning Briefing', path: '/briefing' },
  { icon: Bookmark, title: 'Saved Stories', path: '/bookmarks' },
  { icon: FolderOpen, title: 'Voice Studio', path: '/voices' },
  { icon: Globe, title: 'Search', path: '/search' },
];

const bottomItems = [
  { icon: Settings, title: 'Settings', path: '/settings' },
  { icon: Bell, title: 'Notifications', path: '/dashboard' },
];

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-16 narvo-border-r h-full flex flex-col items-center py-6 gap-8 bg-background-dark z-10 shrink-0" data-testid="dashboard-sidebar">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`transition-colors ${isActive ? 'text-primary' : 'text-forest hover:text-primary'}`}
            title={item.title}
            data-testid={`sidebar-${item.title.toLowerCase().replace(/\s/g, '-')}`}
          >
            <Icon className="w-6 h-6" />
          </button>
        );
      })}
      <div className="mt-auto flex flex-col gap-6">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className="text-forest hover:text-primary transition-colors"
              title={item.title}
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default DashboardSidebar;

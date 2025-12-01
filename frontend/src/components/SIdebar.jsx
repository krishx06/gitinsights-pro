import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  User, 
  LayoutDashboard, 
  Users, 
  FolderGit2, 
  Lightbulb, 
  Settings,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: Search, label: 'Search', path: '/search' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Team', path: '/team' },
    { icon: FolderGit2, label: 'Repository', path: '/repository' },
    { icon: Lightbulb, label: 'Insights', path: '/insights' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 dark:bg-gray-700 rounded-lg text-white"
      >
        {collapsed ? <Menu size={24} /> : <X size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-white dark:bg-[#1a1f2e] border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 z-40
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FolderGit2 size={20} className="text-white" />
            </div>
            {!collapsed && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                DevPulse
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
};

export default Sidebar;
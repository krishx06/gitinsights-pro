import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search,
  BarChart3, 
  GitPullRequest, 
  Lightbulb, 
  Blocks, 
  Settings,
  Menu,
  X,
  Github
} from 'lucide-react';
import Navbar from './Navbar';

const Layout = ({ user, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: BarChart3, label: 'Repositories', path: '/repositories' },
    { icon: GitPullRequest, label: 'Pull Requests', path: '/pull-requests' },
    { icon: Lightbulb, label: 'Insights', path: '/insights' },
    { icon: Blocks, label: 'Builder', path: '/builder'},
    { icon: Blocks, label: 'Team', path: '/team' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg border"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-card border-r z-40
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 w-64
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b flex items-center gap-3">
          <Github className="text-primary" size={32} />
          <span className="text-xl font-bold">GitInsights Pro</span>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <p className="text-xs text-muted-foreground mb-2 px-3">Navigation</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Use Navbar Component */}
        <Navbar user={user} logout={onLogout} />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </div>
  );
};

export default Layout;
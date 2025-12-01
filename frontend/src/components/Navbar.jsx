import React, { useState } from 'react';
import { Bell, Palette, LogOut, Check } from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';

const Navbar = ({ user, logout }) => {
  const { theme, changeTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1 max-w-md lg:ml-12 lg:mr-0">
          {/* Search will be on specific pages */}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
              title="Change theme"
            >
              <Palette size={20} />
            </button>

            {/* Theme Dropdown */}
            {showThemeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemeMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <p className="text-xs font-medium text-muted-foreground px-2">Select Theme</p>
                  </div>
                  <div className="p-1">
                    {Object.entries(THEMES).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => {
                          changeTheme(key);
                          setShowThemeMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
                      >
                        <span className="text-sm">{value.name}</span>
                        {theme === key && (
                          <Check size={16} className="text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-9 h-9 rounded-full ring-2 ring-border"
              />
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
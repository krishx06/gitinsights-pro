import React from 'react';
import { Bell, Sun, Moon, User, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <input
            type="text"
            placeholder="Search users, repos..."
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 ml-6">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
          </button>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
              />
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
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
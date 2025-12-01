import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Available themes with their configurations
export const THEMES = {
  light: {
    name: 'Light',
    class: 'light',
  },
  dark: {
    name: 'Dark',
    class: 'dark',
  },
  rose: {
    name: 'Rose',
    class: 'rose',
  },
  green: {
    name: 'Green',
    class: 'green',
  },
  neutral: {
    name: 'Neutral',
    class: 'neutral',
  },
  nord: {
    name: 'Nord',
    class: 'nord',
  },
  dracula: {
    name: 'Dracula',
    class: 'dracula',
  },
  tokyoNight: {
    name: 'Tokyo Night',
    class: 'tokyo-night',
  },
  tokyoStorm: {
    name: 'Tokyo Storm',
    class: 'tokyo-storm',
  },
  amber: {
    name: 'Amber',
    class: 'amber',
  },
  crimson: {
    name: 'Crimson',
    class: 'crimson',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Remove all theme classes
    const root = document.documentElement;
    Object.values(THEMES).forEach(t => root.classList.remove(t.class));
    
    // Add current theme class
    const currentTheme = THEMES[theme];
    if (currentTheme) {
      root.classList.add(currentTheme.class);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const changeTheme = (newTheme) => {
    if (THEMES[newTheme]) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
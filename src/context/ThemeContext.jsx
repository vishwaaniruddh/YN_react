import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark'); // default to dark

  useEffect(() => {
    // Fetch theme setting from the API
    fetch(`${API_BASE_URL}/settings.php`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.theme_mode) {
          setTheme(data.data.theme_mode);
        }
      })
      .catch(err => {
        console.error('Failed to fetch theme settings:', err);
      });
  }, []);

  // Apply data-theme attribute to <html> whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

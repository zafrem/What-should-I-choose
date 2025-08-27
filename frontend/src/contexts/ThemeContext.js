import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const THEME_NAMES = {
  GREEN: 'green',
  RED: 'red',
  BLUE: 'blue',
  PURPLE: 'purple',
  ORANGE: 'orange',
  PINK: 'pink',
  CYAN: 'cyan',
  RAINBOW: 'rainbow'
};

const createCustomTheme = (themeName) => {
  const themeConfigs = {
    [THEME_NAMES.GREEN]: {
      primary: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
      secondary: { main: '#66bb6a', light: '#a5d6a7', dark: '#43a047' },
      background: { default: '#e8f5e8', paper: '#ffffff' },
      accent: '#2e7d32'
    },
    [THEME_NAMES.RED]: {
      primary: { main: '#d32f2f', light: '#ef5350', dark: '#c62828' },
      secondary: { main: '#f44336', light: '#ffcdd2', dark: '#d32f2f' },
      background: { default: '#ffebee', paper: '#ffffff' },
      accent: '#b71c1c'
    },
    [THEME_NAMES.BLUE]: {
      primary: { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' },
      secondary: { main: '#03a9f4', light: '#b3e5fc', dark: '#0277bd' },
      background: { default: '#e3f2fd', paper: '#ffffff' },
      accent: '#0d47a1'
    },
    [THEME_NAMES.PURPLE]: {
      primary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2' },
      secondary: { main: '#ab47bc', light: '#e1bee7', dark: '#8e24aa' },
      background: { default: '#f3e5f5', paper: '#ffffff' },
      accent: '#4a148c'
    },
    [THEME_NAMES.ORANGE]: {
      primary: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
      secondary: { main: '#ffa726', light: '#ffe0b2', dark: '#fb8c00' },
      background: { default: '#fff3e0', paper: '#ffffff' },
      accent: '#e65100'
    },
    [THEME_NAMES.PINK]: {
      primary: { main: '#e91e63', light: '#f06292', dark: '#c2185b' },
      secondary: { main: '#f48fb1', light: '#fce4ec', dark: '#e91e63' },
      background: { default: '#fce4ec', paper: '#ffffff' },
      accent: '#880e4f'
    },
    [THEME_NAMES.CYAN]: {
      primary: { main: '#00bcd4', light: '#4dd0e1', dark: '#0097a7' },
      secondary: { main: '#26c6da', light: '#b2ebf2', dark: '#00acc1' },
      background: { default: '#e0f2f1', paper: '#ffffff' },
      accent: '#006064'
    },
    [THEME_NAMES.RAINBOW]: {
      primary: { 
        main: '#ff6b6b',
        light: '#ffa8a8', 
        dark: '#cc5555'
      },
      secondary: { 
        main: '#4ecdc4', 
        light: '#7dd3db', 
        dark: '#3ea39d' 
      },
      background: { 
        default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        paper: '#ffffff' 
      },
      accent: '#45b7d1',
      rainbow: true
    }
  };

  const config = themeConfigs[themeName] || themeConfigs[THEME_NAMES.GREEN];

  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: config.primary || { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
      secondary: config.secondary || { main: '#66bb6a', light: '#a5d6a7', dark: '#43a047' },
      background: config.background || { default: '#e8f5e8', paper: '#ffffff' },
    },
    typography: {
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: config.rainbow ? {
            background: config.background.default,
            minHeight: '100vh'
          } : {}
        }
      },
      MuiCard: {
        styleOverrides: {
          root: config.rainbow ? {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          } : {}
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: config.rainbow ? {
            background: 'linear-gradient(45deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 3s ease infinite'
          } : {}
        }
      }
    },
    customProperties: {
      themeName,
      isRainbow: config.rainbow,
      accent: config.accent
    }
  });
  
  // Add custom properties to palette after theme creation
  if (config.accent) {
    theme.palette.accent = config.accent;
  }
  if (config.rainbow) {
    theme.palette.rainbow = config.rainbow;
  }
  
  return theme;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('selectedTheme') || THEME_NAMES.GREEN;
  });

  const [muiTheme, setMuiTheme] = useState(() => createCustomTheme(currentTheme));

  useEffect(() => {
    const newTheme = createCustomTheme(currentTheme);
    setMuiTheme(newTheme);
    localStorage.setItem('selectedTheme', currentTheme);

    if (currentTheme === THEME_NAMES.RAINBOW) {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .rainbow-text {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease infinite;
        }
        
        .rainbow-border {
          border: 2px solid;
          border-image: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57) 1;
        }
      `;
      style.id = 'rainbow-styles';
      
      const existingStyle = document.getElementById('rainbow-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      document.head.appendChild(style);
    } else {
      const existingStyle = document.getElementById('rainbow-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (Object.values(THEME_NAMES).includes(themeName)) {
      setCurrentTheme(themeName);
    }
  };

  const getThemeDisplayName = (themeName) => {
    const displayNames = {
      [THEME_NAMES.GREEN]: 'Forest Green',
      [THEME_NAMES.RED]: 'Cherry Red',
      [THEME_NAMES.BLUE]: 'Ocean Blue',
      [THEME_NAMES.PURPLE]: 'Royal Purple',
      [THEME_NAMES.ORANGE]: 'Sunset Orange',
      [THEME_NAMES.PINK]: 'Blossom Pink',
      [THEME_NAMES.CYAN]: 'Tropical Cyan',
      [THEME_NAMES.RAINBOW]: 'Rainbow Magic'
    };
    return displayNames[themeName] || themeName;
  };

  const getAllThemes = () => {
    return Object.values(THEME_NAMES).map(theme => ({
      value: theme,
      label: getThemeDisplayName(theme),
      isRainbow: theme === THEME_NAMES.RAINBOW
    }));
  };

  const value = {
    currentTheme,
    muiTheme,
    changeTheme,
    getThemeDisplayName,
    getAllThemes,
    isRainbowTheme: currentTheme === THEME_NAMES.RAINBOW
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
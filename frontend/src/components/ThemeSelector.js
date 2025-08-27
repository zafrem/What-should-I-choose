import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  Typography,
  Chip,
  useTheme as useMuiTheme
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentTheme, changeTheme, getAllThemes, isRainbowTheme } = useTheme();
  const muiTheme = useMuiTheme();
  
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (themeName) => {
    changeTheme(themeName);
    handleClose();
  };

  const getThemePreviewColor = (themeName) => {
    const colors = {
      green: '#4caf50',
      red: '#d32f2f',
      blue: '#2196f3',
      purple: '#9c27b0',
      orange: '#ff9800',
      pink: '#e91e63',
      cyan: '#00bcd4',
      rainbow: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)'
    };
    return colors[themeName] || colors.green;
  };

  return (
    <>
      <Tooltip title="Change Theme">
        <IconButton
          onClick={handleClick}
          sx={{
            color: 'inherit',
            ...(isRainbowTheme && {
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 3s ease infinite',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
                backgroundSize: '200% 200%',
              }
            })
          }}
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxWidth: 280,
            ...(isRainbowTheme && {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            })
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ px: 1, pb: 1, fontWeight: 600 }}>
            Choose Theme
          </Typography>
          
          {getAllThemes().map((theme) => (
            <MenuItem
              key={theme.value}
              onClick={() => handleThemeSelect(theme.value)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 48
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: getThemePreviewColor(theme.value),
                    border: '2px solid',
                    borderColor: theme.value === currentTheme ? (muiTheme?.palette?.primary?.main || '#4caf50') : 'transparent',
                    ...(theme.isRainbow && {
                      backgroundSize: '200% 200%',
                      animation: 'gradientShift 3s ease infinite'
                    })
                  }}
                />
                
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {theme.label}
                  </Typography>
                  {theme.isRainbow && (
                    <Chip
                      label="Special"
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.65rem',
                        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                        color: 'white',
                        '& .MuiChip-label': { px: 0.5 }
                      }}
                    />
                  )}
                  {theme.value === 'green' && (
                    <Chip
                      label="Default"
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.65rem',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        color: '#2e7d32',
                        '& .MuiChip-label': { px: 0.5 }
                      }}
                    />
                  )}
                </Box>
              </Box>
              
              {theme.value === currentTheme && (
                <CheckIcon
                  sx={{
                    color: muiTheme?.palette?.primary?.main || '#4caf50',
                    fontSize: 20
                  }}
                />
              )}
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </>
  );
};

export default ThemeSelector;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
} from '@mui/material';

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Green theme colors (hardcoded to avoid theme errors)
  const primaryMain = '#4caf50';
  const primaryLight = '#81c784';
  const primaryDark = '#388e3c';
  const secondaryMain = '#66bb6a';
  const secondaryLight = '#a5d6a7';
  const backgroundDefault = '#e8f5e8';

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${backgroundDefault} 0%, ${secondaryLight} 25%, ${secondaryMain} 50%, ${primaryLight} 75%, ${primaryMain} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle green overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, ${primaryMain}10 0%, ${primaryLight}20 25%, ${secondaryLight}30 50%, ${secondaryMain}20 75%, ${primaryDark}10 100%)`,
          zIndex: 1,
        }}
      />

      {/* Header with sign-in/sign-up buttons */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleSignIn}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            Sign In
          </Button>
          <Button
            variant="contained"
            onClick={handleSignUp}
            sx={{
              backgroundColor: primaryMain,
              '&:hover': {
                backgroundColor: primaryDark,
              },
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Box>

      {/* Main content */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 120px)',
          textAlign: 'center',
        }}
      >
        {/* Subtle green element in center */}
        <Box
          sx={{
            width: 300,
            height: 150,
            background: `linear-gradient(90deg, ${primaryMain}4D 0%, ${primaryLight}4D 25%, ${secondaryLight}4D 50%, ${secondaryMain}4D 75%, ${primaryDark}4D 100%)`,
            borderRadius: '50%',
            mb: 4,
            opacity: 0.6,
            transform: 'rotate(-15deg)',
            filter: 'blur(1px)',
          }}
        />

        <Paper
          elevation={3}
          sx={{
            p: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            maxWidth: 600,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${primaryMain} 30%, ${primaryDark} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            A-Z Planning
          </Typography>
          
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              color: 'text.primary',
              mb: 3,
            }}
          >
            Plan Everything from A to Z
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Organize your projects, goals, and ideas with our comprehensive planning system. 
            Break down complex tasks into manageable steps and track your progress from start to finish.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleSignIn}
            sx={{
              backgroundColor: primaryMain,
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: primaryDark,
              },
            }}
          >
            Get Started
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;
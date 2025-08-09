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
        background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 15%, #ca8a04 30%, #16a34a 45%, #0284c7 60%, #7c3aed 75%, #dc2626 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle rainbow overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(220, 38, 38, 0.9) 0%, rgba(234, 88, 12, 0.8) 20%, rgba(202, 138, 4, 0.7) 40%, rgba(22, 163, 74, 0.7) 60%, rgba(2, 132, 199, 0.8) 80%, rgba(124, 58, 237, 0.9) 100%)',
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
              backgroundColor: 'rgba(220, 38, 38, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(220, 38, 38, 1)',
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
        {/* Subtle rainbow element in center */}
        <Box
          sx={{
            width: 300,
            height: 150,
            background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.3) 0%, rgba(234, 88, 12, 0.3) 16.67%, rgba(202, 138, 4, 0.3) 33.33%, rgba(22, 163, 74, 0.3) 50%, rgba(2, 132, 199, 0.3) 66.67%, rgba(124, 58, 237, 0.3) 83.33%, rgba(220, 38, 38, 0.3) 100%)',
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
              background: 'linear-gradient(45deg, #dc2626 30%, #ea580c 90%)',
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
              backgroundColor: '#dc2626',
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: '#b91c1c',
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